# SchoolOS — Change Control

## Why

AI-assisted development can drift rapidly. Architectural changes must be deliberate.

## Change levels

### Level 1 — Local implementation
No architecture impact.

### Level 2 — Module design
Affects one module's schema/API/UI.

Requires documentation update + tests.

### Level 3 — Cross-module
Affects shared contracts/data/authorization.

Requires architecture review.

### Level 4 — Foundation
Affects tenancy, auth, RLS, database model, app architecture, deployment.

Requires explicit architecture decision record.

## Change process

```text
Issue/request
 -> impact analysis
 -> proposal
 -> decision
 -> docs updated
 -> migration/test plan
 -> implementation
 -> validation
```

## Forbidden

- silent RLS changes
- silent tenant model changes
- untracked schema changes
- hard-coded temporary branch logic left in production
