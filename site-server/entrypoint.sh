#!/bin/sh
alembic -n db upgrade head
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --forwarded-allow-ips='*' --proxy-headers
