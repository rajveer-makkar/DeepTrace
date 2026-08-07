import json
from app.services.llm import LLMProvider


VERIFIER_SYSTEM = """You are a claim verifier. Given a claim and supporting evidence,
determine whether the evidence supports, contradicts, or partially supports the claim.
Return a JSON object:
{"status": "supported"|"refuted"|"partial"|"insufficient", "confidence": 0.0-1.0, "reasoning": "..."}"""

VERIFIER_BATCH_SYSTEM = """You are a claim verifier. Given a list of claims and one shared set of
supporting evidence, determine whether the evidence supports, refutes, partially supports, or has
insufficient support for each claim. Return a JSON object:
{"verifications": [{"index": 0, "status": "supported"|"refuted"|"partial"|"insufficient", "confidence": 0.0-1.0}]}
Include exactly one entry per claim, indices 0..N-1 in order."""


class ClaimVerifier:
    def __init__(self, llm: LLMProvider):
        self.llm = llm

    async def verify(self, claim_statement: str, evidence_list: list[dict]) -> dict:
        verified = await self.verify_batch([claim_statement], evidence_list)
        return verified[0] if verified else {"status": "insufficient", "confidence": 0.0}

    async def verify_batch(self, claim_statements: list[str], evidence_list: list[dict]) -> list[dict]:
        evidence_text = "\n\n".join(
            f"[Source: {e.get('source_url', '')}]\n{e.get('passage', '')}"
            for e in evidence_list[:5]
        )
        claims_text = "\n".join(f"[{i}] {c}" for i, c in enumerate(claim_statements))
        raw = await self.llm.generate(
            VERIFIER_BATCH_SYSTEM,
            f"Claims:\n{claims_text}\n\nEvidence:\n{evidence_text}",
        )
        try:
            data = json.loads(raw)
            return data.get("verifications", [])
        except json.JSONDecodeError:
            return [
                {"index": i, "status": "insufficient", "confidence": 0.0, "reasoning": raw[:200]}
                for i in range(len(claim_statements))
            ]
