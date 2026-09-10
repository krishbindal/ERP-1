# PRE-PHASE 6 ZERO-ISSUE BASELINE

This is the master checklist of all prerequisites that must be verifiably green before SchoolOS can safely advance to Phase 6 (Assessments & Grading). 

## Legend
- **OPEN**: Issue identified, remediation pending.
- **IN PROGRESS**: Remediation is actively being implemented.
- **FIXED**: Code/schema changes applied locally but pending full CI/verification.
- **VERIFIED**: Confirmed by automated tests, database constraints, and CI pipelines.

---

## 1. Security, Tenancy, and RBAC
| ID | Category | Finding / Requirement | Status | Verification Evidence |
| :--- | :--- | :--- | :--- | :--- |
| SEC-01 | RBAC | Super Admin UI must strictly enforce read-only observation mode for branch operational data. | OPEN | Requires E2E test verifying mutation controls are hidden/disabled for Super Admin. |
| SEC-02 | RBAC | Server actions/RPCs must reject operational mutations (e.g., Timetable, Attendance) from Super Admins. | OPEN | Requires Unit tests mocking isSuperAdmin = true. |
| SEC-03 | Tenancy | createSection and related API actions must safely validate branch_id and enforce RLS isolation. | OPEN | Requires DB/Unit tests proving cross-branch insertion failure. |

## 2. Academic Domain & Data Integrity
| ID | Category | Finding / Requirement | Status | Verification Evidence |
| :--- | :--- | :--- | :--- | :--- |
| DOM-01 | Session Lifecycle | Discard singleton active-year assumption. Application must support multiple overlapping ACTIVE academic years. | OPEN | Timetable and Attendance resolvers updated to require explicit session ID rather than .maybeSingle(). |
| DOM-02 | Student Enrollment | Student records must not be duplicated for new academic years; historical movement is tracked via enrollments table. | VERIFIED | DB Schema supports academic_year_id, effective_from, effective_to. |
| DOM-03 | Attendance Mode | Reject lesson-based attendance. Enforce strictly Daily Attendance per section as explicitly defined by Master Specification. | VERIFIED | DB Schema attendance_sessions uses composite key. |

## 3. Frontend UI, Context & Error Handling
| ID | Category | Finding / Requirement | Status | Verification Evidence |
| :--- | :--- | :--- | :--- | :--- |
| UI-01 | Academic Context | Students page must enforce cascading context (Branch -> Session -> Class -> Section) and stop displaying branch-wide lists. | OPEN | Playwright E2E demonstrating context filtering. |
| UI-02 | Academic Context | Classes and Sections pages must visually segregate/filter by Academic Session. | OPEN | Playwright E2E demonstrating context filtering. |
| UI-03 | Academic Context | Timetable must strictly scope by Academic Session and Class/Section context. | OPEN | Playwright E2E demonstrating context filtering. |
| UI-04 | Error Handling | Timetable and other queries must differentiate between No Data (zero rows) and Error (query failure). Empty data must not silently swallow errors. | OPEN | Unit tests verifying error boundaries on fetch failures. |
| UI-05 | Foundation | Verify global Toaster properly mounts inside AppShell instead of relying on flawed render chains. | FIXED | layout.test.tsx currently passes in local env. |

## 4. Testing, CI/CD, and Code Quality
| ID | Category | Finding / Requirement | Status | Verification Evidence |
| :--- | :--- | :--- | :--- | :--- |
| QA-01 | Playwright | Full E2E suite passes with zero unexpected skips and zero arbitrary sleep statements. | OPEN | CI Pipeline Green. |
| QA-02 | Unit Tests | Vitest suite passes without mock leakage (e.g. lucide-react hoist leakage). | FIXED | npm run test passes locally. |
| QA-03 | SonarCloud | 0% Code Duplication violations on New Code (Required <= 3%). | FIXED | Generalized useDataTable successfully applied. |
| QA-04 | SonarCloud | A-Rating for Security (Resolved Math.random PRNG issues). | FIXED | Replaced with crypto.randomUUID(). |
| QA-05 | Typecheck | Zero TypeScript tsc errors across the frontend foundation. | FIXED | npm run typecheck passes locally. |

---
**AUTHORIZATION GATE:** PHASE 6 WORK CANNOT COMMENCE UNTIL EVERY STATUS ON THIS DOCUMENT IS "VERIFIED".
