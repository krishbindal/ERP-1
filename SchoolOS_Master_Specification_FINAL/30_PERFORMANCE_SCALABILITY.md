# SchoolOS — Performance & Scalability

## Principles

Measure before optimizing.

## Likely hot paths

- student lists
- attendance entry
- timetable
- fee dues
- payments
- notifications
- reports

## Database

Use:

- proper indexes
- selective queries
- pagination
- batch operations
- query-plan review

## Mobile

Avoid loading entire school datasets.

Use:

- pagination
- caching where safe
- incremental loading

## Large operations

Use background jobs for:

- bulk imports
- large exports
- mass notifications
- report generation

## Performance budgets

Define actual budgets after baseline measurement.

Track:

- API latency
- query latency
- error rate
- app startup
- screen rendering
- notification latency
