from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.settings import UserSettings, SETTINGS_DEFAULTS

router = APIRouter(prefix="/api/settings", tags=["settings"])


class SettingsUpdate(BaseModel):
    llm_provider: str | None = None
    llm_model: str | None = None
    openai_api_key: str | None = None
    openrouter_api_key: str | None = None
    anthropic_api_key: str | None = None
    opencode_api_key: str | None = None
    search_provider: str | None = None
    tavily_api_key: str | None = None
    brave_api_key: str | None = None


@router.get("")
async def get_settings(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(UserSettings).where(UserSettings.id == "default"))
    settings = result.scalar_one_or_none()
    if not settings:
        settings = UserSettings(id="default")
        db.add(settings)
        await db.commit()
        await db.refresh(settings)
    # Return only non-empty keys to avoid leaking empty placeholders as "set"
    config = settings.config
    return {
        "llm_provider": config.get("llm_provider", "openai"),
        "llm_model": config.get("llm_model", "gpt-4o"),
        "search_provider": config.get("search_provider", "tavily"),
        "has_openai_key": bool(config.get("openai_api_key")),
        "has_openrouter_key": bool(config.get("openrouter_api_key")),
        "has_anthropic_key": bool(config.get("anthropic_api_key")),
        "has_opencode_key": bool(config.get("opencode_api_key")),
        "has_tavily_key": bool(config.get("tavily_api_key")),
        "has_brave_key": bool(config.get("brave_api_key")),
    }


@router.put("")
async def update_settings(update: SettingsUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(UserSettings).where(UserSettings.id == "default"))
    settings = result.scalar_one_or_none()
    if not settings:
        settings = UserSettings(id="default")
        db.add(settings)

    current = settings.config
    for key, value in update.model_dump(exclude_none=True).items():
        current[key] = value
    settings.config = current
    await db.commit()
    return {"status": "ok"}
