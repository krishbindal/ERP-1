## 2026-09-04T11:02:01Z
You are the Wave 0 Frontend Audit & Spec Explorer for SchoolOS Frontend Hardening Master Orchestration.
Your working directory is: c:\Users\krish\Desktop\ERP 1\.agents\explorer_wave0_audit_2\
Project root: c:\Users\krish\Desktop\ERP 1
Parent Orchestrator Conversation ID: 777c8e44-9743-470b-8626-e64c595088d4

MANDATORY: Read c:\Users\krish\Desktop\ERP 1\.agents\ORIGINAL_REQUEST.md before starting work.
Do not summarize or filter it — read it completely.

Your Mission:
1. Initialize your workspace: BRIEFING.md, DISPATCH.md, and progress.md under c:\Users\krish\Desktop\ERP 1\.agents\explorer_wave0_audit_2\.
2. Search and analyze all frontend audit items, documents, and specifications in `SchoolOS_Master_Specification_FINAL` (especially `19_UX_UI_SYSTEM.md`, `20_SCREEN_INVENTORY.md`, `21_APP_ARCHITECTURE.md`, `31_ACCESSIBILITY.md`, `30_PERFORMANCE_SCALABILITY.md`, `29_TESTING_QA.md`) and in `docs/` (such as `docs/DESIGN.md`, `docs/design/`, `docs/44_DECISION_LOG.md`).
3. Catalog all 14 workstreams (FRONTEND-01 through FRONTEND-14) against the current frontend codebase in `apps/web/src/`:
   - FRONTEND-01: Design System Foundation (semantic design tokens, typography, theme, globals.css)
   - FRONTEND-02: Application Shell (layout, sidebar, topbar, authenticated shell boundaries, login/reset exclusions)
   - FRONTEND-03: Shared UI Primitives (apps/web/src/components/ui/ - Button, Input, Select, Badge, Card, Tabs, Dialog, ConfirmDialog, Drawer, Toast)
   - FRONTEND-04: Auth & Authorization UX (login, password reset, auth redirects, branch context, permission-driven UI hints, unauthorized states)
   - FRONTEND-05: Forms & Feedback (form patterns, validation, errors, success feedback, submit states, server-action errors, eliminate silent error swallowing)
   - FRONTEND-06: Data Tables (table primitive, search, filtering, sorting, pagination, empty/loading/error states)
   - FRONTEND-07: Feature UI Hardening (forms & tables across student, class, section, attendance, etc.)
   - FRONTEND-08: Bulk & Onboarding UX (bulk upload, import wizard, reconciliation, duplicate resolution, onboarding checklist)
   - FRONTEND-09: Scheduling UX (timetable, query orchestration, responsive timetable)
   - FRONTEND-10: Responsive Behavior & Navigation (320px, 375px, 390px, 768px, desktop; mobile nav, clipping/overflow)
   - FRONTEND-11: Accessibility (ARIA, focus entry/containment/restoration, visible focus, escape, label association, keyboard nav, icon buttons)
   - FRONTEND-12: Frontend Performance (query waterfalls, duplicate getAppContext, expensive rerenders, measurement before/after)
   - FRONTEND-13: Visual QA (spacing, typography, hierarchy, surfaces, controls, Stitch consistency)
   - FRONTEND-14: Frontend Testing (component tests, RTL evaluation, Playwright improvements, CRUD coverage, deterministic waits)
4. Separate:
   - Confirmed defects in code
   - Partially confirmed findings
   - Architectural recommendations vs mandatory fixes
   - Stitch visual suggestions
   - Performance targets requiring measurement
   - Strict Phase 6 boundaries (what must NOT be touched: exams, marks, grading, results, report-cards, db schema, RLS, Identifier engine)
5. Write a comprehensive report to:
   `c:\Users\krish\Desktop\ERP 1\.agents\explorer_wave0_audit_2\audit_analysis.md`
6. Write `handoff.md` with the 5 mandatory sections:
   - Observation (with file paths and line numbers)
   - Logic Chain
   - Caveats
   - Conclusion
   - Verification Method
7. Send a message to the orchestrator (Recipient: "777c8e44-9743-470b-8626-e64c595088d4") reporting that your work is complete and linking to `audit_analysis.md` and `handoff.md`.
