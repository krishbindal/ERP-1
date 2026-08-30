# Post-Audit Remediation Plan

## P0 (Security / Data Loss)
**1. Temporary Credentials Enforcement**
- **Problem:** DB flag orce_password_reset exists, but backend/middleware does not enforce password change on first login.
- **Impact:** Temporary passwords might remain in use, violating the security specification.
- **Dependencies:** None.
- **Fix:** Add server action and middleware checks to redirect to /auth/update-password if flag is true.
- **Test Strategy:** E2E auth test for first login flow.

## P1 (Foundational Architecture / Missing Certification)
**2. Identifier Engine**
- **Problem:** Missing central, safe, sequence-based ID generation for business IDs. Currently dmission_number is manual/client-provided.
- **Impact:** Phase 6 (Exams) and 7 (Finance) require robust ID generation.
- **Dependencies:** None.
- **Fix:** Create identifier_engine schema and RPCs for transaction-safe ID generation. Migrate dmission_number to use it.
- **Test Strategy:** Concurrent load testing of sequence generator.

**3. Attendance & Homework E2E Coverage**
- **Problem:** ttendance.spec.ts and homework.spec.ts do not exist.
- **Impact:** Regressions in core Phase 5 features cannot be detected by CI.
- **Dependencies:** None.
- **Fix:** Implement Playwright tests mirroring existing communication.spec.ts.
- **Test Strategy:** CI run.

## P2 (Quality / Maintainability)
**4. Audit Logging UI**
- **Problem:** History tables exist, but no centralized UI component for viewing business history.
- **Fix:** Implement a generic HistoryTimeline component.

## P3 (Enhancements)
**5. Action Center & Onboarding Framework**
- Deferred for now.

---

### NEXT PHASE AFTER REMEDIATION
Phase 6 (Assessments & Grading)

### NEXT 10 TASKS (EXPECTED ORDER)
1. Add ttendance.spec.ts to achieve 100% Phase 5 E2E coverage.
2. Add homework.spec.ts to achieve 100% Phase 5 E2E coverage.
3. Implement orce_password_reset middleware enforcement (P0).
4. Create /auth/update-password UI and backend action (P0).
5. Design and implement identifier_engine schema/functions (P1).
6. Migrate student_branch_profiles.admission_number to use the Identifier Engine (P1).
7. Create API routes for Identifier Generation if needed by frontend (P1).
8. Conduct a final CI run and merge remediation to master.
9. Begin Phase 6: Design Exam and Grading DB schema.
10. Begin Phase 6: Implement Assessment APIs.
