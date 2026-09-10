## 2026-09-04T12:42:18Z

You are the Wave 3 Integration Worker for SchoolOS Frontend Hardening Master Orchestration.
Your working directory is: c:\Users\krish\Desktop\ERP 1\.agents\worker_wave3_integration\
Project root: c:\Users\krish\Desktop\ERP 1
Parent Orchestrator Conversation ID: 777c8e44-9743-470b-8626-e64c595088d4

MANDATORY: Read c:\Users\krish\Desktop\ERP 1\.agents\ORIGINAL_REQUEST.md and c:\Users\krish\Desktop\ERP 1\.agents\orchestrator\PROJECT.md before starting work.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Scope & Mission:
Integrate Wave 3 specialist branches into a single consolidated, verified integration branch eat/wave3-integrated:
- Specialist Branch F: eat/wave3-data-tables (commit 470715d4ddaec3667eace4c5ba8dbfe12d4c1ba9)
- Specialist Branch G: eat/wave3-scheduling-perf (commit a28c31a2f8af08ac527feaf76d36abac844fe11)
- Specialist Branch I: eat/wave3-bulk-onboarding (commit d90c9de885360561b9029dde772124b30f3b07b8)

Procedure:
1. Initialize your workspace: BRIEFING.md, DISPATCH.md, and progress.md under c:\Users\krish\Desktop\ERP 1\.agents\worker_wave3_integration\.
2. Git Integration:
   - Create and checkout branch eat/wave3-integrated starting from eat/wave3-data-tables (commit 470715d4ddaec3667eace4c5ba8dbfe12d4c1ba9).
   - Merge eat/wave3-scheduling-perf (commit a28c31a2f8af08ac527feaf76d36abac844fe11).
   - Merge eat/wave3-bulk-onboarding (commit d90c9de885360561b9029dde772124b30f3b07b8).
   Note: All 3 branches modified disjoint files; merges should be clean with zero conflicts.
3. User Work Preservation Check:
   - Check pps/web/src/components/layout/Sidebar.tsx to verify the user logout POST form remains intact:
     <form action=/auth/logout method=POST><button type=submit ... aria-label=Log out><LogOut size={16} /></button></form>.
   - Verify package-lock.json remains untouched in working tree and uncommitted.
   - Verify untracked scratch/log files remain untouched.
4. Validation:
   Run in pps/web:
   - 
pm run typecheck
   - 
pm run lint
   - 
pm test
   - 
pm run build
   Ensure all 4 commands exit with code 0.
5. Write handoff.md with:
   - Observation (branches merged, integrated commit SHA, verified files)
   - Logic Chain
   - Caveats
   - Conclusion
   - Verification Method (commands and outputs)
6. Send a message to orchestrator (777c8e44-9743-470b-8626-e64c595088d4) reporting completion.
