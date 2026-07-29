"""initial

Revision ID: 001
Revises:
Create Date: 2026-07-28

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.create_table(
        "research_sessions",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("question", sa.Text(), nullable=False),
        sa.Column("depth", sa.String(), server_default="standard"),
        sa.Column(
            "status",
            sa.Enum("planning", "searching", "fetching", "analyzing", "verifying", "synthesizing", "completed", "failed", name="researchstatus"),
            server_default="planning",
        ),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    op.create_table(
        "research_tasks",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("session_id", sa.String(), sa.ForeignKey("research_sessions.id"), nullable=False),
        sa.Column("question", sa.Text(), nullable=False),
        sa.Column(
            "status",
            sa.Enum("pending", "in_progress", "completed", "failed", name="taskstatus"),
            server_default="pending",
        ),
        sa.Column("priority", sa.Float(), server_default="0.5"),
        sa.Column("parent_task_id", sa.String(), sa.ForeignKey("research_tasks.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
    )

    op.create_table(
        "sources",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("session_id", sa.String(), sa.ForeignKey("research_sessions.id"), nullable=False),
        sa.Column("url", sa.Text(), nullable=False),
        sa.Column("title", sa.Text(), nullable=True),
        sa.Column("domain", sa.String(), nullable=True),
        sa.Column("status", sa.String(), server_default="pending"),
    )

    op.create_table(
        "documents",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("source_id", sa.String(), sa.ForeignKey("sources.id"), nullable=False),
        sa.Column("content", sa.Text(), nullable=True),
    )

    op.create_table(
        "chunks",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("document_id", sa.String(), sa.ForeignKey("documents.id"), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("embedding", postgresql.ARRAY(sa.Float()), nullable=True),
    )

    op.create_table(
        "claims",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("session_id", sa.String(), sa.ForeignKey("research_sessions.id"), nullable=False),
        sa.Column("claim", sa.Text(), nullable=False),
        sa.Column("confidence", sa.Float(), nullable=True),
        sa.Column("status", sa.String(), server_default="unverified"),
    )

    op.create_table(
        "evidence",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("claim_id", sa.String(), sa.ForeignKey("claims.id"), nullable=False),
        sa.Column("source_id", sa.String(), sa.ForeignKey("sources.id"), nullable=False),
        sa.Column("passage", sa.Text(), nullable=False),
        sa.Column("relevance", sa.Float(), nullable=True),
    )

    op.create_table(
        "user_settings",
        sa.Column("id", sa.String(), primary_key=True, server_default="default"),
        sa.Column("config_json", sa.Text(), server_default="{}"),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now()),
    )


def downgrade():
    op.drop_table("evidence")
    op.drop_table("claims")
    op.drop_table("chunks")
    op.drop_table("documents")
    op.drop_table("sources")
    op.drop_table("research_tasks")
    op.drop_table("research_sessions")
    op.drop_table("user_settings")
    op.execute("DROP TYPE IF EXISTS researchstatus")
    op.execute("DROP TYPE IF EXISTS taskstatus")
