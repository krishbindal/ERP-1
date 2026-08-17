# Phase 3A: Skill Selection Matrix

The following Agentic Awesome Skills (AAS) capabilities are actively required and approved for the Phase 3A (Students & Guardians) implementation:

| Capability | Rationale | Active |
| ---------- | --------- | ------ |
| `Supabase/PostgreSQL` | Required for designing the database schema, setting up migrations, and implementing base RLS rules. | Yes |
| `database architecture` | Required for validating normalization, lifecycle state constraints, and index decisions for the new tables. | Yes |
| `RLS/security` | Required for strictly testing boundary isolations (cross-org, cross-branch) against the foundation. | Yes |
| `testing/QA` | Required for `pgTAP` test generation, negative security testing, and regression analysis. | Yes |
| `Next.js` / `frontend architecture` / `TypeScript` | Required for implementing Server Actions, RBAC checks, and UI data fetching structures. | Yes |
| `Stitch` | Required for sequential UI screen generation (Student list, detail, create). | Yes |
| `systematic-debugging` | Optional. Activated only if regressions or test failures occur during implementation. | Conditionally Yes |

*Note: Skills related to HR, payroll, future Academic structures (classes/enrollment), and broad E2E integration are NOT activated during this subphase to maintain focus and prevent architectural contamination.*
