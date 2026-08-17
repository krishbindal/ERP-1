# Phase 2B Privilege Matrix

This document maps the exact PostgreSQL `GRANT` privileges available to the `authenticated` role on the foundation schema tables. It distinguishes between PostgreSQL object-level privileges and RLS policies.

| Table | SELECT | INSERT | UPDATE | DELETE | Who needs it? | Why? |
| ----- | ------ | ------ | ------ | ------ | ------------- | ---- |
| `organizations` | GRANT | DENY | GRANT | DENY | Ordinary users, Super Admins | Read org details. Super admins update org details. |
| `branches` | GRANT | GRANT | GRANT | DENY | Ordinary users, Super Admins | Read branch details. Super admins create/update branches. |
| `profiles` | GRANT | DENY | GRANT | DENY | All users | Read their own profile. Update their own profile. |
| `organization_memberships` | GRANT | DENY | DENY | DENY | All users | Read their memberships. Modifications are edge-function/backend only. |
| `branch_memberships` | GRANT | GRANT | GRANT | DENY | Ordinary users, Super Admins | Read their memberships. Super admins assign branch access. |
| `roles` | GRANT | GRANT | GRANT | DENY | All users, Super Admins | Read available roles. Super admins manage roles. |
| `permissions` | GRANT | DENY | DENY | DENY | All users | Read available permissions. Modified by code deployment only. |
| `role_permissions` | GRANT | DENY | DENY | DENY | All users | Read role capabilities. Modified by code deployment only. |
| `user_role_assignments` | GRANT | GRANT | GRANT | GRANT | All users, Super Admins | Read assigned roles. Super admins manage RBAC assignments. |

*Note: Least privilege is enforced. For example, ordinary users CANNOT insert into `organizations`, thus no `INSERT` grant exists. Even if a flaw existed in RLS, PostgreSQL object-level security would deny the insertion.*
