# Module — Homework & Learning

## 1. Domain Model

The Homework & Learning module operates inside the operational Branch boundaries, tied strictly to canonical Academic Years, Sections, and Subjects.

### Core Entities
- **Assignment (`homework_assignments`)**: The root entity representing a task assigned to a specific Section + Subject. Owned by the authoring teacher or branch admin.
- **Assignment Attachment (`homework_attachments`)**: Files containing instructions or resources for the assignment.
- **Submission (`homework_submissions`)**: The canonical student response to an assignment. Exactly one submission record per student per assignment (`UNIQUE(assignment_id, student_id)`).
- **Submission Attachment (`submission_attachments`)**: Files uploaded by the student as their work.
- **Audit Log (`homework_audit_logs`)**: Immutable history of lifecycle transitions, grading, and configuration changes.

### Dependency Relationships
- **Branch**: Root operational isolation (`branch_id`).
- **Academic Year**: Time-bound operational constraint. Dates (`issue_at`, `due_at`) must fall within this boundary.
- **Section + Subject**: The assignment target. Derived from existing Academics tables.
- **Teacher Assignment**: Creating/grading requires an `ACTIVE` mapping in `teacher_subject_assignments` for the given Section + Subject.
- **Enrollment**: Viewing/submitting requires an `ENROLLED` mapping in `enrollments` for the given Section and Academic Year.
- **Guardian**: Inherits view rights via `student_guardians` mapping.

## 2. Database Schema

### `homework_assignments`
- `id` UUID PK DEFAULT gen_random_uuid()
- `branch_id` UUID NOT NULL FK `branches(id)`
- `academic_year_id` UUID NOT NULL FK `academic_years(id)`
- `section_id` UUID NOT NULL FK `sections(id)`
- `subject_id` UUID NOT NULL FK `subjects(id)`
- `author_profile_id` UUID NOT NULL FK `staff_branch_profiles(id)`
- `title` TEXT NOT NULL
- `description` TEXT
- `issue_at` TIMESTAMPTZ NOT NULL
- `due_at` TIMESTAMPTZ NOT NULL
- `max_marks` NUMERIC(5,2) (Nullable, for ungraded homework)
- `status` TEXT NOT NULL DEFAULT 'DRAFT'
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()
- `updated_at` TIMESTAMPTZ NOT NULL DEFAULT now()
- `created_by` UUID NOT NULL
- `updated_by` UUID NOT NULL

**Constraints:**
- `chk_homework_status`: `status IN ('DRAFT', 'PUBLISHED', 'CLOSED')`
- `chk_homework_dates`: `due_at >= issue_at`
- `chk_max_marks`: `max_marks IS NULL OR max_marks > 0`
- **Cross-table enforce (via Trigger `trg_homework_ay_bounds`)**: Asserts `issue_at` and `due_at` fall between `academic_years.start_date` and `academic_years.end_date`.

**Indexes:**
- `idx_homework_section_subject` ON `(section_id, subject_id)`
- `idx_homework_due_at` ON `(due_at)`
- `idx_homework_branch_ay` ON `(branch_id, academic_year_id)`

### `homework_attachments`
- `id` UUID PK DEFAULT gen_random_uuid()
- `assignment_id` UUID NOT NULL FK `homework_assignments(id)` ON DELETE RESTRICT
- `file_path` TEXT NOT NULL
- `file_name` TEXT NOT NULL
- `file_size` INTEGER NOT NULL
- `content_type` TEXT
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()

### `homework_submissions`
- `id` UUID PK DEFAULT gen_random_uuid()
- `assignment_id` UUID NOT NULL FK `homework_assignments(id)` ON DELETE RESTRICT
- `student_id` UUID NOT NULL FK `students(id)` ON DELETE RESTRICT
- `status` TEXT NOT NULL DEFAULT 'PENDING'
- `submitted_at` TIMESTAMPTZ
- `student_comment` TEXT
- `marks_awarded` NUMERIC(5,2)
- `teacher_feedback` TEXT
- `graded_at` TIMESTAMPTZ
- `graded_by_profile_id` UUID FK `staff_branch_profiles(id)`
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()
- `updated_at` TIMESTAMPTZ NOT NULL DEFAULT now()
- `version` INTEGER NOT NULL DEFAULT 1 (For OCC)

**Constraints:**
- `chk_submission_status`: `status IN ('PENDING', 'SUBMITTED', 'GRADED', 'RETURNED')`
- `chk_marks_awarded_positive`: `marks_awarded IS NULL OR marks_awarded >= 0`
- `uq_submission_student`: `UNIQUE(assignment_id, student_id)`
- **Cross-table enforce (via Trigger `trg_check_marks_awarded`)**: Asserts `marks_awarded <= homework_assignments.max_marks` upon insert or update. Throws if marks awarded exceed max marks, or if marks awarded when max marks is null.

**Indexes:**
- `idx_submissions_student` ON `(student_id)`
- `idx_submissions_assignment` ON `(assignment_id)`

