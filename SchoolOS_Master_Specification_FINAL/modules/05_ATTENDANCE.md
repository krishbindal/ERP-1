# Module Specification: Operations — Attendance

## 1. Module

- **Name:** Operations — Attendance
- **Purpose:** Manage daily student attendance, tracking present/absent/late/excused statuses, enforcing calendar-driven instructional days, and handling lock/publish/correction lifecycles.
- **Priority:** High (Phase 5)
- **Dependencies:** Foundation, Academic Foundation, Calendar.

## 2. Actors

- **Super Admin:** Global read, audited cross-branch corrections.
- **Branch Admin / Principal:** Branch-level read, publish, and privileged corrections.
- **Class Teacher / Teacher:** Entry and manual lock for assigned sections.
- **Parent:** Read-only access to own child's published attendance.
- **Student:** Read-only access to own published attendance.
- **System (Cron):** End-of-day automatic lock sweep.

## 3. Scope

- Student attendance only (Daily granularity).
- Bound by Branch and Academic Year.

## 4. Entities

- `attendance_sessions`: Represents a single roll-call event for a specific Section on a specific Date.
- `attendance_records`: Individual student statuses linked to a session.
- `attendance_audit_logs`: Immutable ledger of state changes, locks, publishes, and corrections.

## 5. Business rules

1. **Granularity:** Attendance is recorded once per student per day (Daily attendance).
2. **Statuses:** Allowed statuses are `PRESENT`, `ABSENT`, `LATE`, `EXCUSED`.
3. **Calendar Integration:** Attendance cannot be entered for non-instructional days (`HOLIDAY`, `CLOSURE`), as interpreted dynamically from Calendar events, unless overridden by a `MAKEUP_DAY`.
4. **Locking:** Sessions must be locked to finalize entry. Teachers can manually lock. An EOD cron job automatically locks remaining open sessions based on `branches.timezone`.
5. **Publishing:** Branch Admins manually publish locked sessions. Publication makes records visible to Parents/Students.
6. **Corrections:** Post-lock or post-publish changes require `BRANCH_ADMIN` or `PRINCIPAL` roles, direct execution (no dual approval), and a mandatory audit reason.
7. **Percentage Math:** `(Present + Late) / (Total Instructional Days - Excused Leave)`.
8. **Missing Records:** Unentered attendance is treated as NULL (Excluded), not implicitly Absent.
9. **Atomicity:** Bulk entry is all-or-nothing.

## 6. Database

### Tables & Fields

**`attendance_sessions`**
- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `branch_id` UUID NOT NULL REFERENCES branches(id)
- `academic_year_id` UUID NOT NULL REFERENCES academic_years(id)
- `section_id` UUID NOT NULL REFERENCES sections(id)
- `date` DATE NOT NULL
- `locked_at` TIMESTAMPTZ
- `locked_by` UUID REFERENCES profiles(id)
- `published_at` TIMESTAMPTZ
- `published_by` UUID REFERENCES profiles(id)
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()
- `updated_at` TIMESTAMPTZ NOT NULL DEFAULT now()

**`attendance_records`**
- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `session_id` UUID NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE
- `student_id` UUID NOT NULL REFERENCES students(id)
- `status` attendance_status NOT NULL (Enum: 'PRESENT', 'ABSENT', 'LATE', 'EXCUSED')
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()
- `updated_at` TIMESTAMPTZ NOT NULL DEFAULT now()

**`attendance_audit_logs`**
- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `session_id` UUID NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE
- `record_id` UUID REFERENCES attendance_records(id) ON DELETE CASCADE
- `actor_id` UUID NOT NULL REFERENCES profiles(id)
- `action` attendance_action NOT NULL (Enum: 'CREATE', 'UPDATE', 'LOCK', 'PUBLISH', 'CORRECT')
- `old_status` attendance_status
- `new_status` attendance_status
- `reason` TEXT
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()

### Constraints
- `UNIQUE(branch_id, academic_year_id, section_id, date)` on `attendance_sessions`.
- `UNIQUE(session_id, student_id)` on `attendance_records`.
- `CHECK(status IN ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED'))`

### Indexes
- `idx_attendance_sessions_branch_date` on `attendance_sessions (branch_id, date)`.
- `idx_attendance_records_student` on `attendance_records (student_id)`.

### Migration / Archive
- Logical deletions are prevented via app constraints. `ON DELETE CASCADE` is for referential integrity.
- Archived academic years inherently block mutations because the `attendance_sessions` map to inactive `academic_year_id`.

## 7. Security

**Permissions:**
- `attendance.view`
- `attendance.manage` (teachers)
- `attendance.publish` (admins)
- `attendance.correct` (admins)

**RLS Policies:**
- **`attendance_sessions` & `attendance_records`:**
  - **SELECT (Staff):** `auth_user_has_branch_role(branch_id)` and specific permissions.
  - **SELECT (Parent):** Joins `student_guardians` on `student_id` AND `attendance_sessions.published_at IS NOT NULL`.
  - **SELECT (Student):** `student_id = auth.uid()` AND `published_at IS NOT NULL`.
  - **INSERT/UPDATE (Teacher):** `locked_at IS NULL` AND `auth_user_has_branch_role(branch_id)`.
  - **INSERT/UPDATE (Admin):** Requires `attendance.correct` bypassing `locked_at`.
