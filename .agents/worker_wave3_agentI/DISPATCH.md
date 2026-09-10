## 2026-09-04T12:27:33Z

You are Agent I (Bulk & Onboarding UX) for SchoolOS Frontend Hardening Master Orchestration.
Your working directory is: c:\Users\krish\Desktop\ERP 1\.agents\worker_wave3_agentI\
Project root: c:\Users\krish\Desktop\ERP 1
Parent Orchestrator Conversation ID: 777c8e44-9743-470b-8626-e64c595088d4

MANDATORY: Read c:\Users\krish\Desktop\ERP 1\.agents\ORIGINAL_REQUEST.md and c:\Users\krish\Desktop\ERP 1\.agents\orchestrator\PROJECT.md before starting work.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Scope & Mission:
Workstream: FRONTEND-08 (Bulk & Onboarding UX)
1. Initialize your workspace: BRIEFING.md, DISPATCH.md, and progress.md under c:\Users\krish\Desktop\ERP 1\.agents\worker_wave3_agentI\.
2. Git Setup:
   Create and switch to dedicated branch `feat/wave3-bulk-onboarding` branched from `feat/wave2-integrated` (commit `76393e920af80c3fb61cbad6b47f02c5e28e81b0`).
   CRITICAL: Strictly preserve pre-existing user modifications (`apps/web/src/components/layout/Sidebar.tsx` logout POST form, `package-lock.json`, and untracked files). DO NOT reset, clean, or overwrite them.
3. Exclusive File Boundaries:
   - Primary ownership:
     - `apps/web/src/components/bulk/` (create this directory)
     - `apps/web/src/app/students/bulk/page.tsx` (or bulk import route)
   - DO NOT edit `apps/web/src/lib/branch-context.ts` (owned by Agent G).
   - DO NOT edit `apps/web/src/app/academic-structure/*` or other tables (owned by Agent F).
   - DO NOT edit `apps/web/src/components/layout/*` or `Sidebar.tsx`.
   - DO NOT introduce any Phase 6 assessment logic (exams, marks, grading, results, report-cards).
   - DO NOT invent fake backend DB migrations or mutations; document that client-side mapping interface connects to server action when backend ingestion pipeline is completed.
4. Core Hardening Tasks:
   A. Generic CSV/File Bulk Upload Dropzone:
      - In `apps/web/src/components/bulk/BulkUploadDropzone.tsx`:
        - Drag-and-drop file upload with accessible keyboard trigger button.
        - File validation for accepted types (`.csv`, `.tsv`, `.xlsx`) and size limits.
        - Visual dropzone states: idle, drag-over, file loaded, error.
   B. Client-Side CSV Header & Data Preview:
      - In `apps/web/src/components/bulk/CsvPreviewTable.tsx`:
        - Lightweight, client-side parsing of CSV text to detect headers and preview the first 5 rows.
        - Row count display and data summary.
   C. Column Mapping Interface:
      - In `apps/web/src/components/bulk/ColumnMapper.tsx`:
        - Allows mapping detected CSV column headers to expected entity fields (e.g. For students: First Name, Last Name, Admission Number, Date of Birth, Gender, Grade/Class).
        - Dropdown selectors using canonical `@/components/ui/Select` with auto-matching heuristic (matching column name to field name case-insensitively).
   D. Bulk Upload Page / Wizard:
      - In `apps/web/src/app/students/bulk/page.tsx`:
        - Guided step wizard: (1) Select file, (2) Map columns, (3) Preview & Validate, (4) Submit.
        - Uses canonical `@/components/ui/` primitives (`Card`, `Button`, `Badge`, `Tabs`, `Table`).
        - Accessible feedback banner and summary card.
5. Verification:
   Run in `apps/web`:
   - `npm run typecheck`
   - `npm run lint`
   - `npm test`
   - `npm run build`
   Ensure all 4 exit with code 0.
6. Commit:
   Stage only your newly created files in `apps/web/src/components/bulk/` and `apps/web/src/app/students/bulk/page.tsx`.
   Commit message: `feat(frontend): implement bulk onboarding ux`.
   Do NOT stage or commit `Sidebar.tsx`, `package-lock.json`, or untracked scratch files.
7. Write `handoff.md` with 5 mandatory sections and notify orchestrator (`777c8e44-9743-470b-8626-e64c595088d4`).
