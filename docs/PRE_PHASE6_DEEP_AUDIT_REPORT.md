# PRE-PHASE-6 DEEP AUDIT REPORT

## 1. Executive Decision
**NOT READY FOR PHASE 6**

A deep forensic audit of the `krishbindal/ERP-1` repository has revealed a severe P0 security bypass (Next.js middleware misconfiguration), multiple P1 multi-tenancy and concurrency blockers in the Identifier Engine, and systemic weaknesses in E2E test integrity (tests passing by validating UI state instead of mutation authorization). These must be fully resolved before Phase 6 can commence.

## 2. Exact Repository HEAD
`25b439084c9d84ee79deb9b7c15a2a2a58c4259f` (Verified via user instruction / exact current commit)

## 3. Repository Inventory
The repository is structured as a standard monorepo containing:
- `apps/web`: Next.js frontend
- `supabase/migrations`: 45+ SQL migrations containing schema, RLS, and SECURITY DEFINER RPCs
- `supabase/functions/communication-worker`: Deno-based background event processor
- `supabase/tests/db`: pgTAP database tests
- `apps/web/e2e`: Playwright End-to-End tests

## 4. Architecture Audit
The overall architecture largely conforms to the Phase 3+ specifications (Branch/Organization multi-tenancy, RPC-based mutations, Event-driven communication worker). However, edge-protection via middleware is structurally broken.

## 5. Security Audit
**CRITICAL FINDING (P0):** 
The temporary credentials enforcement and edge-level route protection are entirely bypassed. The intended Next.js middleware file was incorrectly named `apps/web/src/proxy.ts`. Next.js strictly requires middleware to be named `middleware.ts`. Consequently, the framework entirely ignores the file, meaning users are never forced to reset their passwords, and unauthorized users can potentially reach protected pages.

## 6. Multi-Tenancy/RLS Audit
RLS is extensively implemented across tables using `auth.uid()` and branch lookup functions. However, several mutations use `SECURITY DEFINER` RPCs to bypass RLS for complex operations (like Attendance or Homework grading), relying on manual authorization checks inside the function body.

## 7. SECURITY DEFINER Inventory
The database contains over 60 `SECURITY DEFINER` functions. Many are safe wrappers (`get_auth_my_student_ids`, `auth_is_super_admin`). However, mutating functions like `generate_business_identifier`, `rpc_publish_homework`, `rpc_save_attendance`, and `rpc_claim_platform_events` manually assume authorization responsibilities. 

**Vulnerability:** `generate_business_identifier` uses `SECURITY DEFINER` to bypass sequence RLS but fails to perform a branch-level authorization check, breaking branch isolation.

## 8. Auth Audit (Temporary Credentials)
As noted in the Security Audit, the `requires_password_reset` logic is fundamentally disconnected from the web application lifecycle due to the `proxy.ts` misconfiguration.

## 9. Identifier Engine Audit
- **Branch Scoping Bypass (P1):** The engine checks `organization_memberships` but fails to check if the caller belongs to `p_branch_id`. A user in Branch A can generate identifiers for Branch B.
- **Concurrency Bottleneck (P1):** The engine uses `UPDATE ... RETURNING` natively inside the caller's transaction. While this prevents sequence gaps on rollback (contrary to what `IDENTIFIER_ENGINE_DESIGN.md` claims), it imposes a strict serialization lock. If an outer transaction (e.g., bulk grading in Phase 6) takes 3 seconds, all other identifier generations for that entity across the system will block, risking massive deadlocks under load.

## 10. Attendance Audit
Server-side RPCs (`rpc_save_attendance`, `rpc_correct_attendance`) correctly check `fn_has_branch_permission` and validate state transitions. However, E2E tests for attendance authorization merely assert that navigating to an unauthorized branch URL renders an "Access Denied" UI element, completely failing to test if the underlying API actually rejects unauthorized mutations.

## 11. Homework Audit
Homework RLS and RPCs (`rpc_publish_homework`) correctly check `teacher_subject_assignments` to authorize teachers. However, similar to Attendance, the E2E tests are largely "happy path" or UI-only authorization assertions.

