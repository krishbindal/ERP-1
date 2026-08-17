# SchoolOS — API Contract Template

Copy this template for each endpoint or operation.

## Operation

Name:

Purpose:

Module:

Owner:

## Authentication

Required: yes/no

Auth method:

## Authorization

Required permission:

Required scope:

Organization context:

Branch context:

## Request

Method:

Path/function:

Headers:

Query parameters:

Path parameters:

Body:

## Validation

- required fields
- allowed values
- length limits
- date constraints
- relationship checks
- ownership rules

## Response

Success status:

Example:

```json
{
  "data": {},
  "error": null,
  "meta": {}
}
```

## Errors

Document expected statuses and safe messages.

## RLS/server checks

Describe the database/server policy.

## Audit

Action:

Entity:

Fields logged:

## Side effects

- notifications
- audit
- jobs
- cache invalidation

## Performance

Expected list size:

Indexes required:

## Tests

- authorized success
- unauthorized
- cross-branch denial
- validation failure
- duplicate/idempotency
- boundary cases
