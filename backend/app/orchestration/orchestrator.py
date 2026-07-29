import asyncio
import logging
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.models.research import ResearchSession, ResearchStatus, ResearchTask, Source, Claim, Evidence
from app.models.settings import UserSettings
from app.services.search import SearchManager
from app.services.document import DocumentService
from app.services.research import ResearchService, events
from app.services.providers import build_providers
from app.orchestration.state import ResearchState
from app.orchestration.task_manager import TaskManager
from app.orchestration.agents.planner import PlannerAgent
from app.orchestration.agents.search_agent import SearchAgent
from app.orchestration.agents.evidence import EvidenceAnalyzer
from app.orchestration.agents.claims import ClaimGenerator
from app.orchestration.agents.verifier import ClaimVerifier
from app.orchestration.agents.gap_detector import GapDetector
from app.orchestration.agents.synthesizer import Synthesizer

logger = logging.getLogger(__name__)


async def run_research(session_id: str, session_maker: async_sessionmaker[AsyncSession]):
    async with session_maker() as db:
        try:
            research = await db.get(ResearchSession, session_id)
            if not research:
                return

            settings = await db.get(UserSettings, "default")
            if not settings:
                settings = UserSettings(id="default")
                db.add(settings)
                await db.commit()

            providers = build_providers(settings)
            llm = providers["llm"]
            search_provider = providers["search"]
            embedding = providers["embedding"]

            search_mgr = SearchManager()
            search_mgr.add_provider(search_provider)
            doc_service = DocumentService()
            task_mgr = TaskManager(db, session_id)

            planner = PlannerAgent(llm)
            search_agent = SearchAgent(llm, search_mgr)
            evidence_analyzer = EvidenceAnalyzer(llm)
            claim_gen = ClaimGenerator(llm)
            verifier = ClaimVerifier(llm)
            gap_detector = GapDetector(llm)
            synthesizer = Synthesizer(llm)

            # Phase 1: Plan
            await events.emit(session_id, "planner.started")
            plan = await planner.plan(research.question)
            research.status = ResearchStatus.SEARCHING
            await db.commit()
            await events.emit(session_id, "planner.completed", {"tasks": len(plan.sub_questions)})

            # Phase 2: Create tasks
            tasks = await task_mgr.create_from_plan(plan)

            # Phase 3: Execute tasks with iteration
            all_claims_data: list[dict] = []
            all_sources_data: list[dict] = []
            max_iterations = {"quick": 1, "standard": 2, "deep": 3}
            max_iter = max_iterations.get(research.depth, 2)

            for iteration in range(max_iter):
                ready = await task_mgr.get_ready()
                if not ready:
                    break

                await events.emit(session_id, "iteration.started", {"iteration": iteration + 1, "tasks": len(ready)})

                for task in ready:
                    await task_mgr.mark_in_progress(task)
                    await events.emit(session_id, "search.started", {"task": task.question})

                    raw_results = await search_agent.execute(task, num_results=5)
                    for r in raw_results:
                        source = Source(
                            session_id=session_id,
                            url=r["url"],
                            title=r.get("title"),
                            domain=r.get("domain"),
                            status="pending",
                        )
                        db.add(source)
                        await db.flush()
                        all_sources_data.append({"id": source.id, "url": source.url, "title": source.title})

                    await db.commit()
                    await events.emit(session_id, "search.completed", {"task": task.question, "results": len(raw_results)})

                    results_slice = raw_results[:2]
                    for r in results_slice:
                        await events.emit(session_id, "document.fetching", {"url": r["url"]})
                        content = await doc_service.fetch(r["url"])
                        if content:
                            source_result = await db.execute(
                                select(Source).where(Source.url == r["url"], Source.session_id == session_id)
                            )
                            source = source_result.scalar_one_or_none()
                            if source:
                                source.status = "fetched"
                                await db.commit()

                    await events.emit(session_id, "evidence.extracting", {"task": task.question})
                    chunk_text = "\n\n".join(
                        f"Source: {r['url']}\n{r['snippet']}"
                        for r in results_slice
                    )
                    evidence_items = await evidence_analyzer.extract(task.question, chunk_text, "")
                    all_claims_data.extend([{"passage": e["passage"], "source_url": e["source_url"]} for e in evidence_items])

                    await events.emit(session_id, "claim.generating", {"task": task.question})
                    claims = await claim_gen.generate(task.question, evidence_items)
                    for c in claims:
                        claim_obj = Claim(
                            session_id=session_id,
                            claim=c.get("statement", c.get("claim", "")),
                            confidence=c.get("confidence"),
                            status="unverified",
                        )
                        db.add(claim_obj)
                        await db.flush()

                        verified = await verifier.verify(claim_obj.claim, evidence_items)
                        claim_obj.status = verified.get("status", "insufficient")
                        claim_obj.confidence = verified.get("confidence", claim_obj.confidence)

                    await db.commit()
                    await task_mgr.mark_completed(task)

                # Phase 4: Gap detection
                await events.emit(session_id, "gap.detecting", {"iteration": iteration + 1})
                claim_statements = [c.get("statement", c.get("claim", "")) for c in all_claims_data[:10]]
                gaps = await gap_detector.detect(research.question, claim_statements, iteration)

                if gaps:
                    await events.emit(session_id, "gap.found", {"gaps": len(gaps)})
                    await task_mgr.create_from_gaps(gaps)
                else:
                    await events.emit(session_id, "gap.none")
                    break

            # Phase 5: Synthesize
            research.status = ResearchStatus.SYNTHESIZING
            await db.commit()
            await events.emit(session_id, "synthesis.started")

            result = await db.execute(
                select(Claim).where(Claim.session_id == session_id)
            )
            claims_orm = list(result.scalars().all())
            claim_dicts = [{"statement": c.claim, "confidence": c.confidence, "status": c.status} for c in claims_orm]

            report = await synthesizer.synthesize(research.question, claim_dicts, all_sources_data)

            # Phase 6: Complete
            research.report = report
            research.status = ResearchStatus.COMPLETED
            await db.commit()
            await events.emit(session_id, "research.completed", {"report": report})

        except Exception as e:
            logger.exception("research failed")
            research = await db.get(ResearchSession, session_id)
            if research:
                research.status = ResearchStatus.FAILED
                await db.commit()
            await events.emit(session_id, "research.failed", {"error": str(e)})


from sqlalchemy import select