## 12. Communication Worker Audit
The worker (`apps/worker/src/index.ts` is actually located in `supabase/functions/communication-worker/index.ts`) is well-structured. It fails closed in production (refusing to use Mock providers). 
- **Zero-recipient behavior:** Handled correctly by marking the event as `FAILED` (allSuccess = false) if the recipient list is empty, though this may trigger DLQ alerts unnecessarily depending on business rules.

## 13. Database Integrity Audit
The schema enforces extensive relational integrity using `ON DELETE CASCADE`. Soft-delete (`deleted_at`) is present on many entities. 
- **Constraint Gap:** Some cross-tenant boundaries rely heavily on RLS and UI validation rather than composite Foreign Keys containing `(id, branch_id)`, though this is a known architectural trade-off in the existing codebase.

## 14. Test Integrity Audit
**Major Debt (P1):**
Playwright tests provide a false sense of security. 
1. Tests labeled "Teacher cannot bypass authorization for another branch" only perform `page.goto()` and check for `Access Denied` text. They do not simulate raw API requests to ensure the server blocks the mutation.
2. Form submission tests (e.g., `Students/new`) merely assert that input fields are visible, without actually filling out the form, submitting it, and verifying database state.

## 15. CI/CD Audit
The CI pipeline (`schoolos-pipeline.yml`) successfully runs the full test suite and pgTAP tests. However, a recent execution hung for 40+ minutes due to a WSL/Docker volume mount issue affecting `pg_prove`. While CI is "green" when it finishes, it is green against flawed E2E assertions.

## 16. Dependency/Security Audit
No direct supply chain vulnerabilities observed in this static pass, but the misnamed Next.js middleware is a fundamental deployment/security gap.

## 17. Documentation Drift Audit
- `IDENTIFIER_ENGINE_DESIGN.md` explicitly claims the engine is "NOT strictly gap-free" due to rollbacks. This contradicts the actual Postgres behavior of transactional updates (proven in `07_identifier_engine.sql`), which *are* rolled back, meaning it *is* strictly gap-free but causes high lock contention.

## 18. Phase-6 Prerequisite Audit
Phase 6 (Exams & Marks) requires bulk identifier generation and heavy transactional updates. The current Identifier Engine's serialization lock (holding the sequence row lock until the outer transaction commits) will cause catastrophic deadlocks when bulk-generating marks or report cards. It is architecturally unready for Phase 6.

## 19. Complete Findings Register

| ID | Sev | Component | Description |
|---|---|---|---|
| AUD-001 | P0 | Auth/Web | `proxy.ts` is ignored by Next.js. Temporary credentials enforcement is completely dead. |
| AUD-002 | P1 | Identifiers | `generate_business_identifier` fails to check branch authorization, allowing cross-branch generation. |
| AUD-003 | P1 | Identifiers | Transactional lock on sequence table will cause massive contention/deadlocks under Phase 6 load. |
| AUD-004 | P1 | E2E Tests | Authorization E2E tests are brittle UI-only assertions; they do not test server-side mutation blocks. |
| AUD-005 | P2 | Docs | `IDENTIFIER_ENGINE_DESIGN.md` fundamentally misunderstands Postgres transactional rollbacks. |

## 20. P0/P1/P2/P3 Totals
- **P0:** 1
- **P1:** 3
- **P2:** 1
- **P3:** 0

## 21. Blocking Findings
- **AUD-001** blocks all production deployment (Security).
- **AUD-002** blocks cross-branch isolation (Security).
- **AUD-003** blocks Phase 6 architecture (Data/Performance).
- **AUD-004** blocks certification trust (Testing).

## 22. Non-blocking Findings
- **AUD-005** (Documentation drift).

## 23. Explicit Remediation Recommendations
1. Rename `apps/web/src/proxy.ts` to `apps/web/src/middleware.ts` (or `apps/web/middleware.ts`) and ensure Next.js loads it properly.
2. Update `generate_business_identifier` to include: `auth_user_has_branch_role(p_branch_id)`.
3. Refactor the Identifier Engine to use a separate autonomous transaction (e.g., via `dblink` or `pg_background`) OR accept gaps by removing the outer transaction requirement, preventing long-running locks.
4. Rewrite Playwright authorization tests to execute `request.post(...)` directly using lower-privileged user contexts to prove the server rejects the mutation.

## 24. Final Decision

> **NOT READY FOR PHASE 6**
