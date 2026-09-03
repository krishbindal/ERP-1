# Post-Foundation Remediation Report

## Current Status
**PENDING FINAL CI ON FOUNDATION-HARDENING COMMIT**

The previously identified pre-Phase-6 remediation findings have been addressed in the current repository state. Final certification remains contingent on a green CI run for the exact hardening commit.

## Verified remediation
1. Identifier branch authorization is enforced inside the SECURITY DEFINER generator.
2. Identifier concurrency and transaction semantics are documented precisely, with runnable benchmark assets.
3. Adversarial server-boundary E2E tests cover unauthorized attendance/homework/communication mutations and locked attendance.
4. Next.js is on 16.3.3.
5. Temporary credentials are enforced by `proxy.ts`, including fail-closed handling when the reset-check RPC itself fails.
6. Password-reset SECURITY DEFINER privileges are explicitly restricted.
7. Playwright result accounting no longer relies on global skip arithmetic.
8. CI pg_prove execution is digest pinned.
9. Repository debug artifacts were removed.
10. The unfinished client permissions helper now fails closed without explicit permission data and is clearly non-authoritative.

## CI evidence already obtained
CI #356 on commit `329d0e16f61e3b27c31df1738f0f114bea5be592` was green before these final hardening changes: database 479/479, Playwright 234/234 with 392 intentional skips, verifier passed, and worker certification 20/20.

## Remaining production-operational work
Real communication providers, backup/DR, observability, and self-hosted runner isolation remain deployment/infrastructure responsibilities and are not represented as completed application features.
