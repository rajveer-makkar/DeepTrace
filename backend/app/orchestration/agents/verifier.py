import json
from app.services.llm import LLMProvider


VERIFIER_SYSTEM = """You are a claim verifier. Given a claim and supporting evidence,
determine whether the evidence supports, contradicts, or partially supports the claim.
Return a JSON object:
{"status": "supported"|"refuted"|"partial"|"insufficient", "confidence": 0.0-1.0, "reasoning": "..."}"""


class ClaimVerifier:
    def __init__(self, llm: LLMProvider):
        self.llm = llm

    async def verify(self, claim_statement: str, evidence_list: list[dict]) -> dict:
        evidence_text = "\n\n".join(
            f"[Source: {e.get('source_url', '')}]\n{e.get('passage', '')}"
            for e in evidence_list[:5]
        )
        raw = await self.llm.generate(
            VERIFIER_SYSTEM,
            f"Claim: {claim_statement}\n\nEvidence:\n{evidence_text}",
        )
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return {"status": "insufficient", "confidence": 0.0, "reasoning": raw[:200]}
