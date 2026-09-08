# Forensic Auditor Wave 4 Context

## Working Directory
`c:\Users\krish\Desktop\ERP 1\.agents\auditor_wave4_1\`

## Project Root
`c:\Users\krish\Desktop\ERP 1`

## Target Branch & Commit
- Branch: `feat/wave4-integrated`
- Commit SHA: `96fac29a08b6b95bc93c686bf49990b01b019a71`
- Base SHA: `34697ec4704ead254d881956ad606f736403d366` (`origin/feat/wave3-integrated`)

## Integrity Forensics Checklist
1. Verify no hardcoded test results or bypass logic (no `if (process.env.TEST) return true` or fake test pass shortcuts).
2. Verify genuine accessibility logic (focus trap, focus restoration, escape listener, ARIA attributes).
3. Verify no Phase 6 business logic was introduced (exams, marks, grading engine, report cards).
4. Verify database schemas, RLS policies, Identifier Engine, and backend auth foundations were NOT modified.
5. Verify pre-existing user work preservation:
   - `apps/web/src/components/layout/Sidebar.tsx` and `TopBar.tsx`: logout POST form `<form action="/auth/logout" method="POST">` with `type="submit"` preserved.
   - `package-lock.json` untouched/unstaged.
   - Untracked files untouched.
6. Verify no merge into `master`.
7. Deliver a binary verdict: `CLEAN` or `INTEGRITY VIOLATION`.
