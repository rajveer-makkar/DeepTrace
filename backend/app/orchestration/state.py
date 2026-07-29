from dataclasses import dataclass, field
from app.models.research import ResearchSession, ResearchTask, Source, Claim, Evidence


@dataclass
class ResearchGap:
    description: str
    priority: float = 0.5


@dataclass
class ResearchPlan:
    question: str
    sub_questions: list[str] = field(default_factory=list)


@dataclass
class ResearchState:
    session: ResearchSession
    plan: ResearchPlan | None = None
    iteration: int = 0
    gaps: list[ResearchGap] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "session_id": self.session.id,
            "question": self.session.question,
            "depth": self.session.depth,
            "iteration": self.iteration,
            "status": self.session.status.value,
            "num_plan_questions": len(self.plan.sub_questions) if self.plan else 0,
        }
