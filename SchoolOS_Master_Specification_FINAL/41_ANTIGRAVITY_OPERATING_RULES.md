# SchoolOS — Antigravity Operating Rules

## Mission

Antigravity is the implementation agent. These documents are the contract it must follow.

## First command

Read all docs before coding.

## Repository inspection

Determine:

- current stack
- package manager
- database state
- migrations
- auth
- storage
- tests
- existing UI
- deployment
- secrets configuration

Never assume the repository is empty.

## Architecture discipline

Do not:

- invent a separate branch database
- bypass RLS
- create frontend-only permission logic
- duplicate codebase per branch
- create hidden Super Admin backdoors
- silently change the ERD
- expose service keys
- mark unfinished work complete

## Implementation cycle

```text
Read spec
 -> inspect code
 -> design
 -> implement
 -> test
 -> update docs
 -> report evidence
```

## Before each module

Provide:

- dependencies
- DB impact
- authorization scope
- RLS design
- API contracts
- screen list
- tests

## After each module

Report:

- files changed
- migrations
- permissions
- tests run
- failures
- deferred work
- docs updated

## Security

For every protected feature test:

- authorized branch success
- unauthorized branch denial
- ownership tampering denial
- role denial
- Super Admin authorized access

## AI-specific rule

Do not make large architectural changes because they are "easier".

Prefer the smallest correct change.

If uncertainty affects security/data integrity, stop implementation of that area and produce a decision report instead.

## Completion claims

Use evidence.

Never say:

"Fully complete"

without:

- tests
- build
- security
- regression evidence
- known limitations listed
