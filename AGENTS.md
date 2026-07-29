# DeepTrace

## Monorepo

```
backend/     Python FastAPI + orchestration
frontend/    Next.js 16 (see frontend/AGENTS.md for version quirks)
```

## Commands

```sh
# Backend (venv)
cd backend && .venv/bin/uvicorn app.main:app --reload

# Frontend
cd frontend && npm run dev

# TypeCheck
cd frontend && npx tsc --noEmit
```

## Architecture

Three layers:
- **Frontend** — presentation only, never runs research
- **Backend** (FastAPI) — API + services (search, docs, LLM, embeddings)
- **Orchestration** (`backend/app/orchestration/`) — research brain, decides what runs when

Flow: `POST /api/research` -> creates DB record -> fires orchestrator -> SSE events -> frontend renders progress.

## Backend

- Async SQLAlchemy + PostgreSQL + pgvector
- Settings stored in `user_settings` table, configured via `/settings` UI
- API keys never returned to frontend (only existence booleans)
- Search providers: ABC at `app/services/search.py`
- LLM providers: ABC at `app/services/llm.py`
- All providers read API keys from `UserSettings` at runtime

### Key endpoints
```
POST /api/research           Start research
GET  /api/research/:id/stream SSE stream
GET  /api/settings           Key existence booleans
PUT  /api/settings           Update keys/models
```

### Orchestration (`app/orchestration/`)
- `orchestrator.py` — main loop: plan -> execute -> gap detect -> iterate -> synthesize
- `agents/` — LLM-powered decision steps (planner, search_agent, evidence, claims, verifier, gap_detector, synthesizer)
- `state.py` — `ResearchState`, `ResearchPlan`, `ResearchGap` dataclasses
- `task_manager.py` — DAG-aware task creation & status tracking

## Frontend

- `@xyflow/react` for evidence graph
- SSE via `EventSource` in `lib/api.ts`
- Pages: `/`, `/research`, `/research/:id`, `/research/:id/report`, `/research/:id/sources`, `/research/:id/graph`, `/history`, `/settings`
- `NEXT_PUBLIC_API_URL` env var (default `http://localhost:8000`)
- shadcn/ui components in `components/ui/`

## Deployment Plan

### Current State
- **Infra**: docker-compose has Postgres + Redis only. No backend/frontend containers. No Dockerfiles. CORS hardcoded to `localhost:3000`.
- **Backend**: `asyncio.create_task` for research (dies on restart). In-memory event bus (no cross-worker SSE). No production server config.
- **Frontend**: All "use client" pages, no SSR features. Full SSE streaming. No auth, no error boundaries.

### Target: Deployment-Ready

#### Files to create
1. `backend/Dockerfile` — Python 3.13-slim, uv for deps, uvicorn, auto-migrate on start
2. `frontend/Dockerfile` — Node 22, multi-stage build, `next start` on port 3000
3. `.env.example` — Document all env vars (DB, Redis, CORS, API keys)
4. `backend/.dockerignore` — Exclude `__pycache__`, `.venv`, `.git`
5. `frontend/.dockerignore` — Exclude `node_modules`, `.next`, `.git`

#### Files to modify
6. `docker-compose.yml` — Add backend + frontend services, depends_on, internal network
7. `backend/app/config.py` — Add `cors_origins` field
8. `backend/app/main.py` — CORS from `settings.cors_origins.split(",")`
9. `README.md` — Add "Production Deployment" section

#### Known limitations (documented, not fixed)
- Single worker required for SSE (in-memory event bus). Scale = Redis-backed event bus.
- Research lost on restart. Fix = Redis task queue (ARQ/Celery).
- No TLS. Add reverse proxy (nginx/caddy/traefik) for production domains.

#### Not adding (YAGNI)
- No gunicorn (uvicorn --workers is fine)
- No CI/CD (one-command deploy with docker compose)
- No nginx in docker-compose (add when TLS needed)
