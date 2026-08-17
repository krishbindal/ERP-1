# SchoolOS — Architecture Decision Log

Use one record per decision.

## ADR Template

### ADR-XXXX — Title

Date:

Status: Proposed / Accepted / Rejected / Superseded

Context:

Decision:

Alternatives:

Why:

Impact:

Migration:

Testing impact:

Owner:

## Initial decisions

### ADR-0001 — Centralized production data
Status: Accepted

Decision:
All branches of an organization use one canonical production data platform by default.

Reason:
The client requires all branch data to remain in one place while branch access remains isolated.

### ADR-0002 — Separate branded branch apps
Status: Accepted

Decision:
Each branch can have its own production Android/iOS app, generated from shared code/configuration where practical.

Reason:
The client explicitly requires each branch to have its own app.

### ADR-0003 — Database-first branch isolation
Status: Accepted

Decision:
Branch isolation is enforced through database/server authorization, including RLS for protected database records.

Reason:
Frontend-only isolation is insufficient.

### ADR-0004 — Organization and branch are separate entities
Status: Accepted

Decision:
Organization is above branch in tenancy hierarchy.

Reason:
The product must support multiple branches and future multi-organization reuse.

### ADR-0005 — Modular monolith first
Status: Accepted

Decision:
Start with a modular monolith and avoid premature microservices.

Reason:
Lower operational complexity for a small engineering team.
