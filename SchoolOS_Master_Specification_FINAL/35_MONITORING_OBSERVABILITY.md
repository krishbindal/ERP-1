# SchoolOS — Monitoring & Observability

## Monitor

### Application
- errors
- crashes
- latency
- failed requests

### Database
- query latency
- connection issues
- storage
- failed migrations
- unusual load

### Auth
- login failures
- suspicious patterns
- session issues

### Notifications
- queue failures
- provider failures
- delivery rates

### Finance
- payment failures
- duplicate/reconciliation anomalies

## Correlation

Use request/correlation IDs where practical.

## Alerts

Alert on actionable conditions, not every log line.

## Logs

Do not log:

- passwords
- tokens
- payment secrets
- unnecessary personal data

## Dashboard

Have separate:

- engineering dashboard
- business operations dashboard
- security monitoring view
