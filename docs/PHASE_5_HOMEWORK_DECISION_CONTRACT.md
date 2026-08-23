# SchoolOS — Phase 5 Homework & Learning Product & Security Decision Contract

**Status:** FINAL (Implementation Authorized)
**Phase:** 5 — Operations / Homework & Learning
**Decision type:** Level 2/3 module design contract.
**Source baseline:** `SchoolOS_Master_Specification_FINAL` + current repository security/architecture contracts.

## 1. Purpose

Freeze the product, domain, authorization, lifecycle, audit, reporting, and testing decisions required to implement Homework & Learning safely.

This document is a decision gate. It does **not** authorize database migrations, production schema changes, server actions, APIs, or UI implementation.

## 2. Non-negotiable architectural constraints

1. Organization remains the top-level tenant; branches remain the operational isolation boundary.
2. One centralized production PostgreSQL/Supabase platform remains canonical.
3. Homework is a branch-owned operational domain.
4. Database/server authorization is authoritative; client-selected branch, academic year, student, section, teacher, or publication values are not trusted as final authority.
5. RLS remains part of the enforcement boundary. Server validation and permission checks complement, rather than replace, RLS.
6. No client-side branch/app identity is a security control.
7. No service-role credential is exposed to clients.
8. Historical assignment/submission/audit data is preserved; unrestricted destructive deletion is prohibited.
9. No implementation may silently change foundation tenancy, RLS, Calendar, Timetable, or enrollment contracts.

## 3. Explicit Resolved Product Decisions

### 3.1 Assignment Target Granularity
**Decision:** Homework assignments target exactly one `section_id` + `subject_id` and are bounded by the authoritative `branch_id` + `academic_year_id`.
**Why:** Aligns strictly with the canonical Enrollment and Scheduling matrices. Individual student targeting or global assignments are deliberately excluded from this V1 scope to prevent matrix complexity.

### 3.2 Teacher Authorization
**Decision:** Creating, editing, or grading homework requires an `ACTIVE` mapping in the canonical `teacher_subject_assignments` table for the target `section_id` and `subject_id`, **OR** a granted global homework-management permission (`homework.manage.all`) assigned via `auth_user_has_branch_permission`.
**Why:** Enforces zero-trust isolation so teachers cannot manipulate assignments or view submissions belonging to subjects/sections they do not teach.

### 3.3 Homework Lifecycle
**Decision:** Assignments follow a strict transition: `DRAFT` -> `PUBLISHED` -> `CLOSED`.
- **DRAFT**: Visible only to the authoring teacher and admins. Submissions blocked.
- **PUBLISHED**: Visible to enrolled students and linked guardians. Submissions allowed.
- **CLOSED**: Visible to students/guardians. New submissions are permanently blocked.

### 3.4 Dates & Submissions
**Decision:** Use timezone-safe `issue_at` TIMESTAMPTZ and `due_at` TIMESTAMPTZ. 
- Enforce `due_at >= issue_at`. 
- Dates must fall within the `academic_year` bounds, but **do not** require Calendar `instructional_day` validation.
- The system allows late submissions while the assignment is `PUBLISHED`. Lateness is dynamically derived via `submitted_at > due_at`.
- A student is permitted exactly **one** canonical submission record per `assignment_id` (`UNIQUE(assignment_id, student_id)`).

### 3.5 Storage & Attachments (V1)
**Decision:** Homework and submission attachments are fully included in V1. 
- Uses private Supabase Storage buckets (e.g., `homework_assets`).
- Public URLs as an authorization mechanism are **prohibited**.
- The database tracks file metadata (`homework_attachments`, `submission_attachments`).
- Storage RLS must mathematically mirror the database authorization rules, ensuring cross-branch or cross-section leakage is impossible at the binary level.

### 3.6 Grading Schema
**Decision:** Submissions track numeric `marks_awarded` and the assignment declares numeric `max_marks`. 
- Database constraint must enforce `marks_awarded <= max_marks`. 
- Grading is explicitly decoupled from Phase 6 (Assessments/Report Cards) at this stage, but strongly typed to allow seamless integration later.

