# DeepTrace

A deep research engine that runs end-to-end research pipelines using LLMs, web search, and document analysis.

## Quickstart

```sh
docker run -p 3000:3000 -v deeptrace-data:/data ghcr.io/rajveer-makkar/DeepTrace
```

Open `http://localhost:3000` and configure API keys at `/settings`.

## Single-Command Production

```sh
docker compose up -d
```

Starts Postgres, Redis, backend, and frontend.

## Stack

- **Frontend** — Next.js 16, shadcn/ui, dark glassmorphism theme
- **Backend** — Python FastAPI, async SQLAlchemy, PostgreSQL + pgvector (SQLite for quickstart)
- **Orchestration** — DAG-based research pipeline: plan → search → extract → verify → synthesize
- **LLM providers** — OpenAI, Anthropic, OpenRouter, OpenCode Zen
- **Search providers** — Tavily, Brave

## Configuration

1. Copy `.env.example` to `backend/.env` and fill in API keys.
2. Configure providers at `/settings` in the app.

## Development

```sh
# Start Postgres + Redis
docker compose up -d

# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install .
alembic upgrade head
.venv/bin/uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

## Limitations

- Single backend worker required (in-memory SSE event bus). Add Redis-backed bus for multi-worker.
- Research lost on restart. Add Redis task queue (ARQ/Celery) for persistence.
- No TLS. Add reverse proxy (nginx/caddy/traefik) for production domains.

## License

MIT — see [LICENSE](LICENSE)
