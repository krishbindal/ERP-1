# SchoolOS — START HERE

## Purpose

This repository is the master specification for rebuilding SchoolOS from scratch as a production-grade multi-tenant, multi-branch school ERP.

## Non-negotiable target

One organization may own many school branches.

Each branch may have its own branded Android/iOS app.

All branch data remains in one centralized production data platform.

Branch users must not see or modify another branch's protected data.

Super Admin can access all branches inside the authorized organization.

Separate apps are NOT separate production databases.

## Required operating model

```text
Organization
├── Branch A -> branded App A
├── Branch B -> branded App B
└── Branch C -> branded App C
          |
          v
   One centralized backend/data platform
```

## Antigravity first action

Before coding:

1. Read every file in `/docs`.
2. Inspect the current repository.
3. Determine current technology and existing assets.
4. Produce an Architecture Readiness Report.
5. Produce an ERD proposal and data ownership map.
6. Produce the RBAC/permission matrix.
7. Produce the RLS policy map and cross-branch security tests.
8. Produce the branch-app build/provisioning design.
9. Identify conflicts, assumptions, and missing decisions.
10. Do not implement the main ERP until the architecture baseline is approved.

## Source-of-truth rule

These documents are the source of truth. Code does not become the source of truth merely because it exists.

When implementation reveals a necessary design change:

- document the issue,
- propose the change,
- update the affected specification,
- add/update tests,
- then implement.

## Quality rule

Never report "100% complete" without test evidence.

Use these states:

- Planned
- Specified
- Implemented
- Tested
- Certified
- Blocked
- Deferred

## First milestone

The first certification milestone is the platform foundation:

- organization
- branches
- memberships
- authentication
- roles
- permissions
- RLS
- audit foundation
- branch configuration
- Super Admin
- branch app configuration
- cross-branch security tests

Only after this passes should the ERP business modules be built.
