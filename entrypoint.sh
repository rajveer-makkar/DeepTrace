#!/bin/bash
set -e

mkdir -p /data
.venv/bin/python3 -c "
import asyncio
from app.database import init_db
asyncio.run(init_db())
print('Database ready')
"

.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 &
cd /frontend && npx next start -p 3000
