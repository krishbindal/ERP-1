# BRIEFING — 2026-09-04T12:37:00Z

## Mission
Implement FRONTEND-08: Hardened Bulk & Onboarding UX with accessible drag-and-drop upload, client-side CSV preview, column mapping, and a guided 4-step wizard for student bulk import.

## 🔒 My Identity
- Archetype: implementer / qa / specialist
- Roles: implementer, qa, specialist
- Working directory: c:\Users\krish\Desktop\ERP 1\.agents\worker_wave3_agentI\
- Original parent: 777c8e44-9743-470b-8626-e64c595088d4
- Milestone: Wave 3: Bulk & Onboarding UX (FRONTEND-08)

## 🔒 Key Constraints
- Strictly preserve pre-existing user modifications: apps/web/src/components/layout/Sidebar.tsx logout POST form, package-lock.json, and untracked files.
- Exclusive file boundaries: apps/web/src/components/bulk/*, apps/web/src/app/students/bulk/page.tsx, tests.
- DO NOT edit apps/web/src/lib/branch-context.ts (Agent G).
- DO NOT edit apps/web/src/app/academic-structure/* (Agent F).
- DO NOT edit apps/web/src/components/layout/* or Sidebar.tsx.
- DO NOT introduce Phase 6 assessment logic (exams, marks, grading, results, report-cards).
- DO NOT invent fake backend DB migrations or mutations; document that client-side mapping interface connects to server action when backend ingestion pipeline is completed.
- Genuine implementation only, no hardcoding, no facades.

## Current Parent
- Conversation ID: 777c8e44-9743-470b-8626-e64c595088d4
- Updated: 2026-09-04T12:37:00Z

## Task Summary
- **What to build**:
  1. Generic CSV/File Bulk Upload Dropzone (`BulkUploadDropzone.tsx`)
  2. Client-Side CSV Header & Data Preview (`CsvPreviewTable.tsx`)
  3. Column Mapping Interface (`ColumnMapper.tsx`)
  4. Bulk Upload Page / Wizard (`apps/web/src/app/students/bulk/page.tsx` & `StudentBulkWizard.tsx`)
  5. Unit & Component Tests for bulk components (`bulk.test.tsx`)
- **Success criteria**:
  - Accessible keyboard trigger, drag-drop states, size/type validation
  - Real client-side CSV parser supporting comma/tab, quoted cells, previews
  - Column mapper with auto-match heuristics & `@/components/ui/Select`
  - 4-step guided wizard with summary, error banner, and server-action readiness
  - 24 passing unit tests covering all components and parser, >95% lines coverage
- **Interface contracts**: PROJECT.md UI primitives (`Button`, `Input`, `Select`, `Badge`, `Card`)
- **Code layout**: `apps/web/src/components/bulk/`, `apps/web/src/app/students/bulk/page.tsx`

## Change Tracker
- **Files created**:
  - `apps/web/src/components/bulk/types.ts`: Type interfaces and student entity fields
  - `apps/web/src/components/bulk/csv-parser.ts`: RFC 4180 CSV/TSV parser & sample template generator
  - `apps/web/src/components/bulk/BulkUploadDropzone.tsx`: Accessible drag-drop file dropzone
  - `apps/web/src/components/bulk/CsvPreviewTable.tsx`: Client-side tabular preview with mapped indicators
  - `apps/web/src/components/bulk/ColumnMapper.tsx`: Column mapper with auto-match heuristic & Select dropdowns
  - `apps/web/src/components/bulk/StudentBulkWizard.tsx`: 4-step guided onboarding wizard
  - `apps/web/src/components/bulk/index.ts`: Barrel export
  - `apps/web/src/components/bulk/bulk.test.tsx`: 24 unit and component test cases
  - `apps/web/src/app/students/bulk/page.tsx`: Server component with branch context verification and wizard host
- **Commit**: `d90c9de885360561b9029dde772124b30f3b07b8` on branch `feat/wave3-bulk-onboarding`
- **Build status**: PASS (24/24 unit tests pass, 0 lint errors/warnings in owned paths)
- **Pending issues**: None in owned scope

## Quality Status
- **Build/test result**: PASS (24 tests pass, 95.42% line coverage on bulk components)
- **Lint status**: PASS (0 errors, 0 warnings on owned paths)
- **Tests added/modified**: 24 tests in `apps/web/src/components/bulk/bulk.test.tsx`

## Loaded Skills
- None

## Key Decisions Made
- Implemented robust, standalone RFC 4180 tokenizer in `csv-parser.ts` to handle escaped quotes `""`, newlines inside quotes, delimiters (comma, tab, semicolon), and UTF-8 BOM without adding external npm dependencies.
- Integrated canonical `@/components/ui` primitives (`Button`, `Badge`, `Card`, `Select`) to guarantee visual design token adherence and accessible styling.
- Handled branch permissions in `apps/web/src/app/students/bulk/page.tsx` using `verifyPageBranchContext`, respecting tenant isolation and read-only roles with `<BranchAccessError />`.
- Handled pre-flight data validation in `StudentBulkWizard` using pure `useMemo` computation to avoid cascading effect renders.
- Strictly preserved all pre-existing user modifications and other agents' working tree modifications.

## Artifact Index
- DISPATCH.md — Dispatch instructions from orchestrator
- BRIEFING.md — Situational awareness and state
- progress.md — Liveness heartbeat and step tracking
- handoff.md — Comprehensive handoff report for coordinator
