# SchoolOS — Phase 3A Placement Decision

## Decision Summary
In Phase 3A, we are establishing the `students` and `guardians` identity tables. These tables are inherently organization-scoped. However, SchoolOS's foundational rule is that a branch user must only see students who belong to a branch they have access to. 

To bridge this gap without implementing the full Academic module (Years, Classes, Sections) and full Enrollment workflows in Phase 3A, we are introducing a minimal `enrollments` table as a **security/data-ownership foundation**.

## Rationale
- **Branch Isolation**: The `enrollments` table maps `student_id` directly to `branch_id`. This allows RLS policies on `students` to safely evaluate `EXISTS(SELECT 1 FROM enrollments WHERE student_id = students.id AND branch_id = ANY(auth_user_branches()))`.
- **Minimal Viability**: We avoid polluting the `students` table with a temporary `branch_id` column, maintaining the architectural distinction between canonical identity and operational placement.
- **Future Growth**: The `enrollments` table implemented here includes only the bare minimum fields: `id`, `organization_id`, `branch_id`, `student_id`, `status`, `effective_from`, and `effective_to`. In Phase 3C, we will expand this exact table by adding nullable foreign keys for `academic_year_id`, `class_id`, and `section_id` rather than needing a costly data migration.

## Implementation Limits
For Phase 3A, this table is purely an architectural hook to satisfy branch authorization. There is no UI to "Transfer" or deeply manage these enrollments; they are created atomically via the `create_student_with_initial_placement` database function when a student is created.
