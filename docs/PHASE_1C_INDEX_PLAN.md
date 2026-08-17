# SchoolOS — Database Index Plan

To maintain performance given the centralized, RLS-heavy architecture, the following indexes are prioritized:

## RLS & Membership Indexes
- `branch_memberships(user_id, branch_id)` - Essential for fast `auth_user_branches()` execution.
- `user_role_assignments(branch_membership_id, role_id)` - Essential for permission lookups.

## Operational Table Indexes
- `students(branch_id, status)` - For quick branch roster loading.
- `enrollments(student_id, academic_year_id)` - For fast historical lookup.
- `attendance(branch_id, date, class_id)` - High-volume queries for daily registers.
- `invoices(branch_id, student_id, status)` - For financial dashboard aggregation.
- `marks(assessment_component_id, student_id)` - For report card generation.
- `audit_logs(branch_id, entity_name, created_at)` - For compliance tracking without full table scans.

*Full-text search indexes (GIN/GiST) will be added to `profiles(name)` and `students(admission_number)` where search interfaces are required.*
