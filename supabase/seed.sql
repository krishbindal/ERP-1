-- Seed Data for SchoolOS E2E Tests
-- Organizations
INSERT INTO public.organizations (id, name) VALUES ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01', 'Test Organization') ON CONFLICT DO NOTHING;

-- Branches
INSERT INTO public.branches (id, organization_id, name) VALUES ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01', 'Test Branch') ON CONFLICT DO NOTHING;

-- Profiles
INSERT INTO public.profiles (id, first_name, last_name)
SELECT id, 'Super', 'Admin' FROM auth.users WHERE email = 'superadmin.e2e@test.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.profiles (id, first_name, last_name)
SELECT id, 'Branch', 'Admin' FROM auth.users WHERE email = 'admin.a.e2e@test.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.profiles (id, first_name, last_name)
SELECT id, 'Teacher', 'A' FROM auth.users WHERE email = 'teacher.a1.e2e@test.com'
ON CONFLICT DO NOTHING;

-- Staff 
INSERT INTO public.staff (id, organization_id, profile_id, first_name, last_name)
SELECT 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee21', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01', id, 'Branch', 'Admin' FROM auth.users WHERE email = 'admin.a.e2e@test.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.staff (id, organization_id, profile_id, first_name, last_name)
SELECT 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee22', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01', id, 'Teacher', 'A' FROM auth.users WHERE email = 'teacher.a1.e2e@test.com'
ON CONFLICT DO NOTHING;

-- Staff Branch Profiles
INSERT INTO public.staff_branch_profiles (staff_id, branch_id)
SELECT id, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02' FROM public.staff WHERE id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee21'
ON CONFLICT DO NOTHING;

INSERT INTO public.staff_branch_profiles (staff_id, branch_id)
SELECT id, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02' FROM public.staff WHERE id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee22'
ON CONFLICT DO NOTHING;

-- Roles
INSERT INTO public.roles (id, organization_id, name) VALUES 
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee30', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01', 'Branch Admin') ON CONFLICT DO NOTHING;
INSERT INTO public.roles (id, organization_id, name) VALUES
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee31', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01', 'Teacher') ON CONFLICT DO NOTHING;

-- Branch Memberships
INSERT INTO public.branch_memberships (id, branch_id, user_id)
SELECT 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee40', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', id FROM auth.users WHERE email = 'admin.a.e2e@test.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.branch_memberships (id, branch_id, user_id)
SELECT 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee41', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', id FROM auth.users WHERE email = 'teacher.a1.e2e@test.com'
ON CONFLICT DO NOTHING;

-- User Role Assignments
INSERT INTO public.user_role_assignments (branch_membership_id, role_id)
SELECT id, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee30' FROM public.branch_memberships WHERE id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee40'
ON CONFLICT DO NOTHING;

INSERT INTO public.user_role_assignments (branch_membership_id, role_id)
SELECT id, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee31' FROM public.branch_memberships WHERE id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee41'
ON CONFLICT DO NOTHING;

-- Org memberships
INSERT INTO public.organization_memberships (organization_id, user_id)
SELECT 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01', id FROM auth.users WHERE email = 'superadmin.e2e@test.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.organization_memberships (organization_id, user_id)
SELECT 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01', id FROM auth.users WHERE email = 'admin.a.e2e@test.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.organization_memberships (organization_id, user_id)
SELECT 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01', id FROM auth.users WHERE email = 'teacher.a1.e2e@test.com'
ON CONFLICT DO NOTHING;
