from app.services.llm import LLMProvider


EVIDENCE_SYSTEM = """Extract specific evidence passages from the provided content
that are relevant to the research question. Focus on factual claims, data points,
and authoritative statements. Return each passage with a brief note on relevance."""


class EvidenceAnalyzer:
    def __init__(self, llm: LLMProvider):
        self.llm = llm

    async def extract(self, question: str, content: str, url: str) -> list[dict]:
        raw = await self.llm.generate(
            EVIDENCE_SYSTEM,
            f"Research question: {question}\n\nSource URL: {url}\n\nContent:\n{content[:8000]}",
        )
        passages = []
        for block in raw.strip().split("\n\n"):
            if len(block) > 40:
                passages.append({"passage": block[:500], "source_url": url})
        return passages or [{"passage": content[:500], "source_url": url}]
