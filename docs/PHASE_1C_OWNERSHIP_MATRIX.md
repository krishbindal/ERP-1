# SchoolOS — Ownership Matrix

| Table | Ownership Type | organization_id | branch_id | Derived Through | RLS Strategy |
|---|---|---|---|---|---|
| organizations | SYSTEM | Yes | No | N/A | Org Admin or Super Admin |
| branches | ORGANIZATION | Yes | Yes | N/A | Branch Admin or Super Admin |
| profiles | USER | No | No | N/A | Own user + related guardians/teachers |
| branch_memberships | BRANCH | Yes | Yes | N/A | Branch Context Check |
| roles | ORGANIZATION | Yes | No | N/A | Org Context Check |
| permissions | GLOBAL | No | No | N/A | Read-only to authenticated |
| students | BRANCH | Yes | Yes | N/A | Branch Context Check |
| enrollments | BRANCH | Yes | Yes | N/A | Branch Context Check |
| invoices | BRANCH | Yes | Yes | N/A | Branch Context Check |
| payments | BRANCH | Yes | Yes | N/A | Branch Context Check |

**Note on Denormalization:**
Highly queried operational tables (`students`, `invoices`, `payments`, `attendance`) store BOTH `organization_id` and `branch_id`. While technically redundant (since `branch_id` implies `organization_id`), this denormalization allows massive performance optimizations for organization-level reporting and simplifies RLS logic without requiring recursive joins up to the `branches` table on every query.
