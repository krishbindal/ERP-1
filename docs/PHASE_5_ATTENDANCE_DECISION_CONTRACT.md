# SchoolOS — Phase 5 Attendance Product & Security Decision Contract

**Status:** FINAL (Implementation Authorized)
**Phase:** 5 — Operations / Attendance
**Decision type:** Level 2/3 module design contract; implementation and schema execution is now authorized based on the resolved decisions below.
**Source baseline:** `SchoolOS_Master_Specification_FINAL` + current repository security/architecture contracts.

## 1. Purpose

Freeze the product, domain, authorization, lifecycle, audit, reporting, and testing decisions required to implement Attendance safely.

This document is a decision gate. It does **not** authorize database migrations, production schema changes, server actions, APIs, UI implementation, or changes to Calendar/Scheduling contracts.

## 2. Non-negotiable architectural constraints

1. Organization remains the top-level tenant; branches remain the operational isolation boundary.
2. One centralized production PostgreSQL/Supabase platform remains canonical.
3. Attendance is a branch-owned operational domain and cannot create a parallel tenancy model.
4. Database/server authorization is authoritative; client-selected branch, academic year, student, section, teacher, status, lock, or publication values are not trusted as final authority.
5. RLS remains part of the enforcement boundary. Server validation and permission checks complement, rather than replace, RLS.
6. Calendar remains the source of truth for the interpretation of an actual date as an instructional/non-instructional day. Attendance must not duplicate holiday/weekend/closure logic.
7. Timetable remains the canonical source for recurring scheduled lesson structure. Attendance must not recreate timetable semantics.
8. Sensitive attendance corrections are transactional, permission-protected, and auditable.
9. Historical attendance must remain queryable; ordinary access revocation must not destroy historical records.
10. No client-side branch/app identity is a security control.
11. No service-role credential is exposed to clients.
12. No implementation may silently change foundation tenancy, RLS, Calendar, Timetable, or enrollment contracts.

## 3. Attendance model decision

### 3.1 Product model: Daily attendance only

**Decision:** The authoritative product decision for Phase 5 is daily attendance only. Lesson/period attendance is explicitly excluded to avoid matrix complexity.

**Why:** A single daily attendance outcome per student significantly reduces integration friction with calendar, timetable, and enrollment matrices.

**Important:** The system must share canonical student, enrollment, branch, academic-year, Calendar, and audit concepts.

### 3.2 Daily attendance semantics

A daily attendance record represents a student's attendance outcome for a particular instructional date anchored to their primary enrolled section.

A daily record must not be created for an invalid/non-instructional date unless an explicitly authorized exception workflow is defined.

### 3.3 Student attendance is primary scope for Phase 5

Phase 5 Attendance centers entirely on **student attendance**.

Staff/employee attendance remains a separate future HR/Payroll concern. Staff attendance must not be mixed into the student attendance schema merely for convenience.

## 4. Relationship to enrollment

Attendance must resolve the student's effective academic/branch context from canonical enrollment data.

Historical attendance must not silently move when a student later changes class/section or transfers branch.

A transfer operation therefore creates a historical boundary; it must not retroactively rewrite prior attendance to the student's new section/branch.

## 5. Relationship to Calendar

Calendar is authoritative for actual-day interpretation.

Attendance should consume Calendar resolution for:

- instructional day
- non-instructional day
- holiday/closure where represented
- exceptional/makeup instructional day where represented

Attendance must not independently decide that Saturday, Sunday, a holiday, or a closure is/is not a school day.

### Exception rule

A privileged administrator may need to record attendance in exceptional circumstances, but such a workflow must be an explicit business operation with an audit reason. It must not be implemented as a hidden bypass of Calendar rules.

## 6. Relationship to Timetable and Enrollment

Daily attendance anchors to a student's enrolled Section on a specific Date, rather than to granular Timetable entries. 
The authoritative chain is conceptually:

Academic Year -> Section Enrollment -> Calendar Date -> Daily Attendance

## 7. Attendance statuses

### Proposed canonical base statuses

- `PRESENT`
- `ABSENT`
- `LATE`
- `EXCUSED`

### Status extensibility

The implementation should be designed so additional school-approved statuses can be introduced later without rewriting the authorization/lifecycle architecture.

The product contract must define which statuses participate in attendance percentage calculations before production reporting is built.

### Calculation Policies

LATE counts as PRESENT for the percentage denominator, but occurrences are tracked separately for disciplinary reporting. EXCUSED is explicitly excluded from the percentage denominator.
## 8. Lock and publish are distinct concepts

### 8.1 Lock

**Decision:** Lock controls whether ordinary authorized users may continue editing an attendance record/set.

A lock is a mutation-state boundary, not merely a UI state.

### 8.2 Publish

**Decision:** Publish controls whether attendance becomes eligible for parent/student-facing publication and finalized operational reporting, subject to the module's visibility rules.

Publish and lock should not be conflated. A school may require lock-before-publish, publish-without-lock, or privileged publication workflows depending on policy.

