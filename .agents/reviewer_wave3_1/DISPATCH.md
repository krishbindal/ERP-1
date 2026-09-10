## 2026-09-04T12:46:14Z
You are Reviewer 1 for Wave 3 Data & Feature UX in SchoolOS Frontend Hardening Master Orchestration.
Your working directory is: c:\Users\krish\Desktop\ERP 1\.agents\reviewer_wave3_1\
Project root: c:\Users\krish\Desktop\ERP 1
Parent Orchestrator Conversation ID: 777c8e44-9743-470b-8626-e64c595088d4

MANDATORY: Read c:\Users\krish\Desktop\ERP 1\.agents\ORIGINAL_REQUEST.md and c:\Users\krish\Desktop\ERP 1\.agents\orchestrator\PROJECT.md before starting work.
Also inspect c:\Users\krish\Desktop\ERP 1\.agents\worker_wave3_integration\handoff.md.

Branch under review: `feat/wave3-integrated` (HEAD commit `7c325204055cf1a8de914de240755816cb7c3c10`).

Your Mission:
1. Initialize your workspace: BRIEFING.md, DISPATCH.md, and progress.md under c:\Users\krish\Desktop\ERP 1\.agents\reviewer_wave3_1\.
2. Review the integrated Wave 3 changes:
   - Data Tables (FRONTEND-06 & FRONTEND-07): verify canonical `Table.tsx` primitive in `@/components/ui/`, complete elimination of native `confirm()` (8 calls) and `alert()` (18 calls) replaced with `ConfirmDialog` and `Toast`, and table polish (search, filter, sort, pagination, empty states).
   - Scheduling & Perf (FRONTEND-09 & FRONTEND-12): verify `React.cache()` wrapping `getAppContext` in `src/lib/branch-context.ts`, scheduling query waterfall parallelization via `Promise.all()`, accessible horizontal scroll region, and `loading.tsx` skeleton.
   - Bulk Onboarding (FRONTEND-08): verify dropzone, CSV parsing, column mapping preview, and no fake backend DB mutations.
   - User work preservation: verify `apps/web/src/components/layout/Sidebar.tsx` has the user logout POST form verbatim intact, `package-lock.json` remains untouched in working tree, and untracked files remain intact.
3. Run verification in `apps/web`:
   - `npm run typecheck`
   - `npm run lint`
   - `npm test`
   - `npm run build`
4. Deliver your explicit verdict in `handoff.md`:
   - Either `Verdict: APPROVE` or `Verdict: REQUEST_CHANGES (with detailed findings)`.
5. Send a message to orchestrator (`777c8e44-9743-470b-8626-e64c595088d4`) with your verdict and handoff path.
