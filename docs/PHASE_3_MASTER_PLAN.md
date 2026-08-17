# SchoolOS — Phase 3: Master Plan (Students & Academics)

## 1. Scope
Phase 3 introduces the first real ERP domain: Students, Guardians, and the Academic foundation (Years, Classes, Sections, Subjects). It deliberately excludes attendance, exams, fees, and the full Teacher module.

## 2. Dependencies
- **Phase 2B**: Completely relies on the certified identity, tenancy, RBAC, and RLS structures. No new security paradigms will be introduced.

## 3. Skills
The following AAS capability categories are required for this phase:
- `Supabase/PostgreSQL`
- `database architecture`
- `RLS/security`
- `Next.js`
- `TypeScript`
- `frontend architecture`
- `Stitch`
- `testing/QA`

## 4. Domain Model & 5. ERD
- **Student**: Organization-wide identity.
- **Guardian**: Organization-wide identity. Linked to students via `student_guardians` (many-to-many).
- **Academic Structure**: Branch-scoped hierarchical structure (`academic_years` -> `classes` -> `sections`). Subjects are also branch-scoped and assigned to classes via `class_subjects`.
- **Enrollment**: The junction between a Student, a Branch, and a specific Section for an Academic Year.
- *See [PHASE_3_DATABASE_DESIGN.md](PHASE_3_DATABASE_DESIGN.md) for full schema details.*

## 6. Business Rules
- A student transferring between branches retains their global identity; only a new enrollment is created in the target branch.
- Guardians have isolated views of their children and cannot see other branch data.
- Academic structures are preserved historically (soft deletion) to maintain historical enrollments.
- *See [PHASE_3_BUSINESS_RULES.md](PHASE_3_BUSINESS_RULES.md) for detailed rules.*

## 7. RLS Strategy
- Students and Guardians are scoped by `organization_id` but strictly constrained by active enrollments in the user's accessible branches.
- Enrollments and Academics are scoped by `branch_id`.
- *See [PHASE_3_RLS_DESIGN.md](PHASE_3_RLS_DESIGN.md).*

## 8. API Plan
- Next.js Server Actions with strict Zod validation.
- RBAC checks performed immediately in actions before executing Supabase mutations.
- *See [PHASE_3_API_CONTRACT.md](PHASE_3_API_CONTRACT.md).*

## 9. UX/Screens & 10. Stitch Designs
Approved designs will be generated sequentially via Stitch:
1. **Student List**: Data grid with filters for class/section.
2. **Student Detail**: Unified view of profile, guardians, and enrollments.
3. **Student Create/Edit**: Multi-step wizard.
4. **Guardian UI**: Linking guardians to students.
5. **Academic Year List/Detail**: Managing the calendar.
6. **Class/Section Management**: Hierarchical view.
7. **Subject Management**.
8. **Enrollment Workflow**: Admitting a student to a section.
9. **Transfer Workflow**: Moving a student between branches.
10. **Empty/Loading/Error States**.

## 11. Testing & 12. Regression Strategy
- Every subphase must write `pgTAP` tests for new tables, including strict negative RLS tests.
- After every subphase merge, the Phase 2B regression suite (`02_auth_rls_tests.sql`) MUST run and pass to ensure the foundation was not compromised.

## 13. Subphase Breakdown & 16. Exact Implementation Order
- **Phase 3A**: Database Migrations & RLS for Students + Guardians.
- **Phase 3B**: Database Migrations & RLS for Academics (Years, Classes, Sections, Subjects).
- **Phase 3C**: Database Migrations & RLS for Enrollments & Teacher Assignments.
- **Phase 3D**: API & Server Actions implementation.
- **Phase 3E**: Stitch UI Design & Frontend implementation.

## 14. Risk Register
- **Risk**: Over-complicating the student transfer workflow.
  - **Mitigation**: Standardize on purely creating a new enrollment while leaving the identity in place.
- **Risk**: Breaking Phase 2B RLS.
  - **Mitigation**: Run the full Phase 2B regression suite after every commit.
- **Risk**: Creating massive, unreviewable PRs.
  - **Mitigation**: Strictly adhere to the A, B, C, D, E subphase strategy.

## 15. Definition of Done
Phase 3 is COMPLETE only when the DB is migrated, RLS proven via pgTAP, APIs secured via RBAC, UIs built, E2E tests passing, and the entire Phase 2B regression suite is green.
