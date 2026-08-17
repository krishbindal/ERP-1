# SchoolOS — Client Handover

## Ownership target

Critical production assets should be controlled by the client/organization or an agreed organizational account.

## Handover list

### Source
- Git repository
- deployment configuration
- documentation

### Backend
- Supabase/project
- database
- storage
- auth
- functions
- environment configuration

### Domain
- domain
- DNS
- SSL/hosting

### Communications
- email provider
- SMS provider
- push notification accounts

### Payments
- payment gateway account
- webhooks
- reconciliation configuration

### Mobile
- Google Play Console
- Apple Developer
- app identifiers
- signing assets
- CI/CD credentials

### Operations
- backups
- monitoring
- error tracking
- incident runbook

## Handover rules

- Transfer ownership, not just passwords.
- Rotate temporary developer credentials.
- Confirm client can independently deploy/recover.
- Verify backup access.
- Verify app-store access.
- Verify billing ownership.

## Final handover evidence

Create a signed/approved checklist containing:

- accounts transferred
- access verified
- backups tested
- production deployment tested
- app releases verified
- documentation delivered
- known limitations listed
