# SchoolOS — Threat Model

## Assets

- student data
- guardian data
- staff data
- attendance
- marks/results
- financial transactions
- documents
- credentials
- audit records
- push notification credentials
- app signing credentials
- production database

## Primary threats

### T1 — Cross-branch data access

Mitigation:
- RLS
- scoped permissions
- negative tests
- secure APIs

### T2 — Privilege escalation

Mitigation:
- server/database authorization
- role assignment controls
- audit
- negative tests

### T3 — Token/session abuse

Mitigation:
- secure auth configuration
- revocation strategy
- short-lived privileged actions
- secure storage

### T4 — Malicious client modification

Mitigation:
- never trust client role/branch claims as final authority
- RLS/server validation

### T5 — File leakage

Mitigation:
- storage policies
- scoped access
- non-guessable IDs

### T6 — Financial manipulation

Mitigation:
- transactional operations
- strict roles
- audit
- idempotency
- reconciliation

### T7 — Data loss

Mitigation:
- backups
- restore tests
- migration discipline

### T8 — Supply chain/package risk

Mitigation:
- dependency review
- lockfiles
- CI scanning where feasible
- minimum necessary packages

### T9 — App signing compromise

Mitigation:
- secure CI secrets
- limited access
- signing asset backup

### T10 — Prompt/AI implementation drift

Mitigation:
- master docs
- architecture review
- change control
- tests
- no autonomous architectural changes by agents
