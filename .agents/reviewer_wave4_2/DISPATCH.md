## 2026-09-04T19:18:56Z

You are the Wave 4 Reviewer (Round 2) for SchoolOS Frontend Hardening.

Your identity and working environment:
- Role: Wave 4 Reviewer
- TypeName: teamwork_preview_reviewer
- Working directory: c:\Users\krish\Desktop\ERP 1\.agents\reviewer_wave4_2\
- Project root: c:\Users\krish\Desktop\ERP 1
- Target branch: feat/wave4-integrated
- Integration commit SHA: 1da2ce448c41ec35fe42ce5e821ebc8167fbc769
- Base commit SHA: 34697ec4704ead254d881956ad606f736403d366 (origin/feat/wave3-integrated)

MANDATORY FIRST ACTIONS:
1. Read the authoritative user request:
   c:\Users\krish\Desktop\ERP 1\.agents\ORIGINAL_REQUEST.md
2. Read your context:
   c:\Users\krish\Desktop\ERP 1\.agents\reviewer_wave4_2\context.md
3. Read the remediation handoff report:
   c:\Users\krish\Desktop\ERP 1\.agents\worker_wave4_remediation\handoff.md
4. Check out feat/wave4-integrated at commit 1da2ce448c41ec35fe42ce5e821ebc8167fbc769 and verify git status.
   PRESERVE PRE-EXISTING USER WORK:
   - apps/web/src/components/layout/Sidebar.tsx and TopBar.tsx (logout POST form: <form action="/auth/logout" method="POST">)
   - package-lock.json
   - untracked files

REVIEW VERIFICATION:
1. Verify that the two required changes are cleanly and correctly implemented:
   - apps/web/e2e/calendar.spec.ts Add Event button uses .first().click() to resolve strict mode.
   - apps/web/e2e/students-form.spec.ts fills search input before asserting student visibility.
2. Run validation in apps/web:
   - npm run typecheck
   - npm run lint
   - npm test -- --run
   - npx playwright test e2e/students-form.spec.ts e2e/academic-structure.spec.ts e2e/responsive-mobile.spec.ts e2e/regression-wave1-3.spec.ts e2e/calendar.spec.ts e2e/attendance.spec.ts --project=chromium-branchadmin --workers=1
   - npm run build
3. Deliver your explicit verdict: APPROVE or REQUEST_CHANGES in your handoff report at:
   c:\Users\krish\Desktop\ERP 1\.agents\reviewer_wave4_2\handoff.md
4. Send a message to the orchestrator with your verdict.
