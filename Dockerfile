FROM node:22-slim AS frontend
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM python:3.13-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates xz-utils && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uv
WORKDIR /app
COPY backend/pyproject.toml .
RUN uv sync --frozen --no-dev
COPY backend/ .
COPY --from=frontend /app/.next /frontend/.next
COPY --from=frontend /app/package.json /frontend/
COPY --from=frontend /app/node_modules /frontend/node_modules
COPY --from=frontend /app/public /frontend/public
COPY --from=frontend /app/next.config.ts /frontend/
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 3000
ENV NODE_ENV=production
ENV DATABASE_URL=sqlite+aiosqlite:///data/deeptrace.db
CMD ["/entrypoint.sh"]
