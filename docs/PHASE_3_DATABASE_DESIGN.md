# SchoolOS — Phase 3: Database Design

## Proposed Tables

### 1. `students`
- `id` (uuid, PK)
- `organization_id` (uuid, FK to organizations)
- `profile_id` (uuid, FK to profiles, nullable if no auth)
- `first_name` (text)
- `last_name` (text)
- `dob` (date)
- `gender` (text)
- `status` (text) - ACTIVE, SUSPENDED, ARCHIVED
- `created_at`, `updated_at`

### 2. `guardians`
- `id` (uuid, PK)
- `organization_id` (uuid, FK to organizations)
- `profile_id` (uuid, FK to profiles, nullable if no auth)
- `first_name` (text)
- `last_name` (text)
- `phone` (text)
- `email` (text)
- `status` (text)

### 3. `student_guardians`
- `id` (uuid, PK)
- `student_id` (uuid, FK to students)
- `guardian_id` (uuid, FK to guardians)
- `relationship` (text) - Father, Mother, Guardian, etc.
- `is_primary` (boolean)
- `is_emergency_contact` (boolean)

### 4. `academic_years`
- `id` (uuid, PK)
- `branch_id` (uuid, FK to branches)
- `name` (text) - e.g., "2026-2027"
- `start_date` (date)
- `end_date` (date)
- `status` (text) - PLANNED, ACTIVE, COMPLETED, ARCHIVED

### 5. `classes`
- `id` (uuid, PK)
- `academic_year_id` (uuid, FK to academic_years)
- `name` (text) - e.g., "Grade 1"
- `level` (integer) - Sort order

### 6. `sections`
- `id` (uuid, PK)
- `class_id` (uuid, FK to classes)
- `name` (text) - e.g., "A"
- `capacity` (integer)

### 7. `subjects`
- `id` (uuid, PK)
- `branch_id` (uuid, FK to branches)
- `name` (text)
- `code` (text)
- `status` (text)

### 8. `class_subjects`
- `id` (uuid, PK)
- `class_id` (uuid, FK to classes)
- `subject_id` (uuid, FK to subjects)
- `is_optional` (boolean)

### 9. `enrollments`
- `id` (uuid, PK)
- `student_id` (uuid, FK to students)
- `branch_id` (uuid, FK to branches)
- `academic_year_id` (uuid, FK to academic_years)
- `class_id` (uuid, FK to classes)
- `section_id` (uuid, FK to sections)
- `admission_number` (text)
- `roll_number` (integer)
- `status` (text) - ACTIVE, TRANSFERRED, WITHDRAWN, GRADUATED
- `effective_from` (date)
- `effective_to` (date)

### 10. `teacher_subject_assignments`
- `id` (uuid, PK)
- `section_id` (uuid, FK to sections)
- `subject_id` (uuid, FK to subjects)
- `teacher_id` (uuid, FK to profiles) - Temporary until Teacher module
- `academic_year_id` (uuid, FK)
