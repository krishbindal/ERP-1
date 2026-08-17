# SchoolOS — Phase 1B: Security Test Matrix

This matrix defines the required negative tests that MUST pass automatically via `pgTAP` (or equivalent database testing framework) before any PR is merged.

## Test Matrix

| Test Case | Scenario | Expected Result | Reason |
| :--- | :--- | :--- | :--- |
| **1. Cross-Branch Read** | User from Branch A attempts to `SELECT` records where `branch_id = B`. | 0 rows returned | Standard tenant isolation. |
| **2. Cross-Branch Insert** | User from Branch A attempts to `INSERT` a record with `branch_id = B`. | Row-Level Security Policy Violation | Prevent injecting data into other tenants. |
| **3. Cross-Branch Update** | User from Branch A attempts to `UPDATE` a record where `branch_id = B`. | 0 rows affected | Prevent modifying other tenants' data. |
| **4. Cross-Branch Delete** | User from Branch A attempts to `DELETE` a record where `branch_id = B`. | 0 rows affected | Prevent destroying other tenants' data. |
| **5. Ownership Tampering** | User from Branch A attempts to `UPDATE` a valid Branch A record, changing its `branch_id` to B. | Row-Level Security Policy Violation | Prevent shifting records across tenant boundaries. |
| **6. Multi-Branch Read Legitimate** | Teacher active in Branch A & B attempts to `SELECT` their assigned classes from A and B. | Both records returned | Multi-branch users must access data from all authorized branches. |
| **7. Multi-Branch Read Unauthorized** | Teacher active in Branch A & B attempts to `SELECT` data from Branch C. | 0 rows returned (for Branch C) | Cannot exceed authorized boundaries. |
| **8. Super Admin Read** | Super Admin attempts to `SELECT` records from Branch A, B, and C. | All records returned | Super Admin has global read access. |
| **9. Super Admin Write** | Super Admin attempts to `UPDATE` a record in Branch C. | Update successful, Audit log created | Super Admin has global write access but must be audited. |
| **10. Revoked Membership** | User whose Branch A membership was revoked attempts to `SELECT` Branch A data. | 0 rows returned | JWT identity remains valid, but dynamic database membership check fails. |
| **11. Suspended User** | Globally suspended user attempts to read any data. | 0 rows returned | Suspended status overrides all memberships. |
| **12. Suspended Branch** | User attempts to login or modify data in a branch marked as 'Suspended' (e.g. non-payment). | 0 rows returned / Auth rejected | Suspended branches lock out standard users. |

## Implementation Note

These tests will be written in SQL using `pgTAP` and executed against a local Supabase instance during the GitHub Actions CI pipeline. Tests will explicitly `SET ROLE authenticated` and inject mock JWTs using `set_config('request.jwt.claims', ...)` to simulate specific user contexts.
