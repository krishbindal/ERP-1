# Phase 2B RLS Coverage Matrix

| Table | SELECT | INSERT | UPDATE | DELETE | Ownership protection | Super Admin | Test |
| ----- | ------ | ------ | ------ | ------ | -------------------- | ----------- | ---- |
| `organizations` | `status='ACTIVE'` AND (member OR org super admin) | DENY | org super admin only | DENY | Super admin scoped to member orgs | Covered |
| `branches` | `status='ACTIVE'` AND (member OR org super admin) | org super admin only | org super admin only | DENY | Super admin scoped to member orgs | Covered |
| `profiles` | `status='ACTIVE'` AND self | DENY | self | DENY | N/A | Covered |
| `organization_memberships` | `status='ACTIVE'` AND (self OR org super admin) | DENY | DENY | DENY | Handled server-side | Covered |
| `branch_memberships` | `status='ACTIVE'` AND (self OR org super admin) | org super admin only | org super admin only | DENY | Super admin scoped to member orgs | Covered |
| `roles` | org member OR org super admin | org super admin only | org super admin only | DENY | Super admin scoped to member orgs | Covered |
| `permissions` | Inherited / Open | DENY | DENY | DENY | N/A | - |
| `role_permissions` | Inherited / Open | DENY | DENY | DENY | N/A | - |
| `user_role_assignments` | self OR org super admin | org super admin only | org super admin only | org super admin only | Super admin scoped to member orgs | Covered |

*Note: Missing explicit `permissions` and `role_permissions` coverage is due to their global read-only nature for all authenticated users, heavily seeded by server scripts.*
