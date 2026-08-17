# Antigravity First Prompt

You are working on SchoolOS.

The `/docs` directory is the authoritative master specification.

Before making code changes:

1. Read every markdown file under `/docs`.
2. Inspect the whole repository.
3. Do not assume the existing architecture is reusable.
4. Produce:
   - Architecture Readiness Report
   - proposed ERD
   - tenancy/ownership model
   - RBAC matrix
   - RLS policy plan
   - app factory/build plan
   - environment plan
   - testing strategy
   - list of conflicts/risks
5. Do not implement ERP modules yet.
6. Do not modify production schemas.
7. Do not introduce a new architecture without documenting the decision.

The critical requirements are:

- one centralized production data platform
- multiple branches
- separate branded branch apps
- branch-level isolation
- Super Admin cross-branch access within authorized organization
- database/server-enforced authorization
- shared codebase where practical

Return evidence and proposed changes, not generic assurances.
