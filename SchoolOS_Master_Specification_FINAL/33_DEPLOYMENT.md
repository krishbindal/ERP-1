# SchoolOS — Deployment

## Environments

LOCAL
STAGING
PRODUCTION

## Deployment sequence

1. CI passes.
2. Migration validated.
3. Backup/checkpoint as appropriate.
4. Deploy backend/database changes.
5. Deploy web.
6. Deploy mobile release where applicable.
7. Run smoke tests.
8. Monitor.
9. Record release.

## Rollback

Define rollback separately for:

- web
- database
- server functions
- mobile

Mobile rollback is not always equivalent to server rollback; maintain backward compatibility where possible.

## Production ownership

Critical production resources must ultimately be owned/controlled by the client or agreed organization:

- source repository
- Supabase/project
- domains
- email
- notification providers
- payment gateway
- app store accounts
- signing credentials
- backups
- monitoring
