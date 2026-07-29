# DeepTrace

A deep research engine that runs end-to-end research pipelines using LLMs, web search, and document analysis.

## Stack

- **Frontend** — Next.js 16, shadcn/ui, dark glassmorphism theme
- **Backend** — Python FastAPI, async SQLAlchemy, PostgreSQL + pgvector
- **Orchestration** — DAG-based research pipeline: plan → search → extract → verify → synthesize
- **LLM providers** — OpenAI, Anthropic, OpenRouter, OpenCode Zen
- **Search providers** — Tavily, Brave

## Prerequisites

- Docker (PostgreSQL + Redis)
- Python 3.11+
- Node.js 20+

## Production Deployment

```sh
docker compose up --build -d
```

This starts Postgres, Redis, backend (port 8000), and frontend (port 3000).

### Configuration
1. Copy `.env.example` to `backend/.env` and fill in API keys.
2. Access the app at `http://localhost:3000`.
3. Configure providers at `/settings`.

### Limitations
- Single backend worker required (in-memory SSE event bus). Scale Redis event bus for multi-worker.
- Research lost on restart. Add Redis task queue (ARQ/Celery) for persistence.
- No TLS. Add reverse proxy (nginx/caddy/traefik) for production domains.

## Setup (Development)

```sh
# Start services
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

Configure API keys at `http://localhost:3000/settings`.

## Usage

1. Open `http://localhost:3000`
2. Enter a research question and select depth
3. View progress in real-time via SSE
4. Access completed report, sources, and evidence graph

## License

MIT — see [LICENSE](LICENSE)
