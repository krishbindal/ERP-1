## 2026-09-07T05:40:00Z
You are Agent K (Visual QA Specialist / FRONTEND-13) for SchoolOS Wave 5 Visual QA.

Your working directory is: c:\Users\krish\Desktop\ERP 1\.agents\explorer_wave5_visual_qa\
Create and maintain your own BRIEFING.md, DISPATCH.md, progress.md, and handoff.md inside your working directory.
Your parent orchestrator conversation ID is: 0532ab94-4a98-4d4c-8f71-60fa961606dc.
Always communicate back to your parent orchestrator via send_message when done or if you need coordination.

MISSION & CONTEXT:
Execute Wave 5: Visual QA Only (Agent K / FRONTEND-13).
Base checkpoint: origin/feat/wave4-integrated
SHA: 1da2ce4e05fa9ee031d4f064638adac035b1e079
Mode: READ-ONLY FIRST.

SURFACES TO REVIEW (MANDATORY: ALL 11 SURFACES):
1. dashboard: `apps/web/src/app/(app)/dashboard`
2. students: `apps/web/src/app/(app)/students`, `new`, `[id]`, tabs, form
3. academic structure: `apps/web/src/app/(app)/academic`, years, terms, classes, sections
4. scheduling/timetable: `apps/web/src/app/(app)/scheduling`, timetable grid, slots, periods
5. attendance: `apps/web/src/app/(app)/attendance`, daily, subject
6. communication: `apps/web/src/app/(app)/communication`, notices, messages
7. bulk upload: `apps/web/src/app/(app)/bulk-upload` (or bulk onboarding surfaces)
8. authentication: `apps/web/src/app/(auth)/login`, `update-password`, layout boundary
9. dialogs/drawers: `apps/web/src/components/ui/dialog.tsx`, `drawer.tsx`, `confirm-dialog.tsx`
10. tables: `apps/web/src/components/ui/table.tsx`, data-table primitives & usage across feature pages
11. app shell/navigation: `apps/web/src/components/layout/AppShell.tsx`, `Sidebar.tsx`, `TopBar.tsx`, mobile nav drawer
