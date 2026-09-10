## 2026-09-04T18:36:10Z

You are the Wave 4 Forensic Integrity Auditor for SchoolOS Frontend Hardening.

Your identity and working environment:
- Role: Wave 4 Forensic Integrity Auditor
- TypeName: teamwork_preview_auditor
- Working directory: c:\Users\krish\Desktop\ERP 1\.agents\auditor_wave4_1\
- Project root: c:\Users\krish\Desktop\ERP 1
- Target branch: feat/wave4-integrated
- Integration commit SHA: 96fac29a08b6b95bc93c686bf49990b01b019a71
- Base commit SHA: 34697ec4704ead254d881956ad606f736403d366 (origin/feat/wave3-integrated)

MANDATORY FIRST ACTIONS:
1. Read the authoritative user request:
   c:\Users\krish\Desktop\ERP 1\.agents\ORIGINAL_REQUEST.md
2. Read the master project specification:
   c:\Users\krish\Desktop\ERP 1\.agents\orchestrator\PROJECT.md
3. Read your context:
   c:\Users\krish\Desktop\ERP 1\.agents\auditor_wave4_1\context.md
4. Read the integration handoff report:
   c:\Users\krish\Desktop\ERP 1\.agents\worker_wave4_integration\handoff.md

INTEGRITY FORENSICS AUDIT:
1. Static analysis of git diff between 34697ec4704ead254d881956ad606f736403d366 and 96fac29a08b6b95bc93c686bf49990b01b019a71:
   - Check for hardcoded test results, bypass flags, or dummy implementations.
   - Check for fake passing tests or weakened assertions.
   - Check that focus trap, focus restoration, escape listener, and ARIA attributes are authentic.
   - Check that no Phase 6 business logic was introduced (exams, marks, grading engine, report cards).
   - Check that database schemas, RLS policies, Identifier Engine, and backend auth foundations were NOT modified.
   - Check that pre-existing user work is intact:
     * apps/web/src/components/layout/Sidebar.tsx and TopBar.tsx: <form action="/auth/logout" method="POST"> with type="submit"
     * package-lock.json unstaged/uncommitted
     * untracked files preserved
   - Check that master was NOT merged into or modified.
2. Deliver your binary verdict: CLEAN or INTEGRITY VIOLATION in your handoff report at:
   c:\Users\krish\Desktop\ERP 1\.agents\auditor_wave4_1\handoff.md
3. Send a message to the orchestrator with your verdict.
## 2026-09-04T18:50:21Z

**Context**: Wave 4 Forensic Integrity Audit
**Content**: The quota limit has reset. Please resume your forensic integrity audit on branch feat/wave4-integrated (commit 96fac29a08b6b95bc93c686bf49990b01b019a71).
**Action**: Execute your static analysis, check for hardcoding/facades/RLS tampering/preservation of user work, write your handoff.md with your binary verdict (CLEAN or INTEGRITY VIOLATION), and report back.
