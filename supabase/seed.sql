-- Seed Data for SchoolOS E2E Tests

-- Organizations
INSERT INTO public.organizations (id, name) VALUES ('00000000-0000-0000-0000-000000000001', 'Test Organization');

-- Branches
INSERT INTO public.branches (id, organization_id, name) VALUES ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Test Branch');

-- Users are seeded via seed_users.js


-- Profiles (Trigger might create them, but let's make sure)
INSERT INTO public.profiles (id, first_name, last_name) VALUES 
((SELECT id FROM auth.users WHERE email = 'superadmin@test.com'), 'Super', 'Admin') ON CONFLICT DO NOTHING;

UPDATE auth.users SET raw_app_meta_data = raw_app_meta_data || '{"is_super_admin": true}'::jsonb WHERE email = 'superadmin@test.com';

INSERT INTO public.profiles (id, first_name, last_name) VALUES 
((SELECT id FROM auth.users WHERE email = 'admin.a@test.com'), 'Branch', 'Admin') ON CONFLICT DO NOTHING;
INSERT INTO public.profiles (id, first_name, last_name) VALUES 
((SELECT id FROM auth.users WHERE email = 'teacher.a1@test.com'), 'Teacher', 'A') ON CONFLICT DO NOTHING;

-- Staff 
INSERT INTO public.staff (id, organization_id, profile_id, first_name, last_name) VALUES
('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000001', (SELECT id FROM auth.users WHERE email = 'admin.a@test.com'), 'Branch', 'Admin'),
('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000001', (SELECT id FROM auth.users WHERE email = 'teacher.a1@test.com'), 'Teacher', 'A');

-- Staff Branch Profiles
INSERT INTO public.staff_branch_profiles (staff_id, branch_id) VALUES
('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000002'),
('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000002');

-- Roles
INSERT INTO public.roles (id, organization_id, name) VALUES 
('00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000001', 'Branch Admin') ON CONFLICT DO NOTHING;
INSERT INTO public.roles (id, organization_id, name) VALUES
('00000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000001', 'Teacher') ON CONFLICT DO NOTHING;

-- Branch Memberships
INSERT INTO public.branch_memberships (id, branch_id, user_id) VALUES
('00000000-0000-0000-0000-000000000040', '00000000-0000-0000-0000-000000000002', (SELECT id FROM auth.users WHERE email = 'admin.a@test.com')),
('00000000-0000-0000-0000-000000000041', '00000000-0000-0000-0000-000000000002', (SELECT id FROM auth.users WHERE email = 'teacher.a1@test.com'));

-- User Role Assignments
INSERT INTO public.user_role_assignments (branch_membership_id, role_id) VALUES
('00000000-0000-0000-0000-000000000040', '00000000-0000-0000-0000-000000000030'),
('00000000-0000-0000-0000-000000000041', '00000000-0000-0000-0000-000000000031');

-- Org memberships
INSERT INTO public.organization_memberships (organization_id, user_id) VALUES
('00000000-0000-0000-0000-000000000001', (SELECT id FROM auth.users WHERE email = 'superadmin@test.com')),
('00000000-0000-0000-0000-000000000001', (SELECT id FROM auth.users WHERE email = 'admin.a@test.com')),
('00000000-0000-0000-0000-000000000001', (SELECT id FROM auth.users WHERE email = 'teacher.a1@test.com'));
