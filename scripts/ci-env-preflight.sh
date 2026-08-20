#!/bin/bash
# ci-env-preflight.sh
# Verifies the CI environment immediately before Supabase start

set -e

echo "=== Environment Preflight ==="
echo "Memory:"
free -h || true
echo "Swap:"
swapon --show || true
echo "Docker Stats:"
docker stats --no-stream || true
echo "Docker PS:"
docker ps -a || true
echo "Docker Networks:"
docker network ls || true

echo "=== Checking Required Ports ==="
PORTS=(54321 54322 54323)
PORT_CONFLICT=0

for PORT in "${PORTS[@]}"; do
  echo "Checking port $PORT..."
  # Use ss to find listening ports. -ltnp requires sudo for PIDs of other users, but we do what we can
  # On standard ubuntu runners, ss is available. 
  SS_OUT=$(sudo ss -ltnp | grep ":$PORT " || true)
  if [ -n "$SS_OUT" ]; then
    echo "::error::Port $PORT is already in use!"
    echo "$SS_OUT"
    PORT_CONFLICT=1
  else
    echo "Port $PORT is free."
  fi
done

if [ $PORT_CONFLICT -eq 1 ]; then
  echo "::error::One or more required ports are occupied. Failing preflight."
  exit 1
fi

echo "=== Checking Stale Network ==="
if docker network inspect supabase_network_ERP_1 >/dev/null 2>&1; then
  echo "::error::Stale network supabase_network_ERP_1 exists. Attempting removal..."
  docker network rm supabase_network_ERP_1 || { echo "::error::Failed to remove network"; exit 1; }
fi
echo "Network check passed."

echo "=== Environment Preflight Passed ==="
exit 0
