from app.models.research import ResearchTask, TaskStatus
from app.orchestration.state import ResearchPlan, ResearchGap
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select


class TaskManager:
    def __init__(self, db: AsyncSession, session_id: str):
        self.db = db
        self.session_id = session_id

    async def create_from_plan(self, plan: ResearchPlan) -> list[ResearchTask]:
        tasks = []
        for i, q in enumerate(plan.sub_questions):
            task = ResearchTask(
                session_id=self.session_id,
                question=q,
                priority=1.0 - (i * 0.05),
            )
            self.db.add(task)
            tasks.append(task)
        await self.db.commit()
        for t in tasks:
            await self.db.refresh(t)
        return tasks

    async def create_from_gaps(self, gaps: list[ResearchGap], parent_id: str | None = None) -> list[ResearchTask]:
        tasks = []
        for gap in gaps:
            task = ResearchTask(
                session_id=self.session_id,
                question=gap.description,
                priority=gap.priority,
                parent_task_id=parent_id,
            )
            self.db.add(task)
            tasks.append(task)
        await self.db.commit()
        for t in tasks:
            await self.db.refresh(t)
        return tasks

    async def get_ready(self) -> list[ResearchTask]:
        result = await self.db.execute(
            select(ResearchTask)
            .where(
                ResearchTask.session_id == self.session_id,
                ResearchTask.status == TaskStatus.PENDING,
            )
            .order_by(ResearchTask.priority.desc())
        )
        return list(result.scalars().all())

    async def mark_in_progress(self, task: ResearchTask):
        task.status = TaskStatus.IN_PROGRESS
        await self.db.commit()

    async def mark_completed(self, task: ResearchTask):
        task.status = TaskStatus.COMPLETED
        await self.db.commit()

    async def mark_failed(self, task: ResearchTask):
        task.status = TaskStatus.FAILED
        await self.db.commit()

    async def count_by_status(self, status: TaskStatus) -> int:
        result = await self.db.execute(
            select(ResearchTask).where(
                ResearchTask.session_id == self.session_id,
                ResearchTask.status == status,
            )
        )
        return len(list(result.scalars().all()))
