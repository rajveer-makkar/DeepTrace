import json
from app.services.llm import LLMProvider
from app.services.search import SearchManager
from app.models.research import ResearchTask


QUERY_SYSTEM = """You are a search query generator. Given a research question,
generate 1-3 specific search queries that would find relevant sources.
Return a JSON object with a "queries" array of strings."""


class SearchAgent:
    def __init__(self, llm: LLMProvider, search_manager: SearchManager):
        self.llm = llm
        self.search_manager = search_manager

    async def generate_queries(self, task: ResearchTask) -> list[str]:
        raw = await self.llm.generate(
            QUERY_SYSTEM,
            f"Generate search queries for: {task.question}",
        )
        try:
            data = json.loads(raw)
            return data.get("queries", [task.question])
        except json.JSONDecodeError:
            return [task.question]

    async def execute(self, task: ResearchTask, num_results: int = 8) -> list[dict]:
        queries = await self.generate_queries(task)
        all_results = []
        for query in queries:
            results = await self.search_manager.search(query, num_results)
            for r in results:
                all_results.append({"query": query, "url": r.url, "title": r.title, "snippet": r.snippet, "domain": r.domain})
        return all_results[:num_results]