### 8.3 Why separate them

A school can need to stop routine edits without immediately exposing a result to parents, or expose a result while still allowing a privileged internal review process. Keeping the concepts separate preserves future policy flexibility.

## 9. Corrections after lock/publish

### Proposed lifecycle

`DRAFT/OPEN -> LOCKED -> PUBLISHED`

The exact simultaneous/ordered transition rules must be enforced explicitly rather than inferred from UI state.

### Correction rule

Once locked or published, ordinary attendance actors cannot mutate attendance directly.

A privileged correction operation must:

1. authenticate the actor;
2. verify permission and branch/organization scope;
3. verify the target attendance record is in a correctable state;
4. validate the requested new state against business rules;
5. execute atomically;
6. record before/after values;
7. record actor, timestamp, reason, target, and request/correlation ID where available;
8. preserve audit history rather than silently overwriting evidence.

### Correction reason

A correction reason is required for privileged post-lock/post-publish changes.

## 10. Who may perform each operation

### Baseline authorization model

**Super Admin:** organization-authorized cross-branch operations, explicitly audited.

**Branch Admin / Principal / equivalent privileged branch role:** manage attendance for the authorized branch according to granted permission.

**Teacher/Class Teacher:** attendance only for authorized teaching scope; class/section/lesson access must derive from current authorized assignment rather than arbitrary client-selected IDs.

**Accountant/Librarian/other unrelated roles:** no attendance mutation unless an explicit permission is deliberately granted later.

**Parent:** read-only own-child scope.

**Student:** read-only own-record scope.

### Critical rule

Role name alone is never sufficient. Effective permission is the intersection of identity, organization membership, branch membership, role, permission, resource scope, and current lifecycle state.

## 11. Parent and student visibility

Parents may access only attendance records for authorized children.

Students may access only their own attendance.

Neither parent nor student visibility may depend on a client-side branch selector.

Publication state must be respected where the product contract requires unpublished records to remain internal.

## 12. Edit scope and bulk operations

Attendance entry will likely be a grid/bulk workflow because this is a high-frequency operational path.

Any bulk mutation must:

- validate the full requested scope;
- prevent cross-branch data submission;
- enforce assignment/class/section scope for teachers;
- reject invalid student enrollment context;
- use a transaction or deterministic batch strategy;
- produce safe row-level errors where partial validation fails;
- avoid partial silent updates.

Whether a batch is all-or-nothing or explicitly supports partial success is a product/API decision that must be fixed before implementation.

## 13. Leave

Leave must be treated as a related but distinct concept.

A future leave workflow may include:

- request
- approval/rejection
- effective dates
- supporting documentation
- authorized attendance effect

Attendance should not infer an approved leave merely because a free-text note says “leave.”

For Phase 5, the exact leave approval workflow is a separate decision item unless already contractually required.

## 14. Reporting and calculations

Attendance percentage is a derived metric, not an independently editable field.

The calculation engine must define:

- denominator rules;
- treatment of non-instructional days;
- treatment of exempt/approved leave;
- treatment of late/partial attendance;
- treatment of missing/unentered attendance;
- date-range rules;
- academic-year boundary;
- transfer boundary;
- published vs unpublished inclusion.

The same deterministic calculation rules must be used by dashboards, student history, parent views, exports, and any future regulatory reporting.

No report may reveal rows outside the actor's underlying authorization scope.

## 15. Audit requirements

At minimum, audit:

- attendance creation where policy requires;
- bulk attendance entry;
- status changes;
- lock/unlock;
- publish/unpublish where supported;
- privileged corrections;
- attendance configuration changes;
- imports/exports;
- unauthorized mutation attempts where security monitoring policy requires.

Audit records should capture actor, organization, branch, action, entity, timestamp, before/after data as appropriate, request/correlation ID, and safe metadata.

Never log passwords, tokens, or secrets.

## 16. Import/export

Attendance import/export must be permission-protected and branch-scoped.

Exports must log who exported what, the scope, and time.

Imports must use validation, duplicate detection, row-level error reporting, and reconciliation.

Import semantics must never silently create attendance for an invalid Calendar/timetable/enrollment context.

## 17. Notifications

Attendance notifications must be generated only after recipient authorization is established.

Potential events include:

- daily absence notification;
- repeated absence threshold;
- late notification;
- correction notification where product policy requires.

Notification sending must not become part of the attendance transaction's critical integrity path. Provider failure must not corrupt the attendance transaction.

## 18. Offline/mobile

Attendance is a high-frequency mobile workflow, but offline writes must not be introduced casually.

Before allowing offline attendance mutation, the system must define:

- conflict resolution;
- duplicate prevention;
- stale assignment handling;
- lock/publish conflicts;
- device revocation behavior;
- audit semantics for delayed writes.

Until those decisions are documented, attendance mutation should remain online-authoritative.

## 19. Security contract

For every Attendance protected operation, tests must cover:

