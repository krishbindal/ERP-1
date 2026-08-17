# SchoolOS — Risk Register

| Risk | Impact | Likelihood | Mitigation | Owner | Status |
|---|---|---|---|---|---|
| Cross-branch data leak | Critical | Medium | RLS + negative tests | Tech | Open |
| Wrong app points to branch | High | Medium | Build config + provisioning tests | Mobile | Open |
| AI architecture drift | High | High | Master docs + change control | Tech | Open |
| Bad migration | Critical | Medium | Staging + backups + migration tests | Backend | Open |
| Production ownership tied to developer | High | Medium | Client-owned accounts | Ops | Open |
| Notification misrouting | High | Medium | recipient authorization | Backend | Open |
| Financial duplicate transaction | Critical | Medium | idempotency + reconciliation | Finance | Open |
| Missing restore validation | Critical | Medium | restore drills | Ops | Open |
| App store signing loss | High | Low/Medium | secure backup | Mobile | Open |
| Scope explosion | High | High | roadmap + module priorities | Product | Open |

Update continuously.
