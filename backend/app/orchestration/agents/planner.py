import json
from app.services.llm import LLMProvider
from app.orchestration.state import ResearchPlan


PLANNER_SYSTEM = """You are a research planner. Break down complex questions into specific,
well-scoped sub-questions that can be researched independently. Each sub-question
should target a specific dimension of the original question.

Return a JSON object with a "questions" array of strings."""


class PlannerAgent:
    def __init__(self, llm: LLMProvider):
        self.llm = llm

    async def plan(self, question: str) -> ResearchPlan:
        raw = await self.llm.generate(
            PLANNER_SYSTEM,
            f"Break down this question into 2-4 specific research sub-questions: {question}",
        )
        try:
            data = json.loads(raw)
            questions = data.get("questions", [])
        except json.JSONDecodeError:
            questions = [q.strip("- ").strip() for q in raw.strip().split("\n") if q.strip()]
        return ResearchPlan(question=question, sub_questions=questions or [question])
