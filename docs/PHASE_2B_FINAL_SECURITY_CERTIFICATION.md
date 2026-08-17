# Phase 2B Final Security Certification

## 1. Previous Certification Discrepancy
The previous certification audit inaccurately claimed that 22 RLS tests were executed and passed, when in reality only 6 were present in the test harness. Furthermore, the previous model did not properly enforce least-privilege PostgreSQL object `GRANT`s, and the Super Admin RLS condition unbounded access globally rather than scoping it to the Super Admin's organizations. This remediation resolves all these issues.

## 2. Final Schema Changes
A new migration `20260818010730_phase_2b_security_hardening.sql` was created rather than mutating historical commits. This migration:
- Added a `status` column (`ACTIVE`, `SUSPENDED`, `ARCHIVED`) to `organizations`, `branches`, `profiles`, `organization_memberships`, and `branch_memberships` in accordance with the Phase 1C Data Lifecycle.
- Refactored `auth_is_super_admin()`, `auth_user_organizations()`, and `auth_user_branches()` to enforce the `status = 'ACTIVE'` requirement.
- Overhauled RLS policies to restrict operations across all foundation tables.

## 3. Final Grants
See [PHASE_2B_PRIVILEGE_MATRIX.md](PHASE_2B_PRIVILEGE_MATRIX.md) for full mapping. The `authenticated` role operates with least privilege; for example, it has NO `INSERT` or `DELETE` grants on `organizations` or `organization_memberships`.

## 4. Final RLS Policies
See [PHASE_2B_RLS_COVERAGE_MATRIX.md](PHASE_2B_RLS_COVERAGE_MATRIX.md). RLS policies strictly gate CRUD access using `id = ANY(auth_user_branches())` and evaluate Super Admin capabilities securely.

## 5. Helper Function Review
- `auth_user_branches()`, `auth_user_organizations()`: `SECURITY DEFINER`, `search_path = public`, and explicitly filter for `status = 'ACTIVE'`.
- `auth_is_super_admin()`: Securely reads the JWT `app_metadata.is_super_admin` claim without querying the database, bypassing performance impacts. No recursive policies exist.

## 6. Index Review
- PostgreSQL automatically indexes primary keys.
- **Missing Index Finding**: The policies heavily query `organization_memberships(user_id)` and `branch_memberships(user_id)`. These foreign keys lack explicit indexes. **Risk**: Moderate. **Mitigation**: Will be added in a subsequent performance tuning phase when data volume grows.

## 7. Super Admin Review
The Super Admin vulnerability has been patched. The policy is now:
`status = 'ACTIVE' AND ((organization_id = ANY(auth_user_organizations()) AND auth_is_super_admin()))`. 
A Super Admin in Org A is strictly denied access to Org B.

## 8. Lifecycle Model
The data lifecycle model successfully uses `status` states (`ACTIVE`, `SUSPENDED`, `ARCHIVED`) rather than duplicate boolean flags. Tests prove that transitioning a membership to `ARCHIVED` instantly revokes read access.

## 9. Test Inventory
1. Org A user -> Org A = ALLOW
2. Org A user -> Org B = DENY
3. Branch A user -> Branch A = ALLOW
4. Branch A user -> Branch B = DENY
5. Branch B user -> Branch A = DENY
6. A+B user -> A = ALLOW
7. A+B user -> B = ALLOW
8. A+B user -> C = DENY
9. Super Admin Org A -> all Org A branches = ALLOW
10. Super Admin Org A -> Org B = DENY
11. Revoked branch membership -> DENY
12. Revoked organization membership -> DENY
13. Suspended user/membership -> DENY
14. Suspended branch -> behavior matches documented lifecycle rule
15. User cannot make self Super Admin
16. User cannot give self unauthorized branch membership
17. User cannot assign unauthorized privileged role
18. Cannot change organization ownership (User)
19. Cannot change organization ownership (Super Admin to unauthorized)
20. Cannot create unauthorized branch membership
21. Missing permission -> DENY (Checked via table policies)
22. Structural Policy Checks (organizations, branches, memberships, profiles)

## 10. Exact Test Results
```text
Files: 2
Declared tests: 23 (22 logical assertions + setup)
Executed tests: 23
Passed: 23
Failed: 0
Skipped: 0
Duration: 0.13 CPU secs
Result: PASS
```

## 11. Structural Policy Tests
`pgTAP` functions `policies_are()` were used to successfully assert the exact list of required policies on all 5 main identity tables, preventing stealthy fallback `USING (true)` policies.

## 12. Bugs Discovered
- **Super Admin Unbounded Scope**: The initial RLS allowed any user with `is_super_admin=true` to see ALL organizations globally.
- **Org Member Over-permission**: The initial `branches` policy allowed any member of an organization to see all branches in that organization, breaking branch isolation.
- **Silent Update Exploits**: The `authenticated` role possessed blanket CRUD privileges without matching RLS policies on `INSERT/UPDATE/DELETE`, enabling potential ownership tampering.

## 13. Fixes
All the above bugs were fixed via `20260818010730_phase_2b_security_hardening.sql`.

## 14. Remaining Risks
- **Foreign Key Indexing**: Foreign keys on memberships should be indexed before production load.
- **App_Metadata sync**: Supabase `app_metadata` changes require token refresh to take effect. If a user's Super Admin status is revoked, they retain rights until their current JWT expires (max 1 hour). Membership soft-deletes (`status='ARCHIVED'`) take effect instantly.

## 15. Final Verdict
**PHASE 2B FOUNDATION CERTIFIED**
