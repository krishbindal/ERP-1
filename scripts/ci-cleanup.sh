#!/bin/bash
set -u

echo "Stopping Supabase..."
npx --no-install supabase stop --no-backup || true

echo "Identifying stale ERP_1 containers..."
STALE_CONTAINERS=$(docker ps -a -q -f label=com.supabase.cli.project=ERP_1)

if [ -n "$STALE_CONTAINERS" ]; then
  echo "Inspecting stale containers..."
  docker inspect $STALE_CONTAINERS --format '{{.Name}} {{.State.Status}}' || true
  echo "Killing stale containers..."
  echo "$STALE_CONTAINERS" | xargs -r docker kill || true
  echo "Removing stale containers..."
  echo "$STALE_CONTAINERS" | xargs -r docker rm -f || true
fi

echo "Identifying stale ERP_1 networks..."
STALE_NETWORKS=$(docker network ls -q -f label=com.supabase.cli.project=ERP_1)

if [ -n "$STALE_NETWORKS" ]; then
  for NETWORK in $STALE_NETWORKS; do
    echo "Inspecting endpoints on stale network $NETWORK..."
    ENDPOINT_CONTAINERS=$(docker network inspect "$NETWORK" --format '{{range $id, $container := .Containers}}{{$id}}{{"\n"}}{{end}}' 2>/dev/null || true)

    if [ -n "$ENDPOINT_CONTAINERS" ]; then
      echo "Removing all remaining containers attached to stale ERP_1 network..."
      while IFS= read -r CONTAINER; do
        [ -n "$CONTAINER" ] || continue
        docker inspect "$CONTAINER" --format '{{.Name}} {{.State.Status}}' || true
        docker rm -f "$CONTAINER" || {
          echo "Force-disconnecting container $CONTAINER from network $NETWORK..."
          docker network disconnect -f "$NETWORK" "$CONTAINER" || true
          docker rm -f "$CONTAINER" || true
        }
      done <<< "$ENDPOINT_CONTAINERS"
    fi

    echo "Removing stale network $NETWORK..."
    docker network rm "$NETWORK" || true
  done
fi

echo "Identifying stale ERP_1 volumes..."
STALE_VOLUMES=$(docker volume ls -q -f label=com.supabase.cli.project=ERP_1)

if [ -n "$STALE_VOLUMES" ]; then
  echo "Removing stale volumes..."
  echo "$STALE_VOLUMES" | xargs -r docker volume rm || true
fi

echo "Verifying zero stale ERP_1 state..."
REMAINING_CONTAINERS=$(docker ps -a -q -f label=com.supabase.cli.project=ERP_1)
if [ -n "$REMAINING_CONTAINERS" ]; then
  echo "::error::Failed to clean up all containers!"
  exit 1
fi

REMAINING_NETWORKS=$(docker network ls -q -f label=com.supabase.cli.project=ERP_1)
if [ -n "$REMAINING_NETWORKS" ]; then
  echo "::error::Failed to clean up all networks!"
  exit 1
fi

REMAINING_VOLUMES=$(docker volume ls -q -f label=com.supabase.cli.project=ERP_1)
if [ -n "$REMAINING_VOLUMES" ]; then
  echo "::error::Failed to clean up all volumes!"
  exit 1
fi

echo "Cleanup complete and verified."
