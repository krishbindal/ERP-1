# PRE-PHASE-6 DEEP AUDIT REPORT

## 1. Executive Decision
**NOT READY FOR PHASE 6**

The repository remains blocked from Phase 6, but the initial audit report contained one material framework-version error: `apps/web/src/proxy.ts` is the correct convention for Next.js 16 and is not, by itself, a P0 middleware bypass. The gate is therefore based on the confirmed identifier authorization issue, insufficient adversarial E2E coverage, and the need to prove identifier concurrency behavior under Phase-6-style load.

A separate security-maintenance finding is also recorded: the repository currently declares Next.js `16.3.1`, while Next.js published `16.3.3` as the Active LTS security release on August 25, 2026 addressing two critical vulnerabilities. This must be evaluated and patched before production certification.

## 2. Exact Repository State
Audit report was generated at commit `94458988149c93633dd72aa975e38f3700b3f0d7`.
The audited application code baseline is `25b439084c9d84ee79deb9b7c15a2a2a58c4259f` before the audit-report-only commit.

## 3. Repository Inventory
The repository is a monorepo containing:
- `apps/web`: Next.js web application
- `supabase/migrations`: schema, RLS and SECURITY DEFINER functions
- `supabase/functions/communication-worker`: Deno communication worker
- `supabase/tests/db`: pgTAP database tests
- `apps/web/e2e`: Playwright end-to-end tests
- shared packages including authentication and permissions

## 4. Architecture Audit
The overall architecture largely conforms to the documented multi-tenant, multi-branch model: organization/branch separation, RLS, RPC-based mutations, event-driven communication, and explicit authorization layers exist.

The remaining concern is not that the architecture is fundamentally unusable, but that several security-critical boundaries rely on manually enforced authorization inside SECURITY DEFINER functions and on E2E coverage that does not always exercise the same mutation path.

## 5. Corrected Next.js Proxy Finding
**AUD-001 from the original report is REJECTED.**

The web application declares Next.js `16.3.1`. In Next.js 16, the routing convention changed from `middleware.ts` to `proxy.ts`; the official Next.js documentation demonstrates a root `proxy.ts` file for route protection. Therefore `apps/web/src/proxy.ts` is not evidence of an ignored middleware.

The file exports a `proxy` function and an applicable `matcher`, so the filename alone does not demonstrate a temporary-credential bypass.

This finding must not be remediated by renaming `proxy.ts` to `middleware.ts`.

A runtime/build-level test should still prove that the deployed Next.js build executes the proxy and that `requires_password_reset` actually redirects users who require a password change.

## 6. Auth / Temporary Credentials
The temporary-credential logic itself exists inside the proxy and calls `requires_password_reset` for authenticated users. The remaining audit requirement is execution-path verification, not filename correction.

Required proof before production certification:
1. Build the web application using the repository's pinned dependency set.
2. Confirm the proxy is loaded by the built application.
3. Authenticate as a user requiring password reset.
4. Confirm protected routes redirect to `/auth/update-password`.
5. Confirm logout and password-update routes remain usable.

## 7. Multi-Tenancy / RLS Audit
RLS is extensively implemented and the existing database tests cover important organization and branch isolation scenarios. However, SECURITY DEFINER RPCs can bypass table RLS and therefore must perform explicit authorization inside the function body.

This makes the correctness of those manual checks security-critical rather than merely defensive.

## 8. SECURITY DEFINER Audit
The repository contains many SECURITY DEFINER functions. Several established functions use hardened search paths, controlled grants, and explicit branch/organization checks.

The Identifier Engine function is a notable exception and requires remediation and hardening.

## 9. AUD-002 — Identifier Engine Branch Authorization Bypass — P1
`generate_business_identifier(...)` authorizes the caller at organization scope but does not adequately verify authorization for the requested `p_branch_id`.

