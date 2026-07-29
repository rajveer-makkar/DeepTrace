import json
from datetime import datetime
from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.models.research import Base


SETTINGS_DEFAULTS = {
    "llm_provider": "openai",
    "llm_model": "gpt-4o",
    "openai_api_key": "",
    "openrouter_api_key": "",
    "anthropic_api_key": "",
    "opencode_api_key": "",
    "search_provider": "tavily",
    "tavily_api_key": "",
    "brave_api_key": "",
}


class UserSettings(Base):
    __tablename__ = "user_settings"

    id: Mapped[str] = mapped_column(String, primary_key=True, default="default")
    config_json: Mapped[str] = mapped_column(Text, default=lambda: json.dumps(SETTINGS_DEFAULTS))
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow)

    @property
    def config(self) -> dict:
        return {**SETTINGS_DEFAULTS, **json.loads(self.config_json)}

    @config.setter
    def config(self, value: dict):
        merged = {**SETTINGS_DEFAULTS, **value}
        self.config_json = json.dumps(merged)

    def get_openai_key(self) -> str:
        return self.config.get("openai_api_key", "")

    def get_openrouter_key(self) -> str:
        return self.config.get("openrouter_api_key", "")

    def get_anthropic_key(self) -> str:
        return self.config.get("anthropic_api_key", "")

    def get_opencode_key(self) -> str:
        return self.config.get("opencode_api_key", "")

    def get_tavily_key(self) -> str:
        return self.config.get("tavily_api_key", "")

    def get_brave_key(self) -> str:
        return self.config.get("brave_api_key", "")

    def get_llm_provider(self) -> str:
        return self.config.get("llm_provider", "openai")

    def get_llm_model(self) -> str:
        return self.config.get("llm_model", "gpt-4o")

    def get_search_provider(self) -> str:
        return self.config.get("search_provider", "tavily")
