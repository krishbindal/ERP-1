# SchoolOS — Testing & QA

## Layers

- Unit
- Database
- RLS/security
- Integration/API
- UI/component
- E2E
- Mobile
- Build/release
- Performance
- Accessibility

## Mandatory cross-branch test matrix

### Branch A user
- read A = allow
- write A = allow if permitted
- read B = deny
- write B = deny
- change A ownership to B = deny

### Branch B user
Equivalent for B.

### Super Admin
Authorized cross-branch read/write operations = allow.

### Parent
Only authorized child/children.

### Student
Only own data.

### Teacher
Only authorized teaching scope.

## Regression

Changes to:

- auth
- RLS
- shared data model
- permissions
- branch configuration

trigger the full security suite.

## Release gates

- type/static checks
- unit
- integration
- RLS
- critical E2E
- app build
- migration validation
- smoke test

## Certification

A critical security failure blocks release.
