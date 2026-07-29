from app.services.llm import LLMProvider


SYNTHESIS_SYSTEM = """You are a research synthesis expert. Given the original question,
a set of verified claims with evidence, produce a comprehensive research report.

The report should include:
1. Executive summary (2-3 sentences)
2. Key findings (numbered, each with supporting evidence)
3. Confidence assessment
4. Sources cited

Use markdown formatting."""


class Synthesizer:
    def __init__(self, llm: LLMProvider):
        self.llm = llm

    async def synthesize(self, question: str, claims: list[dict], sources: list[dict]) -> str:
        claims_text = "\n\n".join(
            f"Claim: {c.get('statement', c.get('claim', ''))}\n"
            f"Confidence: {c.get('confidence', 'N/A')}\n"
            f"Status: {c.get('status', 'unverified')}"
            for c in claims
        )
        sources_text = "\n".join(f"- {s.get('title', s.get('url', ''))}: {s.get('url', '')}" for s in sources[:20])

        return await self.llm.generate(
            SYNTHESIS_SYSTEM,
            f"Question: {question}\n\nClaims & Evidence:\n{claims_text}\n\nSources:\n{sources_text}",
        )
