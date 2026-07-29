from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/deeptrace"
    redis_url: str = "redis://localhost:6379/0"
    cors_origins: str = "http://localhost:3000"
    openai_api_key: str = ""
    openrouter_api_key: str = ""
    tavily_api_key: str = ""
    brave_api_key: str = ""

    model_config = {"env_file": ".env"}


settings = Settings()
