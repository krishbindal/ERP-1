# SchoolOS — Product Requirements

## Vision

SchoolOS is a centralized school operating platform for organizations that may own multiple branches. It provides branch-isolated operations and separate branded applications while preserving one canonical data platform.

## Goals

1. Operate multiple school branches safely.
2. Give every branch its own branded app experience.
3. Give Super Admin organization-wide management.
4. Keep branch data isolated by default.
5. Centralize reporting and operational truth.
6. Make the platform maintainable by a small engineering team.
7. Support future expansion to additional organizations.

## Non-goals for the foundation

- Separate production databases for each branch.
- Branch synchronization.
- Microservices by default.
- Frontend-only security.
- Hard-coded branch behavior.
- Duplicated source code for every branch.

## Major product domains

- Identity/tenancy
- Admissions
- Student information
- Guardians
- Academics
- Scheduling
- Attendance
- Homework/learning
- Exams/results
- Fees/finance
- Communication
- Notifications
- Transport
- Library
- Inventory
- Documents/certificates
- Reports/analytics
- Audit
- Settings
- HR/payroll if contracted

## Multi-branch requirements

- organization -> branch hierarchy
- centralized production database
- branch configuration
- branch-specific app branding
- branch-scoped access
- organization-wide Super Admin
- cross-branch reporting only for authorized roles
- branch suspension/archive states
- auditable branch lifecycle

## Product surfaces

- Super Admin web
- Branch Admin web/app
- Teacher app
- Parent app
- Student app
- optional public/admissions web
- optional organization-level reporting portal

Packaging decisions must not change the underlying security/data model.

## Non-functional requirements

### Security
Database/server authorization, least privilege, RLS, auditability, secure secrets, cross-tenant testing.

### Reliability
Backups, restore testing, migrations, monitoring, incident response.

### Scalability
Growth in organizations, branches, users, students, files, notifications, reports and builds.

### Maintainability
Shared components, documented contracts, modular code, predictable deployment.

## Product success criteria

A new branch can be provisioned without copying the production backend.

A branch admin cannot access another branch's protected rows even through direct API/database attempts.

A Super Admin can manage all authorized branches.

A branch-specific Android/iOS build can be generated from the shared codebase.

A full regression suite can be run before each release.
