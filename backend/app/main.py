from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.research import router as research_router
from app.api.settings import router as settings_router
from app.config import settings

app = FastAPI(title="DeepTrace API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(research_router)
app.include_router(settings_router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}
