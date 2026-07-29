import json
import asyncio
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.research import (
    ResearchSession, ResearchTask, Source, Document, Chunk, Claim, Evidence,
    ResearchStatus, TaskStatus
)


class EventEmitter:
    def __init__(self):
        self._subscribers: dict[str, list[asyncio.Queue]] = {}

    def subscribe(self, session_id: str) -> asyncio.Queue:
        queue: asyncio.Queue = asyncio.Queue()
        self._subscribers.setdefault(session_id, []).append(queue)
        return queue

    def unsubscribe(self, session_id: str, queue: asyncio.Queue):
        subscribers = self._subscribers.get(session_id, [])
        if queue in subscribers:
            subscribers.remove(queue)

    async def emit(self, session_id: str, event: str, data: dict | None = None):
        message = json.dumps({"event": event, "data": data or {}})
        for queue in self._subscribers.get(session_id, []):
            await queue.put(message)


events = EventEmitter()


class ResearchService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, question: str, depth: str = "standard") -> ResearchSession:
        session = ResearchSession(question=question, depth=depth)
        self.db.add(session)
        await self.db.commit()
        await self.db.refresh(session)
        await events.emit(session.id, "planner.started")
        return session

    async def get(self, research_id: str) -> ResearchSession | None:
        result = await self.db.execute(
            select(ResearchSession).where(ResearchSession.id == research_id)
        )
        return result.scalar_one_or_none()

    async def get_tasks(self, research_id: str) -> list[ResearchTask]:
        result = await self.db.execute(
            select(ResearchTask).where(ResearchTask.session_id == research_id)
        )
        return list(result.scalars().all())

    async def get_sources(self, research_id: str) -> list[Source]:
        result = await self.db.execute(
            select(Source).where(Source.session_id == research_id)
        )
        return list(result.scalars().all())

    async def get_claims(self, research_id: str) -> list[Claim]:
        result = await self.db.execute(
            select(Claim).where(Claim.session_id == research_id)
        )
        return list(result.scalars().all())

    async def get_evidence(self, research_id: str) -> list[Evidence]:
        result = await self.db.execute(
            select(Evidence).join(Claim).where(Claim.session_id == research_id)
        )
        return list(result.scalars().all())
