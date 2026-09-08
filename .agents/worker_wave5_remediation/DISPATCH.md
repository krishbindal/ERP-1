## 2026-09-07T05:47:57Z

You are the Wave 5 Remediation Worker (teamwork_preview_worker) for SchoolOS.

Your working directory is: c:\Users\krish\Desktop\ERP 1\.agents\worker_wave5_remediation\
Create and maintain your own BRIEFING.md, progress.md, and handoff.md in your working directory.
Your parent orchestrator conversation ID is: 0532ab94-4a98-4d4c-8f71-60fa961606dc.
Always report back to your parent orchestrator via send_message when done.

============================================================
MISSION & CONTEXT
============================================================
Wave 5 Visual QA review (Agent K) has concluded with 5 targeted usability, responsive, and accessibility findings that require surgical remediation.
Read the findings in:
`c:\Users\krish\Desktop\ERP 1\.agents\explorer_wave5_visual_qa\visual_qa_report.md`
and `c:\Users\krish\Desktop\ERP 1\.agents\explorer_wave5_visual_qa\handoff.md`.

Your mission is to implement the SMALLEST NECESSARY CHANGES for these 5 owning areas, validate them with full automated test suites, and create a focused commit.

DO NOT:
- modify backend
- modify database
- modify RLS/security foundations
- implement Phase 6 (exams, marks, grading, results, report cards)
- perform broad redesigns of screens
- touch or revert pre-existing user work:
  * `apps/web/src/components/layout/Sidebar.tsx` (contains user logout-button fix — DO NOT TOUCH)
  * `package-lock.json` (DO NOT TOUCH, DO NOT COMMIT)
  * untracked scratch/debug/log files (DO NOT DELETE)
- merge into master

============================================================
MANDATORY INTEGRITY WARNING
============================================================
DO NOT CHEAT. All implementations must be genuine. DO NOT
hardcode test results, create dummy/facade implementations, or
circumvent the intended task. A teamwork_preview_auditor will independently
verify your work. Integrity violations WILL be detected and your
work WILL be rejected.

============================================================
THE 5 TARGETED OWNING AREAS TO REMEDIATE
============================================================

1. **Scheduling Navigation (`apps/web/src/app/scheduling/page.tsx`)**:
   - Replace raw `<a>` tags for tabs ("Rooms", "Bell Schedules", "Periods") with Next.js client-side `<Link>`.
   - Add `aria-current={tab === key ? "page" : undefined}` on the active tab link.
   - Add `overflow-x-auto` to the tab `<nav className="-mb-px flex space-x-8">` container so tabs scroll cleanly on 320px mobile viewports without horizontal clipping.

2. **Academic Structure Navigation (`apps/web/src/app/academic-structure/components/AcademicStructureNav.tsx`)**:
   - Add `overflow-x-auto` to the `<nav className="-mb-px flex space-x-8">` container so tabs scroll smoothly on 320px mobile viewports.
   - Add `aria-current={isSelected ? "page" : undefined}` to the tab links.
   - Replace hardcoded `border-blue-500 text-blue-600` with canonical semantic tokens `border-primary text-primary`.
   - Replace `text-gray-500 hover:text-gray-700 hover:border-gray-300` with `text-muted-foreground hover:text-foreground hover:border-border`.
   - Ensure touch-accessible padding (`py-3 px-3`).

3. **Communication Inbox (`apps/web/src/app/communication/inbox/page.tsx`)**:
   - The current inbox page has raw unstyled HTML (`<div><h1>Inbox</h1>...</div>`).
   - Wrap in layout spacing (`space-y-6 max-w-5xl`).
   - Wrap recipient messages in canonical `<Card>`, `<CardHeader>`, `<CardContent>`, with semantic tokens (`bg-surface`, `border-border`, `text-foreground`, `text-muted-foreground`).
   - Surface sender, recipient, message content, status badge, and sent date cleanly.
   - Preserve `data-testid="inbox-list"` for test compatibility.

4. **Navigation Discoverability (`nav-items.ts` & `students/page.tsx`)**:
   - In `apps/web/src/components/layout/nav-items.ts`:
     Import `MessageSquare` from `lucide-react`.
     Add `{ href: '/communication', label: 'Communication', icon: MessageSquare }` to `navItems`.
   - In `apps/web/src/app/students/page.tsx`:
     Add a secondary button next to "Add Student":
     `<Link href="/students/bulk"><Button variant="outline">Bulk Import</Button></Link>`.
     Ensure the existing "Add Student" link and button text/role remain intact so E2E tests are not regressed.

5. **Student Detail Page (`apps/web/src/app/students/[id]/page.tsx`)**:
   - Wrap "Back to List" with touch-accessible padding (`min-h-[44px] inline-flex items-center text-primary hover:underline text-sm font-medium gap-1`).
   - Update `<dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">` so it stacks cleanly on 320px/375px screens.
   - Wrap profile information and guardian information in canonical `<Card>`, `<CardHeader>`, `<CardTitle>`, `<CardContent>`.
   - Display student status using canonical `<Badge>` (`variant={student.status === 'ACTIVE' ? 'success' : 'default'}`).

============================================================
VALIDATION REQUIREMENTS
============================================================
Run all of the following commands in `c:\Users\krish\Desktop\ERP 1`:
1. Unit tests: `npm run test --workspace=apps/web` (all 161 tests must pass)
2. Typecheck: `npm run typecheck --workspace=apps/web` (0 type errors)
3. Linter: `npm run lint --workspace=apps/web` (0 lint errors)
4. Playwright mobile responsive test: `npx playwright test apps/web/e2e/responsive-mobile.spec.ts` (must pass)

============================================================
GIT COMMIT & HANDOFF
============================================================
- Stage ONLY the files modified for the 5 targeted areas.
- STRICTLY DO NOT stage or commit `apps/web/src/components/layout/Sidebar.tsx`, `package-lock.json`, or any untracked scratch/log files.
- Commit with message:
  `fix(frontend): wave 5 visual qa polish and usability remediation`
- Record git status and commit SHA in `handoff.md`.
- Send message back to parent orchestrator (`0532ab94-4a98-4d4c-8f71-60fa961606dc`) when complete.
