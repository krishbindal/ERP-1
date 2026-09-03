#!/bin/bash
set -euo pipefail

echo "============================================================"
echo "IDENTIFIER CONCURRENCY BENCHMARK"
echo "============================================================"

docker exec supabase_db_ERP_1 psql -U postgres -d postgres -c "
  INSERT INTO public.identifier_sequences (organization_id, branch_id, entity_type, prefix, padding_length)
  VALUES ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', 'test_concurrent', 'TC-', 5)
  ON CONFLICT DO NOTHING;
"

for i in {0..10}; do
  docker exec supabase_db_ERP_1 psql -U postgres -d postgres -c "
    INSERT INTO public.identifier_sequences (organization_id, branch_id, entity_type, prefix, padding_length)
    VALUES ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', 'test_concurrent_' || $i, 'TC$i-', 5)
    ON CONFLICT DO NOTHING;
  "
done

docker cp scripts/concurrency_tests/08_identifier_concurrency_benchmark.sql supabase_db_ERP_1:/tmp/08_identifier_concurrency_benchmark.sql
docker cp scripts/concurrency_tests/08_identifier_concurrency_multi.sql supabase_db_ERP_1:/tmp/08_identifier_concurrency_multi.sql

run_benchmark() {
  local name=$1
  local script=$2
  local clients=$3
  local txns=$4
  local sleep=$5

  echo "------------------------------------------------------------"
  echo "Scenario: $name (Clients: $clients, Txns/Client: $txns, Sleep: ${sleep}s)"
  echo "------------------------------------------------------------"
  docker exec supabase_db_ERP_1 pgbench -U postgres -d postgres \
    -f "/tmp/$script" -c "$clients" -t "$txns" -j "$clients" \
    -D sleep_duration="$sleep" -r
}

run_benchmark "Same Seq / Short Txn / 2 clients" "08_identifier_concurrency_benchmark.sql" 2 20 0.01
run_benchmark "Same Seq / Short Txn / 5 clients" "08_identifier_concurrency_benchmark.sql" 5 20 0.01
run_benchmark "Same Seq / Short Txn / 10 clients" "08_identifier_concurrency_benchmark.sql" 10 20 0.01
run_benchmark "Same Seq / 100ms Hold / 2 clients" "08_identifier_concurrency_benchmark.sql" 2 10 0.1
run_benchmark "Same Seq / 100ms Hold / 5 clients" "08_identifier_concurrency_benchmark.sql" 5 10 0.1
run_benchmark "Same Seq / 1s Hold / 10 clients" "08_identifier_concurrency_benchmark.sql" 10 2 1
run_benchmark "Same Seq / 5s Hold / 5 clients" "08_identifier_concurrency_benchmark.sql" 5 1 5
run_benchmark "Diff Seq / 1s Hold / 10 clients" "08_identifier_concurrency_multi.sql" 10 2 1

psql_cmd="SELECT entity_type, last_value FROM public.identifier_sequences WHERE entity_type LIKE 'test_concurrent%';"
docker exec supabase_db_ERP_1 psql -U postgres -d postgres -c "$psql_cmd"
