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
