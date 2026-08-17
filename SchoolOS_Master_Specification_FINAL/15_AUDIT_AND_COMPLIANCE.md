# SchoolOS — Audit and Compliance

## Audit requirements

Audit sensitive operations including:

- login/security events where practical
- role changes
- branch changes
- student archival/transfer
- mark changes after publication
- fee changes
- payment/refund operations
- notification administration
- document access where required
- bulk imports/exports
- user suspension
- settings changes
- Super Admin cross-branch operations

## Audit record

Recommended:

```text
actor_id
organization_id
branch_id
action
entity_type
entity_id
timestamp
before_data
after_data
request_id
metadata
```

Do not store passwords/tokens.

## Retention

Retention must be defined with the client and applicable law/contract.

Do not invent legal compliance claims.

## Export

Authorized administrators may need:

- audit export
- financial export
- student data export
- branch export

Exports must be permission-protected and logged.

## Compliance posture

The product should document what it actually implements.

Do not claim a specific legal certification unless formally assessed/certified.
