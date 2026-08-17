# SchoolOS — Phase 1C: Final Database Review

## Final Models
1. **ERD Summary:** Comprehensive model utilizing `organization_memberships` and `branch_memberships` to seamlessly support multi-branch users, unified by a central Postgres database.
2. **Ownership:** Branch-level ownership denormalized with `organization_id` for reporting performance.
3. **Membership & Roles:** Explicit junction tables assign roles at the branch context.
4. **RLS Categories:** Handled via helper functions (`auth_user_branches()`) providing isolated branch data views, plus an overriding Super Admin bypass safely tracked via immutable audit logs.
5. **Helper Functions:** Security definer, STABLE helper functions handle RLS lookups to prevent recursive loops.
6. **Audit & Finance:** True immutable models. Financial corrections require reversing entries, not updates. Audit logs are append-only.
7. **Lifecycle:** Soft-delete/Archive by default. Hard deletes restricted to ephemeral data.
8. **Migration Order:** Extensions -> Auth Helpers -> Orgs -> Branches -> Memberships -> Core -> Academics -> Finance.
9. **Branch Offboarding:** Dependency graph identified for building a secure async data exporter function in a future phase.

## Top 10 Remaining Risks
1. **Helper Function Overhead:** Heavy RLS usage using `auth_user_branches()` could impact performance on massive queries. Requires rigorous indexing.
2. **Security Definer Vulnerabilities:** Improperly scoped search_paths on helper functions could lead to privilege escalation.
3. **Data Denormalization Sync:** Denormalizing `organization_id` requires triggers or application discipline to ensure it never desyncs from the parent `branch_id`.
4. **Audit Log Volume:** Immutable audit logs will grow exponentially. A cold-storage archival strategy is needed.
5. **Orphaned Historical Records:** Navigating relationships of a teacher who taught a class in 2024 but left in 2025.
6. **Finance Concurrency:** Handling simultaneous payment requests on the same invoice.
7. **Cross-Branch UI Bleed:** RLS prevents data theft, but the UI must perfectly map state to the active branch to avoid confusing users.
8. **Test Seed Realism:** Security tests must perfectly mimic real-world JWT and connection pool setups.
9. **Role Assignment Complexity:** UI needed for managing overlapping roles (Teacher + Admin).
10. **Branch Deletion:** Hard-deleting a branch (post-export) involves terrifying cascading deletes that could lock tables.

## Verdict
FOUNDATION DATABASE DESIGN APPROVED
