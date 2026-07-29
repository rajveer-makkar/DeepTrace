import httpx


class DocumentService:
    async def fetch(self, url: str) -> str | None:
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.get(url, headers={"User-Agent": "DeepTrace/1.0"})
                resp.raise_for_status()
                return resp.text
        except Exception:
            return None
