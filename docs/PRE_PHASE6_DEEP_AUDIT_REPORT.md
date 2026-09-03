# PRE-PHASE-6 DEEP AUDIT REPORT — HISTORICAL BASELINE

This file records the original pre-remediation audit snapshot. It is intentionally retained for traceability and is **not** the current Phase-6 readiness authority.

The historical findings AUD-002 through AUD-007 were subsequently remediated or superseded by later repository changes. Use `docs/PRE_PHASE6_FOUNDATION_GATE.md` as the current gate.

## Historical findings
- AUD-001: rejected; Next.js 16 uses `proxy.ts`.
- AUD-002: identifier branch authorization — remediated in the identifier authorization hardening migration and adversarial DB tests.
- AUD-003: identifier concurrency — benchmark infrastructure and precise transaction semantics added; benchmark launcher path corrected in the current hardening work.
- AUD-004: adversarial E2E coverage — direct server-boundary mutation tests added for attendance, homework, communication and locked state.
- AUD-005: identifier transaction semantics — documentation corrected to distinguish DB rollback semantics from end-to-end business lifecycle gaps.
- AUD-006: Next.js dependency — current web package is on 16.3.3.
- AUD-007: requirements/governance drift — current foundation gate supersedes this historical status document.

Do not use the old severity totals or old commit hashes below this line as current status.
