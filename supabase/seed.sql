-- Seed Data for SchoolOS E2E Tests
-- Organizations
INSERT INTO public.organizations (id, name) VALUES ('00000000-0000-0000-0000-000000000001', 'Test Organization') ON CONFLICT DO NOTHING;

-- Branches
INSERT INTO public.branches (id, organization_id, name) VALUES ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Test Branch') ON CONFLICT DO NOTHING;

-- Profiles
INSERT INTO public.profiles (id, first_name, last_name)
SELECT id, 'Super', 'Admin' FROM auth.users WHERE email = 'superadmin@test.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.profiles (id, first_name, last_name)
SELECT id, 'Branch', 'Admin' FROM auth.users WHERE email = 'admin.a@test.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.profiles (id, first_name, last_name)
SELECT id, 'Teacher', 'A' FROM auth.users WHERE email = 'teacher.a1@test.com'
ON CONFLICT DO NOTHING;

-- Staff 
INSERT INTO public.staff (id, organization_id, profile_id, first_name, last_name)
SELECT '00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000001', id, 'Branch', 'Admin' FROM auth.users WHERE email = 'admin.a@test.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.staff (id, organization_id, profile_id, first_name, last_name)
SELECT '00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000001', id, 'Teacher', 'A' FROM auth.users WHERE email = 'teacher.a1@test.com'
ON CONFLICT DO NOTHING;

-- Staff Branch Profiles
INSERT INTO public.staff_branch_profiles (staff_id, branch_id) VALUES
('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000002') ON CONFLICT DO NOTHING;
INSERT INTO public.staff_branch_profiles (staff_id, branch_id) VALUES
('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000002') ON CONFLICT DO NOTHING;

-- Roles
INSERT INTO public.roles (id, organization_id, name) VALUES 
('00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000001', 'Branch Admin') ON CONFLICT DO NOTHING;
INSERT INTO public.roles (id, organization_id, name) VALUES
('00000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000001', 'Teacher') ON CONFLICT DO NOTHING;

-- Branch Memberships
INSERT INTO public.branch_memberships (id, branch_id, user_id)
SELECT '00000000-0000-0000-0000-000000000040', '00000000-0000-0000-0000-000000000002', id FROM auth.users WHERE email = 'admin.a@test.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.branch_memberships (id, branch_id, user_id)
SELECT '00000000-0000-0000-0000-000000000041', '00000000-0000-0000-0000-000000000002', id FROM auth.users WHERE email = 'teacher.a1@test.com'
ON CONFLICT DO NOTHING;

-- User Role Assignments
INSERT INTO public.user_role_assignments (branch_membership_id, role_id) VALUES
('00000000-0000-0000-0000-000000000040', '00000000-0000-0000-0000-000000000030') ON CONFLICT DO NOTHING;
INSERT INTO public.user_role_assignments (branch_membership_id, role_id) VALUES
('00000000-0000-0000-0000-000000000041', '00000000-0000-0000-0000-000000000031') ON CONFLICT DO NOTHING;

-- Org memberships
INSERT INTO public.organization_memberships (organization_id, user_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM auth.users WHERE email = 'superadmin@test.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.organization_memberships (organization_id, user_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM auth.users WHERE email = 'admin.a@test.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.organization_memberships (organization_id, user_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM auth.users WHERE email = 'teacher.a1@test.com'
ON CONFLICT DO NOTHING;
