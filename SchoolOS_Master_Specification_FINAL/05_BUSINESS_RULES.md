# SchoolOS — Business Rules

This document must be expanded with client-approved rules before final production certification.

## Tenancy

1. A branch belongs to exactly one organization.
2. A branch cannot be read by a user without an authorized relationship to that branch.
3. Branch ownership cannot be freely edited by ordinary users.
4. Super Admin cross-branch actions are explicit and auditable.
5. Separate apps do not imply separate production databases.

## Student

1. Student identity is not the same as enrollment.
2. Enrollment is year/branch/class/section dependent.
3. Historical enrollments should be preserved.
4. A student may have multiple guardians.
5. Guardian relationships must be explicit.
6. Transfers between branches are controlled operations.

## Academic year

1. Academic year is branch-scoped unless the client explicitly needs organization-wide calendars.
2. Records that depend on academic year should reference the relevant year.
3. Historical data remains queryable.

## Scheduling

1. Periods belong to a branch/context.
2. Timetable entries must identify teacher/class/section/subject/period/date scope as applicable.
3. Room conflicts must be prevented or explicitly overridden with permission.
4. Teacher conflicts must be prevented or explicitly handled.

## Attendance

1. Only authorized users can modify attendance.
2. Published/locked attendance may require privileged correction.
3. Corrections should be audited.
4. Parent/student visibility follows their scope.

## Exams

1. Marks are tied to a defined exam/assessment component.
2. Published results should not be silently overwritten.
3. Corrections after publication require explicit authority and audit.
4. Grade/result calculations must be deterministic and testable.

## Finance

1. Historical payments should not be silently overwritten.
2. Refunds/reversals are separate financial events.
3. Fee changes are auditable.
4. Receipt numbering must follow agreed rules.
5. Financial permissions are stricter than normal CRUD.

## Notifications

1. A notification should be sent only to eligible recipients.
2. Branch ownership/recipient scope must be verified server-side.
3. Failed deliveries are recorded where provider capabilities allow.

## Branch lifecycle

Recommended states:

- ACTIVE
- SUSPENDED
- ARCHIVED

Suspending a branch must not destroy its data.

## User lifecycle

Removing access must not automatically delete historical business records.
