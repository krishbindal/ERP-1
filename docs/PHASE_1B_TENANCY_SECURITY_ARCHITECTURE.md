# SchoolOS — Phase 1B: Tenancy & Security Architecture

## 1. Final Tenancy Model

SchoolOS will use a centralized database architecture (all tenants share the same PostgreSQL database). The logical isolation model is hierarchical:

```text
Organization
  ↓
Branches
  ↓
Profiles (Users)
```

**Key Principles:**
- No physical schema or database separation per branch.
- A user (`profile`) is mapped to branches via explicit membership junction tables.
- All protected resources map directly to a `branch_id`.
- Security is enforced deeply at the database level via Postgres Row-Level Security (RLS) ensuring `branch_id` ownership is absolute.

## 2. Membership & Authorization Model

To support multi-branch users (e.g., parents with children in different schools, traveling teachers), we reject the "one fixed branch per user" model.

### Explicit Junctions
- `organization_memberships`: Links a user to an organization, primarily used to grant `org_admin` or `super_admin` status.
- `branch_memberships`: Links a user to a specific branch and assigns their overarching role (e.g., `Teacher`, `Parent`).

A single user can hold multiple `branch_memberships` in the same organization (or even across organizations, depending on business rules).

### Authorization Flow
```text
Authenticated User
      ↓
Organization membership (Check for Super Admin)
      ↓
Branch membership(s) (Check branch access & base role)
      ↓
Permission (Determine valid actions)
      ↓
Scope (Assigned classes, own children, specific resources)
      ↓
Database RLS Policy (Allow / Deny)
```

## 3. JWT / Claims Strategy

We will **NOT** put the entire authorization payload (such as active `branch_id`) universally inside the JWT for security evaluation. Doing so enables users to easily hijack branch scope or forces a hard logout whenever their membership changes.

### JWT Contents (Immutable / Identity)
- `sub`: User ID (`auth.users.id`).
- `email`: User email.
- `app_metadata.is_super_admin`: A boolean flag managed strictly via a secure Edge Function.

### Database State (Mutable / Authoritative)
- Active branch context, exact role assignments, and dynamic permissions remain in the database.
- Database RLS policies will utilize `STABLE` Postgres functions (like `get_user_branches()`) to determine valid access without relying on the client's self-reported branch context.

## 4. RLS Strategy (Row-Level Security)

We reject `row.branch_id = auth.jwt() ->> 'branch_id'` as the sole universal policy.

Instead, policies will evaluate relationships based on the user's authentic memberships.

### Standard RLS Policy Concept (Helper Function)
```sql
CREATE POLICY "Branch users can read their branch data" 
ON protected_table FOR SELECT 
USING (
  branch_id IN (
    SELECT branch_id FROM auth_user_branches(auth.uid())
  )
);
```

### Case Resolutions
1. **Branch A user:** Function `auth_user_branches()` returns `[A]`. Access to Branch B denied.
2. **Branch A + Branch B teacher:** Function returns `[A, B]`. Scope-level RLS policies further restrict read access to only classes specifically assigned to them.
3. **Super Admin:** The `app_metadata.is_super_admin = true` claim triggers an overriding policy `OR (auth.jwt()->'app_metadata'->>'is_super_admin')::boolean = true`, allowing global read/write.
4. **Parent:** Can read across multiple branches because `auth_user_branches()` returns all branches they have children in, but the table-level RLS specifically filters `WHERE student_id IN (SELECT student_id FROM guardian_students WHERE guardian_id = auth.uid())`.
5. **Ownership tampering:** RLS on `INSERT`/`UPDATE` ensures the `branch_id` matches a branch the user is actively authorized to write to.

## 5. Super Admin Model

- **Definition:** Super Admin is a special claim (`is_super_admin: true`) injected into the user's JWT metadata by a highly restricted backend function.
- **Bypass:** Super Admins bypass branch-specific RLS rules globally using dedicated `OR is_super_admin` conditions in the RLS policies.
- **Context Switching:** The frontend application handles filtering data to a specific branch for usability, but the database itself does not artificially restrict the Super Admin to one branch.
- **Auditing:** Every mutation performed by a Super Admin triggers a Postgres `audit_log` event, capturing the exact change and the `auth.uid()` to prevent silent, unaudited global changes.

## 6. Branch Context Model

While the backend evaluates access dynamically based on memberships, the client application must maintain a "Context" (the currently selected branch) for UI/UX purposes.

- The app passes the `X-Active-Branch` header or includes `branch_id` in API payloads.
- The backend validates: *Does this user have permission to act within `X-Active-Branch`?* If yes, the action proceeds. If no, the request is immediately rejected. The client cannot spoof permissions just by sending a different header.
