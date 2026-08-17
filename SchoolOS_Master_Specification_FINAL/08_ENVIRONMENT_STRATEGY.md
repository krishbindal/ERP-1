# SchoolOS — Environment Strategy

## Environments

Minimum:

```text
LOCAL
STAGING
PRODUCTION
```

Optional:

```text
PREVIEW / FEATURE
```

## Data separation

Production client data must never be casually copied into local or preview environments.

Use synthetic or anonymized datasets for testing.

## Environment-specific configuration

Each environment has:

- database URL
- auth configuration
- storage configuration
- notification provider config
- application base URLs
- observability config

Secrets are stored securely.

## Promotion

```text
Feature
 -> PR
 -> CI
 -> Preview/local validation
 -> Staging
 -> security/regression
 -> Production
```

## Production protection

Production changes require:

- reviewed migrations
- tested release artifact
- backup/rollback consideration
- deployment log
- post-deploy smoke test
