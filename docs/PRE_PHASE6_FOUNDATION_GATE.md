# Pre-Phase 6 Foundation Gate

## Phase 5 Gate

- **Identity**: IMPLEMENTED (Evidence: DB schema, RLS, middleware, web UI present)
- **Tenancy**: IMPLEMENTED (Evidence: ranch_id enforced in RLS and middleware)
- **Students**: IMPLEMENTED (Evidence: Admission and transfer flows fully built)
- **Guardians**: IMPLEMENTED (Evidence: Guardian linking and relationships built)
- **Staff**: IMPLEMENTED (Evidence: Teacher subject assignments built)
- **Scheduling**: IMPLEMENTED (Evidence: Timetable, substitution UI, and backend built)
- **Attendance**: BROKEN (Evidence: DB/Backend built, but Web UI and Playwright E2E are missing)
- **Homework**: BROKEN (Evidence: DB/Backend built, but Web UI and Playwright E2E are missing)
- **Communication**: IMPLEMENTED (Evidence: Worker and E2E built)

## Pre-Phase-6 Cross-Cutting Capabilities Gate

- **Temporary credentials**: MUST IMPLEMENT BEFORE PHASE 6. Evidence: Missing backend enforcement creates an immediate security risk to credentials (P0).
- **Identifier engine**: MUST IMPLEMENT BEFORE PHASE 6. Evidence: Phase 6 (Exams) and Phase 7 (Finance) explicitly require robust transaction-safe sequence generators for business identifiers (e.g. exam_id, invoice_number). UUIDs are insufficient for user-facing business records (P1).
- **UUID generation**: IMPLEMENTED. Evidence: gen_random_uuid() used consistently across tables.
- **Business identifier generation**: MUST IMPLEMENT BEFORE PHASE 6. (See Identifier engine).
- **Bulk import**: CAN DEFER. Evidence: Not an architectural blocker for grading logic.
- **Template engine**: CAN DEFER.
- **Duplicate detection**: CAN DEFER. Evidence: Does not block core grading logic.
- **Duplicate resolution**: CAN DEFER.
- **Bulk operation engine**: CAN DEFER.
- **Action Center**: CAN DEFER.
- **Universal search**: CAN DEFER.
- **Onboarding**: CAN DEFER.
- **History**: CAN IMPLEMENT DURING PHASE 6. Evidence: DB history triggers exist, user-visible UI layer is missing.
- **Auditability**: CAN IMPLEMENT DURING PHASE 6. Evidence: Retention logic missing.
- **Notifications**: IMPLEMENTED.
- **Generated fields**: MUST IMPLEMENT BEFORE PHASE 6 (Identifier engine dependency).
- **Import preview**: CAN DEFER.
- **Restartability**: CAN DEFER.
- **Idempotency**: IMPLEMENTED (Evidence: Communication worker uses idempotency keys).
- **Reconciliation**: CAN DEFER.
- **Production ownership**: FUTURE PRODUCTION REQUIREMENT.
- **Backup/restore**: FUTURE PRODUCTION REQUIREMENT.
- **Monitoring/observability**: FUTURE PRODUCTION REQUIREMENT.
- **Branch App Factory**: FUTURE PRODUCTION REQUIREMENT.

## Final Decision
**READY_AFTER_FOUNDATION_REMEDIATION**
