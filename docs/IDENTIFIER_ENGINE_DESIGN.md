# Identifier Engine Design

## 1. Purpose
The identifier engine provides configurable human-readable identifiers while UUIDs remain system primary keys. Approved scope can include organization, branch, academic year, prefix, and sequence.

## 2. Generation and transaction semantics
`generate_business_identifier()` uses an atomic `UPDATE ... RETURNING` against one sequence row. PostgreSQL serializes concurrent updates to the same row, preventing duplicate sequence values.

The update participates in the caller's transaction: a committed transaction commits the increment; a rolled-back transaction rolls the increment back. This is a database transaction property, not a universal business-level guarantee of gap-free identifiers across deletion, abandonment, retries, or other lifecycle events.

## 3. Concurrency benchmark
The benchmark driver is `scripts/identifier-concurrency-benchmark.sh` and its SQL assets are under `scripts/concurrency_tests/`. It exercises same-sequence and different-sequence contention with 2–10 clients and transaction holds from 10ms to 5s.

The benchmark is an operational contention/correctness check. It should be rerun when identifier workloads or transaction boundaries materially change.

## 4. Authorization & Security
`generate_business_identifier()` is a hardened `SECURITY DEFINER` function with `search_path = ''` and restricted EXECUTE grants. It validates active organization membership, requested branch ownership/membership, academic-year relationships, and canonical Super Admin semantics before updating the sequence.

## 5. Reuse and Phase 6
Identifiers are not reused as a business rule. Target identifier columns retain appropriate uniqueness constraints. Phase 6 may define an `exam_reference` sequence and invoke the shared generator after entity-specific authorization and lifecycle validation.
