# SchoolOS — File and Document Storage

## Document categories

Potential:

- student photo
- admission document
- certificate
- report card
- fee receipt
- staff document
- homework attachment
- library/inventory document

## Storage rule

Files are not public just because they have a URL.

Use controlled access.

## Suggested logical path

```text
organization/{organization_id}/branch/{branch_id}/{entity}/{entity_id}/{file_id}
```

## Metadata

Store:

- file ID
- storage path
- owner entity
- organization
- branch
- filename
- MIME type
- size
- uploader
- created_at
- checksum where useful

## Security

- storage policies mirror database ownership.
- signed URLs should be time-limited when appropriate.
- validate file type/size.
- scan untrusted uploads where required.
- do not accept arbitrary executable content.

## Retention

Define per category.

## Migration

File migrations need:

- inventory
- mapping
- checksum/count reconciliation
- failure report
- rollback/restore plan
