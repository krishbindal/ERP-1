# SchoolOS — Phase 3: API Contract Strategy

Since Next.js and Supabase are in use, the "API" represents both Server Actions (for mutations) and direct Supabase client queries (for reads).

## General Requirements
- **Authentication**: All operations require an authenticated user.
- **Authorization**: Supabase RLS enforces read/write scoping at the database level. Server Actions MUST explicitly check the user's role (RBAC) before executing mutations to prevent privilege escalation.
- **Validation**: Zod schemas must validate all inputs before interacting with the database.

## 1. Students & Guardians API
- `createStudent`: Validates input, creates `students` record. Role: Branch Admin.
- `updateStudent`: Modifies student details. Role: Branch Admin.
- `archiveStudent`: Soft deletes student. Role: Branch Admin.
- `linkGuardian`: Creates `student_guardians` record linking a guardian to a student. Role: Branch Admin.

## 2. Academics API
- `createAcademicYear`: Creates a new year for a branch. Role: Branch Admin.
- `createClass` / `createSection`: Defines structure.
- `assignSubject`: Maps a subject to a class.

## 3. Enrollment API
- `enrollStudent`: Creates an `enrollments` record in an active Academic Year. Role: Branch Admin.
- `transferStudent`: Safely creates a new enrollment in the target branch while marking the current enrollment as `TRANSFERRED`. Requires cross-branch authorization.
- `withdrawStudent`: Marks enrollment as `WITHDRAWN`.