Because the function is SECURITY DEFINER, the caller can obtain effects that are intentionally unavailable through direct sequence-table access. An authenticated member of an organization may therefore be able to request identifier generation against another branch in that same organization.

This violates the repository's branch isolation model and is a confirmed foundation blocker.

### Required remediation
- Validate that `p_branch_id` exists and belongs to `p_organization_id`.
- Require the caller to have an authorized relationship/role for that branch, with an explicit Super Admin exception where documented.
- Validate any academic-year/entity scope against the requested branch and organization.
- Harden the SECURITY DEFINER function with an explicit safe `search_path` and controlled EXECUTE grants.
- Add a direct DB test proving an A1 user cannot generate identifiers for A2 in the same organization.

## 10. AUD-003 — Identifier Transaction Serialization / Contention — P1 pending workload proof
The current generator advances the sequence using transactional `UPDATE ... RETURNING`. PostgreSQL row locks acquired by the update remain held until the surrounding transaction completes.

This means concurrent identifier requests for the same sequence are serialized. That behavior is useful for correctness, but it can create significant contention when a long-running application transaction generates identifiers and holds the sequence row lock for an extended period.

The current audit report overstated this by calling it a proven "catastrophic deadlock". A deadlock requires a reproducible wait cycle; the static implementation review alone does not prove one.

### Required remediation / proof
Before Phase 6:
- Run a two-session concurrency test against the actual database function.
- Measure lock wait time at increasing transaction durations and concurrency.
- Exercise bulk operations representative of Phase 6.
- Determine whether the intended identifier semantics should be transactional or gap-tolerant.
- Document the resulting guarantee precisely.

Do not introduce an autonomous-transaction mechanism merely to make numbers gap-prone until the business requirement and load test justify it.

## 11. Identifier Transaction Semantics / Documentation — P2
The existing documentation says the identifier engine is not strictly gap-free because outer transaction rollback can consume a value. That statement should be corrected for the current transactional implementation: the sequence-table update participates in the caller's transaction and is rolled back with it.

However, this does not establish a universal business-level guarantee of "no gaps" across every possible application design. The specification should distinguish database transaction rollback behavior from end-to-end identifier lifecycle guarantees.

The existing test suite also needs explicit concurrent-session coverage rather than relying only on savepoint behavior.

## 12. AUD-004 — E2E Test Integrity — P1
Several authorization tests validate only the browser presentation layer. For example, a test that navigates to another branch and checks for `Access Denied` does not prove that a lower-privileged principal cannot invoke the underlying mutation endpoint/RPC directly.

Likewise, a form test that asserts the presence of inputs does not prove that submission persists valid state.

### Required remediation
Security-critical E2E tests must exercise the server boundary directly. Add adversarial tests that:
- authenticate as the lower-privileged role;
- issue the actual POST/RPC/API mutation request;
- assert the request fails with the expected authorization result;
- verify that no unauthorized database state changed;
- repeat this for cross-branch, cross-organization, role-restricted, locked/published, and other privileged mutation paths.

For important create/update flows, fill the form, submit it, and verify resulting database/UI state.

## 13. Attendance Audit
Attendance server-side RPCs contain meaningful authorization and state-transition checks. The remaining gap is certification depth: the E2E suite should independently exercise direct unauthorized mutation attempts rather than relying primarily on route-level denial assertions.

## 14. Homework Audit
Homework authorization is similarly stronger at the server/RPC layer than the current E2E security assertions demonstrate. Direct unauthorized mutation tests and state-verification assertions are required before calling the module security-certified.

## 15. Communication Worker Audit
The communication worker fails closed in production when mock providers are disabled. Production email/push provider integrations are still incomplete and must not be represented as production-complete until their third-party connections are implemented and certified.

## 16. Database Integrity Audit
The schema contains substantial relational constraints and tenant-aware RLS. Some cross-tenant correctness still depends on RLS and explicit authorization rather than composite `(entity_id, branch_id)` foreign keys. This is an architectural trade-off, but every SECURITY DEFINER mutation crossing those boundaries must have explicit tests.

