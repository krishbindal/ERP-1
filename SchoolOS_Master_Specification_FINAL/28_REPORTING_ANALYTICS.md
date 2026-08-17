# SchoolOS — Reporting & Analytics

## Reporting layers

### Branch
- student count
- attendance
- fees
- admissions
- exams
- teacher/activity metrics

### Organization
- branch comparison
- consolidated counts
- revenue/dues where permitted
- attendance comparison
- performance comparison

## Report design

Every report defines:

- audience
- source tables
- scope
- filters
- time range
- permissions
- calculated metrics
- export formats
- refresh strategy

## Authorization

A report must not be able to reveal rows the user could not otherwise access.

## Performance

Prefer indexed queries and pre-aggregated summaries only when justified.

Do not introduce a data warehouse until the reporting workload requires it.
