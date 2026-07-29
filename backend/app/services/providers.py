import json
import httpx
from openai import AsyncOpenAI
from anthropic import AsyncAnthropic

from app.models.settings import UserSettings
from app.services.search import SearchResult, SearchProvider
from app.services.llm import LLMProvider


class OpenAILLM(LLMProvider):
    def __init__(self, api_key: str, default_model: str = "gpt-4o"):
        self.client = AsyncOpenAI(api_key=api_key)
        self.default_model = default_model

    async def generate(self, system: str, prompt: str, model: str | None = None) -> str:
        resp = await self.client.chat.completions.create(
            model=model or self.default_model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
        )
        return resp.choices[0].message.content or ""


class OpenRouterLLM(LLMProvider):
    def __init__(self, api_key: str, default_model: str = "openai/gpt-4o"):
        self.client = AsyncOpenAI(
            api_key=api_key,
            base_url="https://openrouter.ai/api/v1",
        )
        self.default_model = default_model

    async def generate(self, system: str, prompt: str, model: str | None = None) -> str:
        resp = await self.client.chat.completions.create(
            model=model or self.default_model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
        )
        return resp.choices[0].message.content or ""


class AnthropicLLM(LLMProvider):
    def __init__(self, api_key: str, default_model: str = "claude-3-5-sonnet-20241022"):
        self.client = AsyncAnthropic(api_key=api_key)
        self.default_model = default_model

    async def generate(self, system: str, prompt: str, model: str | None = None) -> str:
        resp = await self.client.messages.create(
            model=model or self.default_model,
            system=system,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=4096,
            temperature=0.3,
        )
        return resp.content[0].text if resp.content else ""


class OpenCodeLLM(LLMProvider):
    def __init__(self, api_key: str, default_model: str = "deepseek-v4-flash-free"):
        self.client = AsyncOpenAI(
            api_key=api_key,
            base_url="https://opencode.ai/zen/v1",
        )
        self.default_model = default_model

    async def generate(self, system: str, prompt: str, model: str | None = None) -> str:
        resp = await self.client.chat.completions.create(
            model=model or self.default_model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
        )
        return resp.choices[0].message.content or ""


class TavilySearch(SearchProvider):
    BASE = "https://api.tavily.com"

    def __init__(self, api_key: str):
        self.api_key = api_key

    async def search(self, query: str, num_results: int = 10) -> list[SearchResult]:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                f"{self.BASE}/search",
                json={"api_key": self.api_key, "query": query, "max_results": num_results},
            )
            resp.raise_for_status()
            data = resp.json()
            return [
                SearchResult(
                    url=r["url"],
                    title=r.get("title", ""),
                    snippet=r.get("content", ""),
                    domain=httpx.URL(r["url"]).host if r.get("url") else None,
                )
                for r in data.get("results", [])
            ]


class BraveSearch(SearchProvider):
    BASE = "https://api.search.brave.com/res/v1"

    def __init__(self, api_key: str):
        self.api_key = api_key

    async def search(self, query: str, num_results: int = 10) -> list[SearchResult]:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                f"{self.BASE}/web/search",
                params={"q": query, "count": num_results},
                headers={"Accept": "application/json", "X-Subscription-Token": self.api_key},
            )
            resp.raise_for_status()
            data = resp.json()
            results = []
            for r in data.get("web", {}).get("results", []):
                results.append(
                    SearchResult(
                        url=r["url"],
                        title=r.get("title", ""),
                        snippet=r.get("description", ""),
                        domain=httpx.URL(r["url"]).host,
                    )
                )
            return results


class EmbeddingService:
    def __init__(self, api_key: str, model: str = "text-embedding-3-small"):
        self.client = AsyncOpenAI(api_key=api_key)
        self.model = model

    async def embed(self, text: str) -> list[float]:
        resp = await self.client.embeddings.create(
            model=self.model, input=text
        )
        return resp.data[0].embedding

    async def embed_many(self, texts: list[str]) -> list[list[float]]:
        resp = await self.client.embeddings.create(
            model=self.model, input=texts
        )
        return [d.embedding for d in resp.data]


def build_providers(settings: UserSettings) -> dict:
    config = settings.config
    llm_provider_name = config.get("llm_provider", "openai")
    llm_model = config.get("llm_model", "gpt-4o")
    search_provider_name = config.get("search_provider", "tavily")

    llm_provider_name = config.get("llm_provider", "openai")
    llm_model = config.get("llm_model", "gpt-4o")
    if llm_provider_name == "openai" and config.get("openai_api_key"):
        llm = OpenAILLM(config["openai_api_key"], llm_model)
    elif llm_provider_name == "openrouter" and config.get("openrouter_api_key"):
        llm = OpenRouterLLM(config["openrouter_api_key"], llm_model)
    elif llm_provider_name == "anthropic" and config.get("anthropic_api_key"):
        llm = AnthropicLLM(config["anthropic_api_key"], llm_model)
    elif llm_provider_name == "opencode" and config.get("opencode_api_key"):
        llm = OpenCodeLLM(config["opencode_api_key"], llm_model)
    elif config.get("opencode_api_key"):
        llm = OpenCodeLLM(config["opencode_api_key"], llm_model)
    elif config.get("openai_api_key"):
        llm = OpenAILLM(config["openai_api_key"], llm_model)
    elif config.get("openrouter_api_key"):
        llm = OpenRouterLLM(config["openrouter_api_key"], llm_model)
    elif config.get("anthropic_api_key"):
        llm = AnthropicLLM(config["anthropic_api_key"], llm_model)
    else:
        raise ValueError("No LLM API key configured — set OpenAI, OpenRouter, Anthropic, or OpenCode in Settings")

    search_provider_name = config.get("search_provider", "tavily")
    if search_provider_name == "tavily" and config.get("tavily_api_key"):
        search = TavilySearch(config["tavily_api_key"])
    elif search_provider_name == "brave" and config.get("brave_api_key"):
        search = BraveSearch(config["brave_api_key"])
    elif config.get("tavily_api_key"):
        search = TavilySearch(config["tavily_api_key"])
    elif config.get("brave_api_key"):
        search = BraveSearch(config["brave_api_key"])
    else:
        raise ValueError("No search API key configured — set Tavily or Brave in Settings")

    embedding_api_key = config.get("openai_api_key") or config.get("openrouter_api_key") or config.get("opencode_api_key") or ""
    embedding = EmbeddingService(embedding_api_key) if embedding_api_key else None

    return {"llm": llm, "search": search, "embedding": embedding}
