#!/bin/bash
set -euo pipefail
DB_CONTAINER=$(docker ps -qf name="supabase_db_")
NETWORK_NAME=$(docker inspect $DB_CONTAINER --format='{{range $k, $v := .NetworkSettings.Networks}}{{$k}}{{end}}')
DB_NAME=$(docker inspect $DB_CONTAINER --format='{{.Name}}' | sed 's/^\///')
echo "Network: $NETWORK_NAME"
echo "DB Host: $DB_NAME"
echo "Initializing pgTAP..."
docker exec "$DB_NAME" psql -U postgres -d postgres -c "CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;"
echo "Running pg_prove tests..."
time docker run --rm \
  --network "$NETWORK_NAME" \
  -v "$(pwd)/supabase/tests:/tests:ro" \
  -e PGHOST="$DB_NAME" -e PGUSER=postgres -e PGPASSWORD=postgres -e PGDATABASE=postgres \
  public.ecr.aws/supabase/pg_prove:3.36_amd64@sha256:715739e7fdd07a8631c36ea2f1c88fc0144f99a8f5eaa6c3a9799be377f94f2c \
  pg_prove --ext .sql -r /tests/db