## 17. CI/CD Audit
The pipeline executes a broad validation surface including lint, typecheck, unit tests, database tests, security checks, builds, worker certification and Playwright.

The audit does not treat a green CI result as proof of complete authorization coverage because the E2E assertions themselves can be too weak.

The persistent self-hosted-runner model also remains an operational security concern for untrusted pull requests; this should be assessed against repository contribution policy and runner isolation.

## 18. Dependency / Security Maintenance — P1
The web package currently declares `next` version `16.3.1`. Next.js published `16.3.3` on August 25, 2026 as an Active LTS security release addressing two critical vulnerabilities.

Therefore the dependency baseline is behind the current security patch level and requires immediate assessment and update before production certification.

The previous report statement that no supply-chain/security dependency issue was observed is superseded by this finding.

## 19. Documentation / Requirements Drift — P2
The requirements catalog and reconciliation artifacts still contain contradictory status/evidence combinations in places, including rows marked IMPLEMENTED while their evidence still says missing. Layer columns also appear to mix applicability with implementation state.

This does not directly compromise runtime security, but it reduces the reliability of the repository's own completion/certification claims and must be cleaned before final production certification.

## 20. Complete Findings Register

| ID | Sev | Component | Description |
|---|---|---|---|
| AUD-001 | CLOSED | Auth/Web | Original `middleware.ts` naming finding rejected; `proxy.ts` is the Next.js 16 convention. |
| AUD-002 | P1 | Identifiers | SECURITY DEFINER identifier generation lacks sufficient requested-branch authorization. |
| AUD-003 | P1 | Identifiers | Transactional sequence update serializes concurrent requests and may cause severe contention; Phase-6 workload must be benchmarked. |
| AUD-004 | P1 | E2E Tests | Security-critical authorization tests are too UI-centric and do not consistently prove server-side mutation denial/state immutability. |
| AUD-005 | P2 | Identifier Docs | Transaction/rollback semantics are inaccurately documented and need precise end-to-end guarantees. |
| AUD-006 | P1 | Dependencies | Next.js `16.3.1` is behind the August 2026 security patch `16.3.3` and requires security update assessment. |
| AUD-007 | P2 | Governance | Requirements/reconciliation status and evidence fields contain contradictions. |

## 21. Severity Totals
- **P0:** 0 confirmed
- **P1:** 4
- **P2:** 2
- **P3:** 0

## 22. Phase-6 Blocking Findings
The following remain blocking until repaired and independently verified:

- **AUD-002** — cross-branch identifier authorization
- **AUD-003** — identifier concurrency behavior not yet proven safe for Phase-6 workload
- **AUD-004** — insufficient adversarial authorization test coverage
- **AUD-006** — security-patch assessment/update for Next.js

AUD-005 and AUD-007 are not the primary reasons Phase 6 is frozen, but they must be resolved before final production certification.

## 23. Required Verification Gate Before Phase 6
Phase 6 may begin only after all of the following are true:

1. Cross-branch identifier generation is explicitly rejected at the database function boundary and covered by pgTAP.
2. SECURITY DEFINER identifier function uses hardened search-path and privilege configuration.
3. Identifier concurrency has been exercised with real concurrent database sessions under Phase-6-like load and the documented behavior is accepted.
4. Attendance/Homework and other security-critical E2E tests perform direct unauthorized mutation attempts and verify unchanged database state.
5. Next.js is updated to the currently supported security-patched release line after regression testing.
6. Temporary-credential proxy behavior is proven in a production build/runtime test.
7. The requirements catalog/reconciliation is synchronized so status, evidence and layer semantics agree.

## 24. Final Decision

> **NOT READY FOR PHASE 6**

This decision is intentionally conservative: the repository has a strong base and green CI, but the remaining foundation security and certification gaps must be closed before adding a large new mutation-heavy module.