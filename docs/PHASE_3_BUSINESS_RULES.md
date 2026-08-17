# SchoolOS — Phase 3: Students & Academics Business Rules

## Student Identity & Transfer
- **ASSUMED**: A Student identity (`students`) is organization-wide to allow seamless transferring between branches of the same organization without duplicating student profiles.
- **ASSUMED**: Admission Numbers (or Enrollment References) are branch-specific and generated at the `enrollment` level, not the student identity level. 
- **CONFIRMED**: A student may have multiple historical enrollments.
- **CLIENT DECISION REQUIRED**: Can a student have multiple *simultaneous* active enrollments across different branches (e.g. dual enrollment)? (Default assumption: No).
- **CLIENT DECISION REQUIRED**: When a student transfers, should their historical records (like attendance/grades) be visible to the new branch? (Default assumption: Yes, via cross-branch queries restricted to the student's historical enrollments, but write-locked to the original branch).

## Guardians
- **CONFIRMED**: A student may have multiple guardians.
- **ASSUMED**: A guardian identity (`guardians`) is organization-wide. A guardian with multiple children in different branches uses a single login/profile.
- **ASSUMED**: Guardian visibility is restricted strictly to their own children via `student_guardians`. They cannot see other guardians or students.

## Academic Structures
- **CONFIRMED**: Academic years, Classes, Sections, and Subjects are branch-scoped.
- **ASSUMED**: Academic structures cannot be fully hard-deleted if enrollments or historical records depend on them. They must be soft-deleted or archived (`status = 'ARCHIVED'`).
- **CLIENT DECISION REQUIRED**: Do Subjects belong strictly to a Branch, or are they standardized across the Organization? (Default assumption: Branch-scoped to allow maximum flexibility, but an org-level template could be used later).
- **CONFIRMED**: Class-Subject assignments dictate which subjects are taught in which class/section.

## Enrollments
- **CONFIRMED**: An enrollment ties a Student to a Branch, Academic Year, Class, and Section.
- **ASSUMED**: Uniqueness constraint: `[student_id, academic_year_id]` to prevent a student from being double-enrolled in the same academic year within the same branch.
