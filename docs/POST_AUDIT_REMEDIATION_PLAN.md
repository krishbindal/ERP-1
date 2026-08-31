# Post-Audit Remediation Plan

## P0 (Critical Security / Immediate Risk)
**1. Temporary Credentials Enforcement**
- **Problem:** DB flag orce_password_reset exists, but backend/middleware does not enforce password change on first login.
- **Impact:** Immediate risk to user credentials.
- **Dependencies:** None.
- **Fix:** Add server action and middleware checks to redirect to /auth/update-password if flag is true.
- **Test Strategy:** E2E auth test for first login flow.
- **Migration Strategy:** None.
- **Rollback Considerations:** None.

## P1 (Foundational Architecture / Prerequisite / Certification Gap)
**2. Identifier Engine / Business Identifier Generation**
- **Problem:** Missing central, safe, sequence-based ID generation for business IDs.
- **Impact:** Phase 6 (Exams) and 7 (Finance) require robust business ID generation. UUIDs alone are insufficient.
- **Dependencies:** None.
- **Fix:** Create identifier_engine schema and RPCs for transaction-safe ID generation.
- **Test Strategy:** Concurrent load testing of sequence generator.
- **Migration Strategy:** Migrate dmission_number.
- **Rollback Considerations:** Back up DB.

**3. Attendance & Homework Web UI + E2E Coverage**
- **Problem:** ttendance.spec.ts and homework.spec.ts do not exist.
- **Impact:** Missing critical UI functionality required for Phase 5, and missing certification coverage as required by Definition of Done.
- **Dependencies:** None.
- **Fix:** Implement the missing Web UI screens (Dashboard, Roster, forms) for Attendance and Homework, and then implement Playwright tests mirroring existing specs.
- **Test Strategy:** CI run.
- **Migration Strategy:** None.
- **Rollback Considerations:** None.

## P2 & P3 (Quality / Capabilities)
- Audit Logging UI, Bulk Import, Duplicate Detection, Bulk Operations, Action Center, Universal Search, Onboarding, Backup/DR, Observability, Branch App Factory.
- Action: Deferred to later phases.

---

### NEXT PHASE AFTER REMEDIATION
Phase 6 (Assessments & Grading)

### NEXT 10 TASKS (EXPECTED ORDER)
1. Add ttendance.spec.ts to achieve 100% Phase 5 E2E coverage.
2. Implement the Homework Web UI and add homework.spec.ts to achieve 100% Phase 5 coverage.
3. Implement orce_password_reset middleware enforcement (P0).
4. Create /auth/update-password UI and backend action (P0).
5. Design and implement identifier_engine schema/functions (P1).
6. Migrate student_branch_profiles.admission_number to use the Identifier Engine (P1).
7. Create API routes for Identifier Generation if needed by frontend (P1).
8. Conduct a final CI run and merge remediation to master.
9. Begin Phase 6: Design Exam and Grading DB schema.
10. Begin Phase 6: Implement Assessment APIs.
