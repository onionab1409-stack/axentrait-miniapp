#!/bin/bash
set -euo pipefail

cd /opt/axentrait
TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)

HEALTH=$(curl -fsS http://127.0.0.1:3000/api/v1/health 2>/dev/null || true)
if echo "$HEALTH" | grep -q '"status":"ok"'; then
  echo "$TS health=ok"
  exit 0
fi

echo "$TS health=fail payload=${HEALTH:-empty}; restarting api"
docker compose restart api >/dev/null 2>&1 || true
sleep 5

HEALTH2=$(curl -fsS http://127.0.0.1:3000/api/v1/health 2>/dev/null || true)
if echo "$HEALTH2" | grep -q '"status":"ok"'; then
  echo "$TS health=recovered"
  exit 0
fi

echo "$TS health=still-fail payload=${HEALTH2:-empty}"
exit 1
