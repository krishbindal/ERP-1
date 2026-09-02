#!/bin/bash
set -e

echo "============================================================"
echo "IDENTIFIER CONCURRENCY BENCHMARK"
echo "============================================================"

# Setup sequences for the test
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

# Copy scripts into container
docker cp supabase/tests/db/08_identifier_concurrency_benchmark.sql supabase_db_ERP_1:/tmp/08_identifier_concurrency_benchmark.sql
docker cp supabase/tests/db/08_identifier_concurrency_multi.sql supabase_db_ERP_1:/tmp/08_identifier_concurrency_multi.sql

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
    -f "/tmp/$script" \
    -c "$clients" \
    -t "$txns" \
    -j "$clients" \
    -D sleep_duration="$sleep" \
    -r
}

# 1. Short transactions (0.01s hold) on SAME sequence
run_benchmark "Same Seq / Short Txn / 2 clients" "08_identifier_concurrency_benchmark.sql" 2 20 0.01
run_benchmark "Same Seq / Short Txn / 5 clients" "08_identifier_concurrency_benchmark.sql" 5 20 0.01
run_benchmark "Same Seq / Short Txn / 10 clients" "08_identifier_concurrency_benchmark.sql" 10 20 0.01

# 2. Medium hold (0.1s) on SAME sequence
run_benchmark "Same Seq / 100ms Hold / 2 clients" "08_identifier_concurrency_benchmark.sql" 2 10 0.1
run_benchmark "Same Seq / 100ms Hold / 5 clients" "08_identifier_concurrency_benchmark.sql" 5 10 0.1

# 3. Long hold (1s) on SAME sequence
# 10 clients doing 2 requests each = 20 seconds total if fully serialized
run_benchmark "Same Seq / 1s Hold / 10 clients" "08_identifier_concurrency_benchmark.sql" 10 2 1

# 4. Long hold (5s) on SAME sequence
# 5 clients doing 1 request each = 25 seconds total if fully serialized
run_benchmark "Same Seq / 5s Hold / 5 clients" "08_identifier_concurrency_benchmark.sql" 5 1 5

# 5. Long hold (1s) on DIFFERENT sequences (should run in parallel)
run_benchmark "Diff Seq / 1s Hold / 10 clients" "08_identifier_concurrency_multi.sql" 10 2 1

echo "============================================================"
echo "Verify Data Correctness"
echo "============================================================"
docker exec supabase_db_ERP_1 psql -U postgres -d postgres -c "
  SELECT entity_type, last_value 
  FROM public.identifier_sequences 
  WHERE entity_type LIKE 'test_concurrent%';
"
