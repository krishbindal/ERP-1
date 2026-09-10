## 2026-09-04T11:50:52Z

You are the Wave 2 Integration Worker for SchoolOS Frontend Hardening Master Orchestration.
Your working directory is: c:\Users\krish\Desktop\ERP 1\.agents\worker_wave2_integration\
Project root: c:\Users\krish\Desktop\ERP 1
Parent Orchestrator Conversation ID: 777c8e44-9743-470b-8626-e64c595088d4

MANDATORY: Read c:\Users\krish\Desktop\ERP 1\.agents\ORIGINAL_REQUEST.md and c:\Users\krish\Desktop\ERP 1\.agents\orchestrator\PROJECT.md before starting work.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Scope & Mission:
Integrate Wave 2 specialist branches into a single consolidated, verified integration branch `feat/wave2-integrated`:
- Specialist Branch C: `feat/wave2-app-shell` (commit `d577588072cbe25a5aae768f9563a8df33a7cd86`)
- Specialist Branch D: `feat/wave2-auth-ux` (commit `bd748ba74aa90491b1e3d1d08a335aef4f3b78fe`)
- Specialist Branch E: `feat/wave2-forms-feedback` (commit `e2d53906ac4aa671dc474366dbd158e26ae46aef`)

Procedure:
1. Initialize your workspace: BRIEFING.md, DISPATCH.md, and progress.md under c:\Users\krish\Desktop\ERP 1\.agents\worker_wave2_integration\.
2. Git Integration:
   - Create and checkout branch `feat/wave2-integrated` starting from `feat/wave2-app-shell` (commit `d577588072cbe25a5aae768f9563a8df33a7cd86`).
   - Merge `feat/wave2-auth-ux` (commit `bd748ba74aa90491b1e3d1d08a335aef4f3b78fe`).
   - Merge `feat/wave2-forms-feedback` (commit `e2d53906ac4aa671dc474366dbd158e26ae46aef`).
   Note: All 3 branches modified disjoint files; merges should be clean with zero conflicts.
3. User Work Preservation Check:
   - Check `apps/web/src/components/layout/Sidebar.tsx` to verify the user logout POST form remains intact:
     `<form action="/auth/logout" method="POST"><button type="submit" ... aria-label="Log out"><LogOut size={16} /></button></form>`.
   - Verify `package-lock.json` remains untouched and uncommitted.
   - Verify untracked scratch/log files remain untouched.
4. Validation:
   Run in `apps/web`:
   - `npm run typecheck`
   - `npm run lint`
   - `npm test`
   - `npm run build`
   Ensure all 4 commands exit with code 0.
5. Write `handoff.md` with:
   - Observation (branches merged, integrated commit SHA, verified files)
   - Logic Chain
   - Caveats
   - Conclusion
   - Verification Method (commands and outputs)
6. Send a message to orchestrator (`777c8e44-9743-470b-8626-e64c595088d4`) reporting completion.
