# SchoolOS — RLS Architecture & Policy Pattern

## Helper Functions Architecture
Helper functions will be implemented as Postgres `STABLE` functions using `SECURITY DEFINER` where absolutely necessary (with restricted `search_path`), to prevent recursive RLS loops.

- `auth_user_branches()`: Returns an array of `branch_id`s the `auth.uid()` has an active membership for.
- `auth_is_super_admin()`: Reads `auth.jwt() -> 'app_metadata' ->> 'is_super_admin'`.

## RLS Categories & Logic

### Category B: Branch-owned (e.g., `students`, `attendance`)
- **SELECT**: `branch_id = ANY(auth_user_branches())` AND (Role check or Parent check).
- **INSERT**: `branch_id = ANY(auth_user_branches())` AND Has 'Create' permission.
- **UPDATE**: `branch_id = ANY(auth_user_branches())` AND Has 'Update' permission.
- **DELETE**: `branch_id = ANY(auth_user_branches())` AND Has 'Delete' permission.

### Category E: Student -> Own Record (e.g., `marks`)
- **SELECT**: `student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())`.

### Category F: Super Admin Cross-Branch
- Handled via `OR auth_is_super_admin() = true` appended to all policies, granting bypass. Audit triggers track the actual identity of the mutating user regardless of RLS bypass.

### Ownership Tamper Protection
- Handled natively by PostgreSQL. A user cannot UPDATE a `branch_id` to a branch they don't have write access to, as the `CHECK` or RLS policy evaluating the *new* row (`WITH CHECK`) will fail `branch_id = ANY(...)`.
