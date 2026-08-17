# SchoolOS — Technology Decision Framework

## Principle

Choose technology based on maintainability, security, client handover, mobile distribution, testing, and long-term operating cost.

## Required decisions before implementation

1. Web stack.
2. Mobile stack.
3. Supabase/Postgres usage.
4. Server-side function strategy.
5. Object storage.
6. Push notification provider.
7. Email provider.
8. SMS provider.
9. Payment gateway.
10. Error monitoring.
11. Analytics.
12. CI/CD.
13. Domain strategy.
14. App store ownership.

## Baseline

The current project direction assumes:

- PostgreSQL/Supabase for centralized data/auth/storage where suitable.
- RLS for database authorization.
- Version-controlled migrations.
- Shared code for branch apps.
- Git-based source control.

## Decision rule

No architectural dependency is accepted solely because an AI agent suggested it.

Evaluate:

- security
- licensing
- cost
- reliability
- maintainability
- vendor lock-in
- documentation
- community/official support
- client ownership

## Avoid premature choices

Do not introduce:

- microservices
- event buses
- Kubernetes
- complex data warehouses
- offline-first synchronization
- custom identity systems

unless requirements justify them.
