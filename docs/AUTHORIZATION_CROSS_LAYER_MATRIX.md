# Authorization Cross-Layer Matrix

| Capability | UI | Shared Auth/Permissions | Server/API | RLS |
| :--- | :--- | :--- | :--- | :--- |
| Branch A read Branch A | Allow | Allow | Allow | Allow |
| Branch A read Branch B | Deny | Deny | Deny | Deny |
| Multi-branch user A+B | Allow | Allow | Allow | Allow |
| Unauthorized branch C | Deny | Deny | Deny | Deny |
| Super Admin authorized org | Allow | Allow | Allow | Allow |
| Revoked membership | Deny | Deny | Deny | Deny |

## Implementation Trace
- **UI**: Addressed via `activeBranchId` context blocking UI elements.
- **Shared Auth/Permissions**: `canAccessBranch(branchId)` returns a boolean client-side authorization hint in `packages/permissions`.
- **Server/API**: Edge functions check valid token + branch parameter.
- **RLS**: Defined in PostgreSQL using `EXISTS(SELECT 1 FROM branch_memberships WHERE ...)` security definer checks.
