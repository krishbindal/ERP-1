# Repository Remediation Plan

## Prioritized Findings

### P0 (Critical - Blocking Release)
1. **Test Script JWT Leak**
   - **Problem:** `scripts/test-storage.js` contained a hardcoded service-role and anon JWT, risking exposure.
   - **Status:** **FIXED**. Modified to use dynamic environment variables.
2. **Seed Script Error Swallowing**
   - **Problem:** `supabase/seed_users.js` swallowed user-creation errors. `supabase/seed.sql` continued on failure.
   - **Status:** **FIXED**. Added `process.exit(1)` and `\set ON_ERROR_STOP on`.

### P1 (High - Must Fix Soon)
- **Missing E2E Tests for Phase 5 (Attendance & Homework)**: Although the database migrations and web/backend implementation exist, there are no Playwright E2E tests for attendance and homework in `apps/web/e2e/`.
  - *Next Step*: Create `attendance.spec.ts` and `homework.spec.ts`.
- **Identifier Engine Standardization**: Scattered reliance on raw UUIDs vs sequence numbers. Need a robust transaction-safe identifier engine.
  - *Next Step*: Build before Finance (Phase 7).

### P2 (Medium - Next Phase Operations)
- **Phase 6 (Exams/Marks) Implementation**: Planned in roadmap but has no database schemas, API, or web implementation yet.
  - *Next Step*: Begin technical design and schema implementation.
- **Bulk Import Engine**: Master spec requires dynamic module-aware templates for bulk operations.
  - *Next Step*: Requires a generic schema-mapped ingestion pipeline.

### P3 (Low - Backlog)
- **Phase 8 & 9 (Supporting Modules & Analytics)**: Retain in backlog for future cycles.
- **Universal Search**: Global authorized search is specified but not implemented.

## Next Engineering Tasks
With foundational Identity, Tenancy, Scheduling, Attendance, Homework, and Communications implemented, the system is ready for **Phase 6 — Assessments**.

1. **Assessment Schema:** Create migrations for `exam_terms`, `exams`, `exam_papers`, `student_marks`, and `grading_scales`.
2. **Result RPCs:** Build secure RPCs for grade calculation and transcript generation.
3. **Assessment UI (Teacher):** Build gradebook entry screen in Next.js.
4. **Assessment UI (Guardian):** Build report card view.
5. **Identifier Engine Core:** Build sequence generator for exam IDs/report card IDs.
6. **Action Center (Grading):** Add "ungraded homework/exams" to Action Center.
7. **E2E Certification:** Add Playwright flows for grading, attendance, and homework.

