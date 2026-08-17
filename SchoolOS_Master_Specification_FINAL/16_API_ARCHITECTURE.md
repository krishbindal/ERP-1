# SchoolOS — API Architecture

## API principles

- Explicit authentication.
- Server-side authorization.
- Consistent errors.
- Pagination for large lists.
- Filtering/sorting with limits.
- Idempotency for sensitive repeated operations.
- Audit where appropriate.
- No arbitrary branch selection without authorization.

## Resource naming

Prefer stable resource semantics:

```text
/students
/students/{id}
/enrollments
/attendance
/exams
/marks
/invoices
/payments
```

Exact implementation may use Supabase queries, RPC/functions, or a dedicated API layer.

## Response pattern

Use a consistent shape where the chosen stack supports it:

```json
{
  "data": {},
  "error": null,
  "meta": {}
}
```

Errors should contain safe, actionable information without secrets.

## Pagination

Large resources should support:

- page/cursor
- page size
- maximum page size
- stable sorting

## Authorization

Every endpoint or RPC that returns/mutates protected data must document:

- actor
- permission
- scope
- branch/organization ownership
- audit
- rate limit if relevant

## Transactions

Use atomic database transactions for operations that must succeed/fail together.

Examples:

- payment + allocation + receipt
- mark publication + result state
- user role update + audit

## Idempotency

Consider idempotency keys for:

- payment creation
- webhook handling
- bulk jobs
- notification sends
- provisioning jobs
