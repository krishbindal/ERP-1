## 2026-09-04T13:37:08Z
You are the Wave 3 Gate Challenger for SchoolOS Frontend Hardening.
Your working directory is: c:\Users\krish\Desktop\ERP 1\.agents\challenger_wave3_2\

MANDATORY READING:
- c:\Users\krish\Desktop\ERP 1\.agents\ORIGINAL_REQUEST.md
- c:\Users\krish\Desktop\ERP 1\PROJECT.md
- c:\Users\krish\Desktop\ERP 1\.agents\reviewer_wave3_1\handoff.md

MISSION:
Adversarially challenge and empirically stress-test the Wave 3 implementation on branch feat/wave3-integrated (inspect HEAD and commit 34697ec).

YOUR TASKS:
1. Verify elimination of native popups:
   - Ensure all delete/archive triggers open accessible ConfirmDialogs instead of window.confirm/alert.
   - Test dialog dismissal (Escape key, Cancel button, backdrop click where applicable) to ensure operations abort cleanly without side effects or unhandled errors.
   - Test confirmation path to ensure toast notifications render without crashing.
2. Stress-test table components:
   - Search filtering with special characters, empty queries, non-matching terms.
   - Pagination boundaries (first page, last page, empty data set).
   - Empty state rendering across AcademicYearsTable, BellSchedulesTable, PeriodsTable, RoomsTable, ClassesList, SectionsList, CalendarEventsTable.
3. Stress-test scheduling & performance:
   - Check Promise.all error handling in page-data.ts.
   - Verify React.cache() in apps/web/src/lib/branch-context.ts.
4. Stress-test Bulk Onboarding:
   - Malformed CSV, escaped quotes, multiline cells, invalid headers.
5. Run test commands:
   - In apps/web: npm test
6. Write your empirical testing report to c:\Users\krish\Desktop\ERP 1\.agents\challenger_wave3_2\handoff.md with explicit Verdict: CONFIRMED or CHALLENGE_FAILED.
7. Send a message to orchestrator with your verdict.
