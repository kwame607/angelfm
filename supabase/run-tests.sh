#!/usr/bin/env bash
# Spins up a throw-away local Postgres, applies the migrations in order, and
# runs the RLS/constraint assertions. Requires PostgreSQL 15+ binaries.
set -euo pipefail
cd "$(dirname "$0")"
BIN=$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1)
[ -n "${BIN:-}" ] || { echo "PostgreSQL server binaries not found"; exit 1; }

DIR=$(mktemp -d); chmod 755 "$DIR"
PORT=54329
RUN="env"
if [ "$(id -u)" = "0" ]; then chown postgres "$DIR"; RUN="runuser -u postgres --"; fi
trap '$RUN $BIN/pg_ctl -D "$DIR/data" stop -m immediate >/dev/null 2>&1 || true; rm -rf "$DIR"' EXIT

$RUN $BIN/initdb -D "$DIR/data" -A trust >/dev/null
$RUN $BIN/pg_ctl -D "$DIR/data" -o "-p $PORT -k $DIR" -l "$DIR/log" -w start >/dev/null
PSQL="psql -h $DIR -p $PORT -U postgres -v ON_ERROR_STOP=1 -q -d postgres"

$PSQL -f tests/00_supabase_stub.sql
for f in migrations/*.sql; do echo "applying $f"; $PSQL -f "$f"; done
$PSQL -f tests/rls_test.sql 2>&1 | grep -E "pass:|FAIL|ALL TESTS|ERROR" 
