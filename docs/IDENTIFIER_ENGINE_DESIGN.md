# Identifier Engine Design

## 1. Specification & Requirement Analysis
**Requirement (Master Spec 39_PROJECT_ROADMAP.md):** 
"Support school/branch-configurable templates for identifiers such as: student code, invoice/reference numbers where applicable, other approved entity identifiers. Generators may use approved context such as organization, branch, academic year, prefix, and sequence. The system remains authoritative for uniqueness and numbering. Concurrent generation must be deterministic and collision-safe; failed transactions must not create duplicate identifiers."

**Entities Requiring Business Identifiers:**
- `student_branch_profiles` (student code / student_id_local)
- Invoices / Fees (Phase 7 / Future)
- Staff (staff code / staff_id_local - if required later)
- Exams / Report Cards (Phase 6 / Future)

**Scope of Numbering:**
- Organization (Global to the trust)
- Branch (Unique per school branch)
- Academic Year (Restarts every year)
- Any combination (e.g., Branch + Academic Year)

**UUID vs Business ID:**
- System UUIDs (`gen_random_uuid()`) remain the primary keys for ALL tables to ensure decoupled relations and offline replication capabilities.
- Business Identifiers are purely for human-readable reference, display, and search. They are strictly stored as `TEXT`.

## 2. Data Model
To support atomic, isolated generation, we need an `identifier_sequences` table.

```sql
CREATE TABLE public.identifier_sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE,
    
    entity_type TEXT NOT NULL, -- e.g., 'student_code', 'invoice_number'
    
    -- Format configuration
    prefix TEXT NOT NULL DEFAULT '',
    suffix TEXT NOT NULL DEFAULT '',
    padding_length INT NOT NULL DEFAULT 4,
    
    -- State
    last_value BIGINT NOT NULL DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Uniqueness constraint: Only one active sequence per combination
    UNIQUE (organization_id, branch_id, academic_year_id, entity_type)
);
```

## 3. Generation Algorithm (Concurrency & Transaction Safety)
Generation must be wrapped in a transaction. We will use a PostgreSQL function `generate_business_identifier()` that uses a row-level lock (`FOR UPDATE`) or an atomic `UPDATE ... RETURNING` to increment the sequence.

```sql
CREATE OR REPLACE FUNCTION generate_business_identifier(
    p_organization_id UUID,
    p_branch_id UUID,
    p_academic_year_id UUID,
    p_entity_type TEXT
) RETURNS TEXT AS $$
DECLARE
    v_new_value BIGINT;
    v_prefix TEXT;
    v_suffix TEXT;
    v_padding INT;
    v_result TEXT;
BEGIN
    -- Atomic update and lock
    UPDATE public.identifier_sequences
    SET last_value = last_value + 1, updated_at = NOW()
    WHERE organization_id = p_organization_id
      AND (branch_id = p_branch_id OR (branch_id IS NULL AND p_branch_id IS NULL))
      AND (academic_year_id = p_academic_year_id OR (academic_year_id IS NULL AND p_academic_year_id IS NULL))
      AND entity_type = p_entity_type
    RETURNING last_value, prefix, suffix, padding_length 
    INTO v_new_value, v_prefix, v_suffix, v_padding;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Sequence not configured for entity %', p_entity_type;
    END IF;

    -- Format
    v_result := v_prefix || LPAD(v_new_value::TEXT, v_padding, '0') || v_suffix;
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;
```

**Concurrency & Lock Contention:**
The `UPDATE ... RETURNING` clause takes a row-exclusive lock on the specific sequence row. If multiple transactions call this function concurrently, Postgres queues the updates serially on that specific row. This guarantees no two transactions receive the same sequence number.

**Rollbacks & Gap-Free Semantics:**
Unlike standard PostgreSQL sequences (`CREATE SEQUENCE`) which increment outside transaction scope and leave gaps on rollback, our engine uses a standard table update. Because `UPDATE` is strictly transactional, the lock on the sequence row is held until the surrounding transaction commits or rolls back. If the transaction rolls back, the sequence increment rolls back with it. 
This provides **true gap-free numbering** (assuming no manual deletions occur later) because a failed transaction refunds the number. The trade-off is lock contention: concurrent transactions inserting into the same sequence must wait for the lock to release. For a school ERP where identifier generation (e.g. 100 students) is low-throughput, this serialization is perfectly acceptable and provides the gap-free guarantee often required for compliance (e.g. invoices).

## 4. Authorization & Security
- **RLS**: The `identifier_sequences` table will have RLS policies ensuring users can only read/configure sequences for their assigned organization/branch.
- **Generation Function**: The function itself must enforce authorization. It should check if `auth.uid()` has permissions in the requested branch/organization before incrementing. However, to allow system-level operations (e.g., bulk import via service role), it will respect standard RLS/auth context. 

## 5. Idempotency & Reuse
Identifiers are never reused once generated to prevent confusion. If a user deletes a student, the student code is permanently retired. The business ID column on the target table must have a `UNIQUE` constraint scoped correctly (e.g., `UNIQUE(branch_id, student_id_local)`).

## 6. Phase 6 Integration (Prerequisite check)
Phase 6 (Exams & Marks) will require generating Exam references, Roll Numbers, or Report Card IDs. By building this shared engine now, Phase 6 can simply insert a sequence row for `exam_reference` and call `generate_business_identifier()`.

## 7. Existing Identifiers Migration
Currently, `student_branch_profiles` has `student_id_local TEXT`. This is the ONLY existing business identifier identified in the schema so far. The column is already defined with a `UNIQUE(branch_id, student_id_local)` constraint. The Engine satisfies this requirement perfectly. No data migration is required if no actual generated strings exist, or if they do, we can initialize `last_value` based on existing records during adoption.