- **Ownership:** Hardbound to `branch_id`. Cross-branch mutation throws access denied.
- **Ownership Tampering:** RLS ensures the `branch_id` matches the actor's authorized branches.

## 8. APIs

### Lifecycle / State Machine
Allowed transitions:
1. `Draft` (Created by Teacher)
2. `Locked` (By Teacher explicitly, or System EOD Cron)
3. `Published` (By Branch Admin)
4. `Corrected` (By Branch Admin post-lock/publish, creates Audit Log)

### Concurrency and Transactions
- **Bulk Save Atomicity:** Standard Postgres transactions ensure all-or-nothing saves.
- **Race conditions:** If two teachers submit the same section, standard last-write-wins applies at the row level, or a version column can be used. Lock racing with save fails if the transaction commits the lock first (the save transaction fails the `locked_at IS NULL` server check). EOD cron uses `SELECT ... FOR UPDATE` to lock rows securely.

### Operations

1. **`GET /api/attendance/roster`**
   - **Actor:** Teacher/Admin
   - **Context:** Server derives `branch_id` and `academic_year_id`.
   - **Parameters:** `date`, `section_id`.
   - **Validation:** Server verifies `date` is valid via `getInstructionalDay`. Rejects if `HOLIDAY`.
   - **Response:** Enrolled students for `section_id` and existing `attendance_records` if any.

2. **`POST /api/attendance/sessions/bulk-upsert`**
   - **Actor:** Teacher
   - **Payload:** `date`, `section_id`, array of `{ student_id, status }`.
   - **Validation:** Checks Calendar validity. Fails if session `locked_at IS NOT NULL`.
   - **Side Effects:** Upserts session and records atomically. Generates `CREATE` or `UPDATE` audit logs.

3. **`POST /api/attendance/sessions/:id/lock`**
   - **Actor:** Teacher/Admin
   - **Side Effects:** Sets `locked_at = now()`, `locked_by = auth.uid()`. Logs `LOCK` action.

4. **`POST /api/attendance/sessions/auto-lock` (Internal Cron)**
   - **Actor:** System Service Role
   - **Logic:** Identifies open sessions where `date < CURRENT_DATE AT TIME ZONE branches.timezone` and locks them.

5. **`POST /api/attendance/sessions/:id/publish`**
   - **Actor:** Branch Admin
   - **Validation:** Requires `attendance.publish`.
   - **Side Effects:** Sets `published_at = now()`, `published_by = auth.uid()`. Logs `PUBLISH`. Triggers `STUDENT_DAILY_ABSENCE` async notifications.

6. **`PATCH /api/attendance/sessions/:id/correct`**
   - **Actor:** Branch Admin / Principal
   - **Payload:** `student_id`, `new_status`, `reason`.
   - **Validation:** Requires `attendance.correct` permission.
   - **Side Effects:** Updates record status, creates `CORRECT` audit log containing the mandatory `reason`.

## 9. Screens

- **Attendance Dashboard:** Section grids for current date showing states (Unmarked, Draft, Locked, Published).
- **Daily Roll Call:** Roster grid with Present/Absent/Late/Excused radio toggles. Includes Save and Lock actions.
- **Correction Modal:** Admin-only interface prompting for the mandatory Audit Reason.
- **Parent/Student View:** Read-only historical list/calendar of published Absences and Lates.

## 10. Notifications

- **Events:** `STUDENT_DAILY_ABSENCE`
- **Recipients:** Guardians mapped via `student_guardians`.
- **Triggers:** Dispatched asynchronously strictly *after* the session receives its `published_at` timestamp.

## 11. Files
- N/A

## 12. Reports
- **Daily Absentees Report:** For branch administration.
- **Monthly Percentage Report:** Uses defined metric `(Present+Late)/(Total-Excused)`.

## 13. Imports/exports
- Phase 5 does not require CSV import.
- Standard read-only CSV export of grids is supported.

## 14. Tests

- **Unit:**
  - Percentage metric math logic.
  - Calendar integration logic (`HOLIDAY` blocking).
  - State machine transitions.
- **Integration / Server Actions:**
  - Bulk upsert atomicity (rollback on partial fail).
  - Concurrency locks.
- **RLS:**
  - Cross-branch denial (User A mutating Branch B = 403).
  - Ownership tampering (Forging a payload with another branch's `section_id`).
  - Parent accesses published record = 200. Parent accesses draft record = 403/empty.
- **E2E (Playwright):**
  - Teacher marks roster, clicks Save, then clicks Lock.
  - Teacher attempts to edit after lock, receives error.
  - Admin clicks Publish.
  - Admin corrects a record with a reason.
  - Parent logs in and views the published absence.

## 15. Definition of done

- DB schema and RLS migrations execute cleanly.
- Server Actions enforce Calendar instructional days independently of the client.
- Admin correction is verifiably written to `attendance_audit_logs`.
- Playwright E2E verifies lock blocks UI and API mutations.
- The 15 explicit product decisions from the finalized contract remain unviolated.
