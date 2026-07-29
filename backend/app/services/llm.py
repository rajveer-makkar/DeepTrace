from abc import ABC, abstractmethod


class LLMProvider(ABC):
    @abstractmethod
    async def generate(self, system: str, prompt: str, model: str | None = None) -> str:
        ...


class LLMRouter:
    def __init__(self):
        self._providers: list[LLMProvider] = []

    def add_provider(self, provider: LLMProvider):
        self._providers.append(provider)

    async def generate(self, system: str, prompt: str, model: str | None = None) -> str:
        for provider in self._providers:
            try:
                return await provider.generate(system, prompt, model)
            except Exception:
                continue
        raise RuntimeError("no LLM provider available")
