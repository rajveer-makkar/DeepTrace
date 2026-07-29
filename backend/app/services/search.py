from dataclasses import dataclass
from abc import ABC, abstractmethod


@dataclass
class SearchResult:
    url: str
    title: str
    snippet: str
    domain: str | None = None
    score: float = 1.0


class SearchProvider(ABC):
    @abstractmethod
    async def search(self, query: str, num_results: int = 10) -> list[SearchResult]:
        ...


class SearchManager:
    def __init__(self):
        self._providers: list[SearchProvider] = []

    def add_provider(self, provider: SearchProvider):
        self._providers.append(provider)

    async def search(self, query: str, num_results: int = 10) -> list[SearchResult]:
        results: list[SearchResult] = []
        for provider in self._providers:
            try:
                results.extend(await provider.search(query, num_results))
            except Exception:
                continue
        return self._deduplicate(results)

    def _deduplicate(self, results: list[SearchResult]) -> list[SearchResult]:
        seen: set[str] = set()
        deduped = []
        for r in results:
            if r.url not in seen:
                seen.add(r.url)
                deduped.append(r)
        return deduped
