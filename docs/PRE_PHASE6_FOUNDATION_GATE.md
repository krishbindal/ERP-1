# Pre-Phase 6 Foundation Gate

## Current Status
**PENDING FINAL CI ON FOUNDATION-HARDENING COMMIT**

This is the canonical current gate. Earlier audit/certification documents are historical snapshots and must not be used as current readiness authority.

## Closed Audit Items
- Password-reset proxy enforcement now fails closed when the reset-check RPC errors.
- Password-reset SECURITY DEFINER functions now use `search_path = ''` and explicit least-privilege EXECUTE grants.
- Login event synchronization now registers before authentication so `SIGNED_IN` cannot be missed.
- Playwright certification now uses direct test accounting without global skip subtraction.
- Identifier concurrency benchmark paths match the current repository layout.
- pg_prove CI image is pinned to a linux/amd64 digest.
- The application permissions helper no longer silently denies every non-super-admin while pretending to implement permissions; it fails closed without an explicit permission set and is documented as a UI hint.
- Repository debugging artifacts `patch_proxy.js` and `scratch/ci_fixes_report.md` have been removed.

## Already Verified Foundation
- Identifier Engine branch/organization/academic-year authorization is enforced at the database function boundary.
- Attendance and Homework have direct adversarial server-boundary E2E coverage.
- Next.js is 16.3.3.
- CI #356 on commit `329d0e16f61e3b27c31df1738f0f114bea5be592` passed the full existing pipeline: 32 unit tests, 479 DB tests, 20 worker assertions, 234 Playwright tests with 0 failures, and zero unexpected skips.

## Non-Blocking Operational Items
- Real third-party communication providers remain deployment work; CI intentionally uses mocks.
- The validation job uses the project self-hosted runner; runner isolation/trust is an infrastructure control outside repository code.
- Backup/DR and broader production observability remain deployment requirements.

## Final Gate
Mark **READY FOR PHASE 6** only after this foundation-hardening commit gets a complete green CI run on its exact SHA and the resulting artifacts are reviewed.
