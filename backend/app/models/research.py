import uuid
from datetime import datetime
from sqlalchemy import String, Float, Integer, Text, ForeignKey, Enum, JSON
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
import enum


class Base(DeclarativeBase):
    pass


class ResearchStatus(str, enum.Enum):
    PLANNING = "planning"
    SEARCHING = "searching"
    FETCHING = "fetching"
    ANALYZING = "analyzing"
    VERIFYING = "verifying"
    SYNTHESIZING = "synthesizing"
    COMPLETED = "completed"
    FAILED = "failed"


class ResearchSession(Base):
    __tablename__ = "research_sessions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: f"res_{uuid.uuid4().hex[:8]}")
    question: Mapped[str] = mapped_column(Text)
    depth: Mapped[str] = mapped_column(String, default="standard")
    status: Mapped[ResearchStatus] = mapped_column(Enum(ResearchStatus, values_callable=lambda x: [e.value for e in x]), default=ResearchStatus.PLANNING)
    report: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow)

    tasks = relationship("ResearchTask", back_populates="session", cascade="all, delete-orphan")
    sources = relationship("Source", back_populates="session", cascade="all, delete-orphan")
    claims = relationship("Claim", back_populates="session", cascade="all, delete-orphan")


class TaskStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


class ResearchTask(Base):
    __tablename__ = "research_tasks"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: f"task_{uuid.uuid4().hex[:8]}")
    session_id: Mapped[str] = mapped_column(ForeignKey("research_sessions.id"))
    question: Mapped[str] = mapped_column(Text)
    status: Mapped[TaskStatus] = mapped_column(Enum(TaskStatus, values_callable=lambda x: [e.value for e in x]), default=TaskStatus.PENDING)
    priority: Mapped[float] = mapped_column(Float, default=0.5)
    parent_task_id: Mapped[str | None] = mapped_column(ForeignKey("research_tasks.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    session = relationship("ResearchSession", back_populates="tasks")
    subtasks = relationship("ResearchTask", backref="parent_task", remote_side=[id], cascade="all")


class Source(Base):
    __tablename__ = "sources"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: f"src_{uuid.uuid4().hex[:8]}")
    session_id: Mapped[str] = mapped_column(ForeignKey("research_sessions.id"))
    url: Mapped[str] = mapped_column(Text)
    title: Mapped[str | None] = mapped_column(Text, nullable=True)
    domain: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String, default="pending")

    session = relationship("ResearchSession", back_populates="sources")
    documents = relationship("Document", back_populates="source", cascade="all, delete-orphan")


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: f"doc_{uuid.uuid4().hex[:8]}")
    source_id: Mapped[str] = mapped_column(ForeignKey("sources.id"))
    content: Mapped[str | None] = mapped_column(Text, nullable=True)

    source = relationship("Source", back_populates="documents")
    chunks = relationship("Chunk", back_populates="document", cascade="all, delete-orphan")


class Chunk(Base):
    __tablename__ = "chunks"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: f"ch_{uuid.uuid4().hex[:8]}")
    document_id: Mapped[str] = mapped_column(ForeignKey("documents.id"))
    content: Mapped[str] = mapped_column(Text)
    embedding: Mapped[list[float] | None] = mapped_column(JSON, nullable=True)

    document = relationship("Document", back_populates="chunks")


class Claim(Base):
    __tablename__ = "claims"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: f"cl_{uuid.uuid4().hex[:8]}")
    session_id: Mapped[str] = mapped_column(ForeignKey("research_sessions.id"))
    claim: Mapped[str] = mapped_column(Text)
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    status: Mapped[str] = mapped_column(String, default="unverified")

    session = relationship("ResearchSession", back_populates="claims")
    evidence = relationship("Evidence", back_populates="claim", cascade="all, delete-orphan")


class Evidence(Base):
    __tablename__ = "evidence"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: f"ev_{uuid.uuid4().hex[:8]}")
    claim_id: Mapped[str] = mapped_column(ForeignKey("claims.id"))
    source_id: Mapped[str] = mapped_column(ForeignKey("sources.id"))
    passage: Mapped[str] = mapped_column(Text)
    relevance: Mapped[float | None] = mapped_column(Float, nullable=True)

    claim = relationship("Claim", back_populates="evidence")
    source = relationship("Source")
