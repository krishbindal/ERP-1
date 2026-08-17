# SchoolOS — Data Architecture

## Data layers

### Transactional database

Canonical operational data.

### Object storage

Documents/files/images.

### Search/indexing

Introduce only when query needs justify it.

### Analytics

Start with operational reporting. Add a warehouse later if scale/BI requirements justify it.

## Ownership

Every branch-owned record must have an unambiguous route to its branch.

For high-volume branch-owned tables, explicit:

```text
organization_id
branch_id
```

is preferred when it simplifies secure policies and query planning.

## History

Model temporal entities explicitly where history matters:

- enrollment
- teacher assignment
- role assignment
- fee changes
- report publication
- employment

## IDs

Use stable IDs suitable for APIs and distributed clients.

Avoid exposing predictable sequential IDs for sensitive external identifiers unless there is a deliberate reason.

## Data retention

Define retention separately for:

- transactional data
- audit data
- documents
- notifications
- financial records
- logs

## Data migration

Every migration must define:

- source
- destination
- validation
- duplicate handling
- rollback/backup plan
- reconciliation report
