import json
from app.services.llm import LLMProvider


CLAIM_SYSTEM = """Analyze the provided evidence passages and extract clear,
factual claims. Each claim should be a single, specific statement that can be
verified. Return a JSON object with a "claims" array, where each claim has:
- "statement": the claim text
- "confidence": a float 0-1 based on evidence strength"""


class ClaimGenerator:
    def __init__(self, llm: LLMProvider):
        self.llm = llm

    async def generate(self, question: str, evidence_list: list[dict]) -> list[dict]:
        evidence_text = "\n\n".join(
            f"[Source: {e.get('source_url', '')}]\n{e.get('passage', '')}"
            for e in evidence_list
        )
        raw = await self.llm.generate(
            CLAIM_SYSTEM,
            f"Research question: {question}\n\nEvidence:\n{evidence_text[:8000]}",
        )
        try:
            data = json.loads(raw)
            return data.get("claims", [])
        except json.JSONDecodeError:
            return [{"statement": raw[:200], "confidence": 0.5}]