### `submission_attachments`
- `id` UUID PK DEFAULT gen_random_uuid()
- `submission_id` UUID NOT NULL FK `homework_submissions(id)` ON DELETE RESTRICT
- `file_path` TEXT NOT NULL
- `file_name` TEXT NOT NULL
- `file_size` INTEGER NOT NULL
- `content_type` TEXT
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()

### `homework_audit_logs`
- Standard audit payload mapping (actor, action, entity, entity_id, previous_state, new_state, created_at).

## 3. Assignment Lifecycle
1. **DRAFT**: Created. Visible only to authoring teacher + admins. Submissions impossible.
2. **PUBLISHED**: Accessible by students/guardians. Notifications sent asynchronously. Submissions open.
3. **CLOSED**: Locked. Submissions permanently halted. Grading can still occur.

**Legal Transitions:**
- `DRAFT -> PUBLISHED` (By Teacher/Admin via `rpc_publish_homework`).
- `PUBLISHED -> CLOSED` (By Teacher/Admin via `rpc_close_homework`).

**Illegal Transitions:**
- `PUBLISHED -> DRAFT` (Prevents hiding already visible work).
- `CLOSED -> PUBLISHED` (Once closed, it cannot be reopened to submissions to enforce strict cutoffs. A new assignment must be made).
- `CLOSED -> DRAFT` (Prohibited).

## 4. Submission Lifecycle
1. **PENDING**: Initial state when student opens homework or starts attaching files but hasn't finalized.
2. **SUBMITTED**: Finalized by student. Populates `submitted_at`.
3. **GRADED**: Teacher has reviewed and saved marks/feedback. Populates `graded_at`.
4. **RETURNED**: Teacher returns to student for rework. Re-opens submission capabilities for this specific student.

**Legal Transitions:**
- `PENDING -> SUBMITTED` (By Student via `rpc_submit_homework`. Marks `submitted_at`. Determines lateness: `submitted_at > assignment.due_at`).
- `SUBMITTED -> GRADED` (By Teacher via `rpc_grade_homework`).
- `SUBMITTED -> RETURNED` (By Teacher via `rpc_return_homework`).
- `RETURNED -> SUBMITTED` (By Student, re-submitting reworked assignment. Updates `submitted_at`).
- `GRADED -> RETURNED` (By Teacher, revoking grade for rework).

**Constraints:**
- Only ONE canonical submission record per student per assignment.
- Submitting while assignment is `CLOSED` is strictly prohibited by RPC `rpc_submit_homework`.
- Grading updates `marks_awarded`, `teacher_feedback`, `graded_at`, `graded_by_profile_id`.

## 5. Authorization/RLS

| Actor | Scope / View Rights | Mutation Rights (via RPC) |
|-------|---------------------|---------------------------|
| **Super Admin** | ALL branches | None (Service usage only). |
| **Branch Admin** | Branch-wide | Manage all assignments (via `homework.manage.all`). Grade any submission. |
| **Teacher** | Sections via `teacher_subject_assignments` | Create/Publish/Close assignments for their active subjects. Grade submissions. |
| **Student** | Active enrollments in `sections` | View PUBLISHED/CLOSED assignments. Update own PENDING/RETURNED submission. |
| **Guardian** | Linked `student_guardians` | View PUBLISHED/CLOSED assignments and submissions for their children. No mutation. |

**Cross-cutting Denials Explicitly Tested:**
- Cross-branch access denied natively by `branch_id` equality.
- Cross-section/subject access denied for teachers without `ACTIVE` mapping.
- Inactive teacher mapping (`status = 'INACTIVE'`) denied.
- Unauthorized student submission denied.
- Arbitrary UUID access blocked by strict `EXISTS` RLS policies.

## 6. Teacher Authorization
Authorization strictly enforces DB relationships:
```sql
EXISTS (
  SELECT 1 FROM public.teacher_subject_assignments tsa
  JOIN public.staff_branch_profiles sbp ON tsa.staff_branch_profile_id = sbp.id
  WHERE sbp.user_id = auth.uid()
    AND tsa.section_id = target_section_id
    AND tsa.subject_id = target_subject_id
    AND tsa.status = 'ACTIVE'
) OR public.auth_user_has_branch_permission(target_branch_id, 'homework.manage.all')
```
Client-selected section/teacher IDs are discarded during RPC processing; the server verifies the actor's identity natively.

## 7. Storage Security Design

**Bucket**: `homework_assets` (Private).
**Public URLs**: Prohibited. Signed URLs or direct download streams via authenticated Supabase client only.

**Object Naming Conventions:**
- Assignments: `/{branch_id}/{academic_year_id}/assignments/{assignment_id}/{file_name}`
- Submissions: `/{branch_id}/{academic_year_id}/submissions/{submission_id}/{file_name}`

**Secure Definer Helpers for Storage RLS:**
- `public.auth_can_access_homework_file(bucket_id, object_name)`: Parses the path to extract `assignment_id` or `submission_id`.
  - For Assignments: Returns `TRUE` if user is teacher of the section, branch admin, enrolled student, or guardian.
  - For Submissions: Returns `TRUE` if user is teacher, admin, the EXACT student, or the guardian.
