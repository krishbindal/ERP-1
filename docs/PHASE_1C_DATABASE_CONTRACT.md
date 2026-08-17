# SchoolOS — Phase 1C: Database Contract

## Identity & Tenancy Schema

- **auth.users**: Supabase managed table for authentication. Immutable identity.
- **profiles**: Extended user data. PK: `id` (references auth.users). FKs: None for tenancy. Ownership: USER.
- **organizations**: Top-level tenant. PK: `id`. Ownership: SYSTEM.
- **branches**: Child tenant. PK: `id`, FK: `organization_id`. Ownership: ORGANIZATION.
- **organization_memberships**: Links users to orgs (primarily for org-level admins). PK: `id`. FKs: `user_id`, `organization_id`.
- **branch_memberships**: Links users to branches. PK: `id`. FKs: `user_id`, `branch_id`.
- **roles**: Defines a role within an organization. PK: `id`. FK: `organization_id`.
- **permissions**: System-defined permissions. PK: `id`.
- **role_permissions**: Maps permissions to roles. PK: `role_id`, `permission_id`.
- **user_role_assignments**: Maps roles to branch memberships. PK: `id`. FKs: `branch_membership_id`, `role_id`.

## Multi-Branch Membership Model
Users can belong to multiple organizations and multiple branches.
Roles are assigned at the **branch membership level** (via `user_role_assignments`), meaning a user can be a 'Teacher' in Branch A and 'Exam Coordinator' in Branch B.

Super Admin is managed via an `app_metadata.is_super_admin` claim and an `organization_memberships` record with a globally unrestricted role, checked via RLS.

## Role Assignment Model
- Organization-level roles: Assigned via `organization_memberships` (e.g. Org Admin).
- Branch-level roles: Assigned via `branch_memberships` (e.g. Teacher, Parent, Principal).
- Resource-level scope: Addressed implicitly through relationships (e.g., a teacher only sees classes where they are a record in `teacher_subject_assignments`).

Effective permissions are a UNION of all roles the user possesses within the requested branch context.
