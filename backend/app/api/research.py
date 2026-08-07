import asyncio
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sse_starlette.sse import EventSourceResponse

from app.database import get_db, async_session
from app.models.research import ResearchSession
from app.services.research import ResearchService, events
from app.orchestration.orchestrator import run_research
from app.models.research import ResearchSession

router = APIRouter(prefix="/api/research", tags=["research"])


class ResearchRequest(BaseModel):
    question: str
    depth: str = "standard"


@router.get("")
async def list_research(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ResearchSession).order_by(ResearchSession.created_at.desc()).limit(50)
    )
    sessions = list(result.scalars().all())
    return [
        {
            "id": s.id,
            "question": s.question,
            "status": s.status.value,
            "created_at": s.created_at.isoformat(),
        }
        for s in sessions
    ]


@router.post("")
async def create_research(req: ResearchRequest, db: AsyncSession = Depends(get_db)):
    service = ResearchService(db)
    session = await service.create(req.question, req.depth)
    asyncio.create_task(run_research(session.id, async_session))
    return {"id": session.id}


@router.get("/{research_id}")
async def get_research(research_id: str, db: AsyncSession = Depends(get_db)):
    service = ResearchService(db)
    session = await service.get(research_id)
    if not session:
        return {"error": "not found"}
    return {
        "id": session.id,
        "question": session.question,
        "status": session.status.value,
        "depth": session.depth,
        "created_at": session.created_at.isoformat(),
    }


@router.get("/{research_id}/stream")
async def stream_research(research_id: str):
    queue = events.subscribe(research_id)

    async def event_generator():
        try:
            while True:
                message = await queue.get()
                yield message
        except asyncio.CancelledError:
            pass
        finally:
            events.unsubscribe(research_id, queue)

    return EventSourceResponse(event_generator())


@router.get("/{research_id}/sources")
async def get_sources(research_id: str, db: AsyncSession = Depends(get_db)):
    service = ResearchService(db)
    sources = await service.get_sources(research_id)
    return [
        {"id": s.id, "url": s.url, "title": s.title, "domain": s.domain}
        for s in sources
    ]


@router.get("/{research_id}/claims")
async def get_claims(research_id: str, db: AsyncSession = Depends(get_db)):
    service = ResearchService(db)
    claims = await service.get_claims(research_id)
    return [
        {"id": c.id, "claim": c.claim, "confidence": c.confidence, "status": c.status}
        for c in claims
    ]


@router.get("/{research_id}/evidence")
async def get_evidence(research_id: str, db: AsyncSession = Depends(get_db)):
    service = ResearchService(db)
    evidence = await service.get_evidence(research_id)
    return [
        {"id": e.id, "claim_id": e.claim_id, "source_id": e.source_id, "passage": e.passage, "relevance": e.relevance}
        for e in evidence
    ]


@router.get("/{research_id}/tasks")
async def get_tasks(research_id: str, db: AsyncSession = Depends(get_db)):
    service = ResearchService(db)
    tasks = await service.get_tasks(research_id)
    return [
        {
            "id": t.id,
            "question": t.question,
            "status": t.status.value,
            "priority": t.priority,
        }
        for t in tasks
    ]


@router.get("/{research_id}/report")
async def get_report(research_id: str, db: AsyncSession = Depends(get_db)):
    research = await db.get(ResearchSession, research_id)
    if not research:
        raise HTTPException(404, "Research not found")
    return {"report": research.report or "", "status": research.status.value}