- **Upload Authorization**: Only authoring teachers can upload to `/assignments/`. Only owning students can upload to `/submissions/`. Handled via path extraction in `storage.objects` INSERT policy.
- **Deletion**: Homework assignments, submissions, and their attachments are NOT user-deletable in V1. Historical records and associated files remain permanently preserved.

## 8. API/RPC Contract

All state mutations occur inside atomic PostgreSQL RPCs utilizing Optimistic Concurrency Control (OCC). Thin Server Actions serve as adapters.

1. `rpc_create_homework_assignment(p_branch, p_ay, p_section, p_subject, p_title, p_desc, p_issue_at, p_due_at, p_max_marks)`:
   - Validates teacher assignment or admin permission.
   - Triggers enforce academic year bounds.
2. `rpc_update_homework_assignment(p_id, p_expected_updated_at, ...)`:
   - Modifies fields ONLY if `status = 'DRAFT'`.
   - Concurrency: Aborts if `updated_at != p_expected_updated_at`.
3. `rpc_publish_homework(p_id, p_expected_updated_at)`:
   - Transitions `DRAFT -> PUBLISHED`.
   - Concurrency: Aborts if `updated_at != p_expected_updated_at`.
   - Emits event mapping in Server Action *after* successful return.
4. `rpc_close_homework(p_id, p_expected_updated_at)`:
   - Transitions `PUBLISHED -> CLOSED`.
5. `rpc_submit_homework(p_assignment_id, p_student_id, p_expected_version, p_comment)`:
   - Checks `assignments.status == 'PUBLISHED'`.
   - Bumps `submissions.version`.
   - Determines lateness implicitly.
6. `rpc_grade_submission(p_submission_id, p_expected_version, p_marks, p_feedback)`:
   - Verifies teacher assignment.
   - Enforces `p_marks <= assignments.max_marks` via trigger.
7. `rpc_return_submission(...)`: Transitions to `RETURNED` for rework.

## 9. Notifications (EventBus)
**Event**: `HOMEWORK_PUBLISHED`
- **Payload**: `{ assignment_id, section_id, subject_id, due_at, title }`
- **Delivery**: Fired asynchronously from the Next.js Server Action (`actions.ts`) **strictly after** `rpc_publish_homework` succeeds.
- **Resilience**: If the notification service fails, the database transaction is already committed. The assignment remains published. Delivery failure does NOT rollback the database. Deduplication is handled by checking if `published_at` was already set.

## 10. Concurrency (Deterministic OCC)
- **Two teachers editing same draft**: Requires passing `expected_updated_at`. The second teacher's RPC will throw a concurrency conflict.
- **Publish racing with edit**: OCC locks the row. Second operation fails.
- **Close racing with submission**: The `rpc_submit_homework` uses `SELECT status FROM homework_assignments WHERE id = X FOR SHARE`. If close commits first, submission sees `CLOSED` and aborts.
- **Two submissions from same student**: Prevented by `UNIQUE(assignment_id, student_id)`.
- **Grade racing with student update**: Prevented by submission versioning `expected_version`.

## 11. Performance
**Hot Queries & Indexes:**
1. *Student dashboard (List upcoming homework)*:
   - Query joins `enrollments` -> `sections` -> `homework_assignments`.
   - Covered by `idx_homework_section_subject` and `idx_homework_due_at`.
2. *Teacher dashboard (List assignments to grade)*:
   - Covered by `idx_homework_section_subject`.
3. *Guardian view*:
   - Covered by `idx_submissions_student` joined with `student_guardians`.
N+1 patterns are eliminated by utilizing aggregate views or explicit join RPCs where necessary.

## 12. Test Matrix
Implementation must pass explicit pgTAP assertions for:
- [x] Schema integrity (tables, columns, types, defaults).
- [x] Constraints: `due_at >= issue_at`, `marks_awarded <= max_marks`.
- [x] Triggers: `academic_year` date bounds constraint.
- [x] RLS Policies: Cross-branch denial, inactive teacher denial, guardian scoping.
- [x] OCC: Version conflict throws exception during concurrent updates.
- [x] Lifecycle: `rpc_submit_homework` fails if assignment is `CLOSED`.
- [x] Notifications: Unit tests ensuring Server Action emits event post-RPC.
- [x] Storage Rules: `storage.objects` RLS tested via mock auth contexts.

## Consistency Audit
- **A. FINAL contract requirements covered**: Yes (Granularity, Lifecycle, Dates, Attachments, Grading, Notifications, History).
- **B. Existing Architecture Reused**: Uses canonical `enrollments`, `teacher_subject_assignments`, `academic_years`.
- **C. Database Invariants**: Triggers for cross-table max marks and date bounds; UNIQUE student submission constraint.
- **D. Security Invariants**: RLS mapped to existing RBAC. Private Storage paths with Secure Definer policies.
- **E. API/RPC**: OCC enforced, deterministic lock-based lifecycle transitions.
- **F. Concurrency**: Explicitly solved using OCC (`updated_at` and `version`).
- **G. Test Coverage**: Matrix mapped 1-to-1 with invariants.
- **H. Remaining Ambiguity**: None. Schema and API are locked and implementation-ready.

