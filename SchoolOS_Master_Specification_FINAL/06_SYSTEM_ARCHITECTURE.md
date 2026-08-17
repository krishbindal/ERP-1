# SchoolOS — System Architecture

## Target

```text
                   SCHOOLos PLATFORM
                          |
            +-------------+-------------+
            |                           |
       Super Admin                 Shared services
            |                           |
       Branch admin                Auth / APIs / Jobs
            |                           |
      +-----+-----+-----+                |
      |           |     |                |
   Branch A    Branch B Branch C         |
     App         App     App             |
      |           |     |                |
      +-----------+-----+----------------+
                  |
            Authorization
                  |
           Central PostgreSQL
                  |
       +----------+----------+
       |          |          |
    Storage   Notifications Audit
```

## Architecture style

Start as a modular monolith.

Use clear boundaries inside the codebase.

Introduce separate services only when justified by:

- scale
- deployment independence
- security isolation
- operational necessity
- third-party constraints

## Canonical flows

### Authentication

Client -> Auth -> session -> application profile/membership -> authorization context.

### Data read

Client -> authorized API/query -> RLS -> database -> response.

### Sensitive mutation

Client -> authenticated endpoint -> business validation -> authorization -> transaction -> audit -> response.

### Background job

Event -> queue/job -> idempotent handler -> database/provider -> status/audit.

## Centralization rule

No module creates its own tenant architecture.

## Configuration

Global -> organization -> branch -> module -> user preference.

## Failure isolation

A notification provider being unavailable should not corrupt a fee transaction.

A reporting job failing should not block normal attendance entry.

Use transactional boundaries appropriately.
