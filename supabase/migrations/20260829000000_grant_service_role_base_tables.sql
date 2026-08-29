-- Fix: Grant explicit service_role access to foundational tables created before Phase 5

-- User Identity & Roles
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.roles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_role_assignments TO service_role;

-- Organizational Structure
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.branches TO service_role;

-- Academic & Enrollment
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.enrollments TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.academic_years TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.classes TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sections TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_branch_profiles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_branch_profiles TO service_role;