### Positive
- authorized branch success;
- authorized teaching scope success;
- authorized privileged correction success;
- authorized Super Admin cross-branch operation where applicable;
- parent own-child read;
- student own-record read.

### Negative
- branch A user reads branch B = denied;
- branch A user writes branch B = denied;
- teacher writes unauthorized section = denied;
- teacher modifies arbitrary student by ID outside scope = denied;
- parent reads non-child = denied;
- student reads another student = denied;
- role without attendance permission mutates = denied;
- locked record ordinary mutation = denied;
- published record ordinary mutation = denied;
- branch ownership tampering = denied;
- academic-year/context tampering = denied;
- invalid/non-instructional date mutation = denied unless explicit exception permission exists.

## 20. Performance contract

Attendance is identified by the current platform specification as a likely hot path.

The eventual implementation must therefore be designed around:

- indexed branch/date/academic-year access paths;
- bounded class/section queries;
- pagination for history where appropriate;
- bulk writes rather than one request per student when operationally safe;
- no N+1 UI/API access pattern;
- query-plan review on representative school-size fixtures.

Actual performance budgets will be set after baseline measurement, consistent with the project's performance policy.

## 21. UI contract before implementation

Required screens are expected to include, at minimum:

- Attendance dashboard/landing;
- Daily attendance entry;
- Attendance history/detail;
- Lock/publish controls for privileged users;
- Correction workflow;
- Parent/student attendance view;
- Attendance reports.

Every screen must specify purpose, actor, scope, route, dependencies, permissions, validation, loading, empty, error, and permission-denied states before implementation.

## 22. Explicit Product Decisions (RESOLVED)

The following 15 decisions have been explicitly approved by the product owner. They now form the final business rules for Phase 5 implementation:

1. **Granularity:** Daily attendance only for the first release.
2. **Exact Attendance Statuses:** `PRESENT`, `ABSENT`, `LATE`, `EXCUSED`.
3. **Exact Lock Timing Rules:** Manual lock by Teacher, with an Automatic Midnight Fallback (via cron) in the branch's timezone.
4. **Publish Semantics & Mandate:** Manual Publish by Branch Admin.
5. **Privileged Correction Roles:** `BRANCH_ADMIN` and `PRINCIPAL`.
6. **Post-publish Corrections Approval:** No second-role approval; direct correction with a mandatory Audit Reason.
7. **Percentage Calculation Policy:** `(Present + Late) / (Total Instructional Days - Excused Leave)`.
8. **Treatment of Approved Leave:** Exclude from denominator (Map to `EXCUSED`).
9. **Treatment of Late/Partial Attendance:** Count as `PRESENT` for the percentage, but track `LATE` occurrences separately.
10. **Missing Attendance (Unentered):** Treat as NULL/Excluded (Missing is not Absent).
11. **Bulk-operation Atomicity Semantics:** All-or-Nothing (Atomic) transaction.
12. **Attendance Import Requirement:** Defer Import to post-V1.
13. **Mandatory Notifications:** Daily absence notification to Parents triggered automatically upon Publish.
14. **Staff Attendance:** Defer to HR module (Phase 5 is Student attendance only).
15. **Offline/Mobile Capability:** Online-authoritative only (No offline sync for V1).

## 23. Decisions we should NOT make implicitly

Do not assume:

- 75% attendance is a universal SchoolOS rule;
- every school uses subject-wise attendance;
- weekends are always non-instructional;
- leave automatically means present/exempt;
- late always counts as present;
- publish always means immutable;
- a teacher can edit any student in a branch;
- branch identity in the mobile build authorizes access;
- a client-supplied `branch_id` or `academic_year_id` is trustworthy;
- attendance can independently interpret Calendar state.

## 24. Implementation gate

**STATUS: GATE PASSED.**

Implementation is now authorized because the explicit product decisions have been finalized. The engineering team is cleared to produce the required artifacts (schema, API contracts, screen specs, and test matrix) in the subsequent implementation slices.

## 25. Evidence standard

Every future implementation report must distinguish:

- specified;
- implemented;
- tested;
- certified;
- blocked;
- deferred.

No completion claim without test, security, regression, build, and known-limitation evidence.

## 26. Sources and research posture

External research is supporting evidence only. It does not override SchoolOS's own contractual requirements.

Relevant current references used during this decision pass include:

- PostgreSQL Row-Level Security documentation: https://www.postgresql.org/docs/current/ddl-rowsecurity.html
- Supabase Row Level Security documentation: https://supabase.com/docs/guides/database/postgres/row-level-security
- OWASP Authorization Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html
- OWASP API1: Broken Object Level Authorization: https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/
- Fedena attendance support documentation (daily/subject attendance and locking behavior): https://support.fedena.com/support/solutions/211470
- CBSE attendance eligibility circular (5 August 2025): https://www.cbse.gov.in/cbsenew/documents/Strict_Compliance_attendance_Eligibility_05082025.pdf
- MeitY Digital Personal Data Protection Rules 2025: https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa

External references are recorded for rationale and verification; client requirements remain authoritative.
