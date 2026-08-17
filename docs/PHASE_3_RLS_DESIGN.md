# SchoolOS — Phase 3: RLS Design

## RLS Enforcement Strategy

### Students (`students`)
- **Ownership**: `organization_id`
- **Read**: `organization_id = ANY(auth_user_organizations())` (All org members can see basic student profile to facilitate transfer lookups, OR we restrict strictly to enrolled branches). 
  - *Decision*: Restrict to users who are members of branches where the student has an active/past enrollment, PLUS organization super admins.
- **Write**: Super Admins and authorized branch admins.

### Guardians (`guardians`) & Student-Guardian Links (`student_guardians`)
- **Ownership**: `organization_id`
- **Read**: Branch members who can see the student, OR the guardian themselves.
- **Write**: Super Admins, Branch admins.

### Academics (`academic_years`, `classes`, `sections`, `subjects`, `class_subjects`)
- **Ownership**: `branch_id`
- **Read**: `branch_id = ANY(auth_user_branches())` (Users can see academic structures of branches they belong to).
- **Write**: Super Admins, Branch admins with academic permissions.

### Enrollments (`enrollments`)
- **Ownership**: `branch_id`
- **Read**: `branch_id = ANY(auth_user_branches())` AND (User is teacher/admin OR User is the guardian of the student).
- **Write**: Super Admins, Branch admissions/admin staff.

### Teacher Relationships (`teacher_subject_assignments`)
- **Ownership**: `branch_id`
- **Read**: Branch members.
- **Write**: Super Admins, Branch academic admins.