### 3.7 Notification Architecture
**Decision:** Transitioning an assignment to `PUBLISHED` mandates the emission of an asynchronous `HOMEWORK_PUBLISHED` notification event to the relevant students and guardians.
- Notification delivery (EventBus) **must not** be tightly coupled to the database transaction to prevent external delivery timeouts from rolling back legitimate state changes.

## 4. Proposed Database Schema

### `homework_assignments`
- `id` UUID PK
- `branch_id` UUID FK
- `academic_year_id` UUID FK
- `class_id` UUID FK
- `section_id` UUID FK
- `subject_id` UUID FK
- `teacher_profile_id` UUID FK (author)
- `title` TEXT NOT NULL
- `description` TEXT
- `issue_at` TIMESTAMPTZ NOT NULL
- `due_at` TIMESTAMPTZ NOT NULL
- `max_marks` NUMERIC(5,2)
- `status` TEXT CHECK (status IN ('DRAFT', 'PUBLISHED', 'CLOSED'))
- `created_at`, `updated_at`, `created_by`, `updated_by`
- `CONSTRAINT check_dates CHECK (due_at >= issue_at)`

### `homework_attachments`
- `id` UUID PK
- `assignment_id` UUID FK
- `file_path` TEXT NOT NULL (storage path)
- `file_name` TEXT NOT NULL
- `file_size` INTEGER
- `content_type` TEXT

### `homework_submissions`
- `id` UUID PK
- `assignment_id` UUID FK
- `student_id` UUID FK
- `status` TEXT CHECK (status IN ('PENDING', 'SUBMITTED', 'GRADED', 'RETURNED'))
- `submitted_at` TIMESTAMPTZ
- `student_comment` TEXT
- `marks_awarded` NUMERIC(5,2)
- `teacher_feedback` TEXT
- `graded_at` TIMESTAMPTZ
- `graded_by` UUID FK
- `CONSTRAINT unique_student_submission UNIQUE(assignment_id, student_id)`
- `CONSTRAINT check_marks CHECK (marks_awarded IS NULL OR (marks_awarded >= 0 AND marks_awarded <= (SELECT max_marks FROM homework_assignments WHERE id = assignment_id)))` (Note: trigger or RPC enforcement may be required for this cross-table constraint).

### `submission_attachments`
- `id` UUID PK
- `submission_id` UUID FK
- `file_path` TEXT NOT NULL
- `file_name` TEXT NOT NULL
- `file_size` INTEGER
- `content_type` TEXT

## 5. Security & Isolation Matrix

| Actor | Action | Scope / Boundary |
|-------|--------|------------------|
| **Branch Admin** | Manage all | Can create, edit, grade, and transition lifecycle states of any homework (deletion is explicitly prohibited) in their branch via the `homework.manage.all` permission. |
| **Teacher** | Manage assigned | Can create, edit, grade homework ONLY for sections/subjects they are actively assigned to via `teacher_subject_assignments`. |
| **Student** | View | Can view `PUBLISHED` or `CLOSED` homework ONLY for their active `enrollments`. |
| **Student** | Submit | Can submit work ONLY if enrolled, assignment is `PUBLISHED`, and student is the owner of the submission. |
| **Guardian** | View | Can view homework and submissions ONLY for their linked children via `student_guardians`. |

## 6. Supabase Storage Security Boundary

Private bucket `homework_assets` structure:
- `/{branch_id}/{academic_year_id}/assignments/{assignment_id}/{file_name}`
- `/{branch_id}/{academic_year_id}/submissions/{submission_id}/{file_name}`

**Storage RLS Strategy:**
Policies on `storage.objects` must evaluate `auth.uid()` against the DB via secure definer functions to verify:
1. **Reads:** The user is a teacher assigned to the subject, an admin of the branch, an enrolled student in the assignment's section, or the guardian of that enrolled student.
2. **Writes (Assignments):** The user is the authoring teacher or admin.
3. **Writes (Submissions):** The user is the exact student owning the submission, and the assignment is `PUBLISHED`.

## 7. Implementation Gate

**This contract is FINAL.** 

Implementation may proceed following the exact specifications detailed above:
1. Migration for Tables, Enums, Constraints, and Indexes.
2. Migration for DB RLS Policies and Storage Bucket Policies.
3. Server Actions / RPC adapters acting as thin wrappers around secure DB transactions.
4. pgTAP unit testing for cross-branch isolation and `teacher_subject_assignments` bounds.
