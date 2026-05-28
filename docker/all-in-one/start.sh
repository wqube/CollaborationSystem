#!/usr/bin/env bash
set -euo pipefail

: "${POSTGRES_DB:=collaboration_system}"
: "${POSTGRES_USER:=postgres}"
: "${POSTGRES_PASSWORD:?Set POSTGRES_PASSWORD}"
: "${JWT_KEY:?Set JWT_KEY}"

PG_BIN="$(find /usr/lib/postgresql -path '*/bin/postgres' -print -quit | xargs dirname)"

mkdir -p "$PGDATA"
chown -R postgres:postgres "$PGDATA"

docker-entrypoint.sh postgres -c listen_addresses='127.0.0.1' &
POSTGRES_PID=$!

until "$PG_BIN/pg_isready" -h 127.0.0.1 -p 5432 >/dev/null 2>&1; do
    sleep 1
done

export ConnectionStrings__DefaultConnection="${ConnectionStrings__DefaultConnection:-Host=127.0.0.1;Port=5432;Database=$POSTGRES_DB;Username=$POSTGRES_USER;Password=$POSTGRES_PASSWORD}"

dotnet /app/CollaborationSystem.Api.dll &
BACKEND_PID=$!

shutdown() {
    kill "$BACKEND_PID" "$POSTGRES_PID" 2>/dev/null || true
    wait "$BACKEND_PID" "$POSTGRES_PID" 2>/dev/null || true
}

trap shutdown SIGINT SIGTERM

wait -n "$BACKEND_PID" "$POSTGRES_PID"
shutdown
