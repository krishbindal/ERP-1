# SchoolOS — Import / Export

## Imports

Support where required:

- CSV
- XLSX
- API integration

Potential entities:

- students
- guardians
- teachers
- staff
- classes
- sections
- subjects
- fee assignments
- marks

## Import pipeline

```text
Upload
 -> validate file
 -> parse
 -> map columns
 -> validate rows
 -> duplicate detection
 -> preview
 -> approve
 -> transactional/batched import
 -> reconciliation report
```

## Rules

- Never silently skip invalid rows.
- Produce row-level errors.
- Make large imports restartable/idempotent where possible.
- Preserve import batch metadata.
- Restrict who can import.

## Export

Exports may include:

- CSV
- XLSX
- PDF

Exports must use authorization scope.

Large exports may be asynchronous.

## Security

Exports can contain sensitive data.

Log:

- who exported
- what
- scope
- time
- reason if required
