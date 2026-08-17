# CI/CD Architecture & Governance

## 1. Core Workflow (`ci.yml`)
- Triggered on PRs to `master` and direct pushes to `master`.
- Enforces strict validation: lint, typecheck, unit tests.
- Contains full database testing (`npx supabase test db`).
- Builds web assets to guarantee buildability.
- Ensures least privilege permissions (`permissions: contents: read`).

## 2. Infrastructure (Self-Hosted Runner)
- Relies on a persistent self-hosted runner labeled `schoolos-ci`.
- **CRITICAL**: The database is reset dynamically within the workflow between tests to prevent persistent contamination.

## 3. Security Audit & Vulnerability Gate
- Runs `npm audit --json`.
- A custom script `scripts/security-audit-gate.js` evaluates the audit against an approved exception list.
- **Policy**: Any CRITICAL or HIGH vulnerability that is production-reachable immediately BLOCKS the build. 
- Transitive build-time exceptions (e.g. Expo/React Native framework limitations) are tracked but do not cause false-positive build failures.
