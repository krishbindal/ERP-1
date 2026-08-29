-- Fix: Grant explicit service_role access to foundational tables created before Phase 5
-- Using LEAST PRIVILEGE: No DELETE on foundational tables unless strictly necessary.

-- User Identity & Roles
GRANT SELECT, INSERT, UPDATE ON public.profiles TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.roles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_role_assignments TO service_role;

-- Organizational Structure
GRANT SELECT, INSERT, UPDATE ON public.organizations TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.branches TO service_role;

-- Academic & Enrollment
GRANT SELECT, INSERT, UPDATE ON public.students TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.enrollments TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.academic_years TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.classes TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.sections TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.student_branch_profiles TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.staff_branch_profiles TO service_role;
