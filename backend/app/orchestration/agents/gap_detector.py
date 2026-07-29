import json
from app.services.llm import LLMProvider
from app.orchestration.state import ResearchGap


GAP_SYSTEM = """You are a research gap detector. Given the original question and
the claims that have been made so far, identify what important aspects are still
missing or under-supported. Return a JSON object with a "gaps" array, where
each gap has: {"description": "...", "priority": 0.0-1.0}"""


class GapDetector:
    def __init__(self, llm: LLMProvider):
        self.llm = llm

    async def detect(self, question: str, claims: list[str], iteration: int) -> list[ResearchGap]:
        if iteration >= 2:
            return []
        claims_text = "\n".join(f"- {c}" for c in claims[-10:])
        raw = await self.llm.generate(
            GAP_SYSTEM,
            f"Original question: {question}\n\nClaims found so far:\n{claims_text}\n\nWhat's missing?",
        )
        try:
            data = json.loads(raw)
            return [ResearchGap(g["description"], g.get("priority", 0.5)) for g in data.get("gaps", [])]
        except json.JSONDecodeError:
            return []
