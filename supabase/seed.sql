-- E2E Auth Users
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data, confirmation_token, recovery_token, email_change_token_new, email_change,
  is_super_admin,
  is_sso_user
) VALUES 
('eeeeeeee-eeee-eeee-eeee-eeeeeeeea001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'superadmin.e2e@test.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"], "is_super_admin": true}', '{}', '', '', '', '', true, false),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeea002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin.a.e2e@test.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{}', '', '', '', '', false, false),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeea003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'teacher.a1.e2e@test.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{}', '', '', '', '', false, false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES
('eeeeeeee-eeee-eeee-eeee-eeeeeeeea001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeea001', 'superadmin.e2e@test.com', format('{"sub": "%s", "email": "%s"}', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeea001', 'superadmin.e2e@test.com')::jsonb, 'email', now(), now(), now()),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeea002', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeea002', 'admin.a.e2e@test.com', format('{"sub": "%s", "email": "%s"}', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeea002', 'admin.a.e2e@test.com')::jsonb, 'email', now(), now(), now()),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeea003', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeea003', 'teacher.a1.e2e@test.com', format('{"sub": "%s", "email": "%s"}', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeea003', 'teacher.a1.e2e@test.com')::jsonb, 'email', now(), now(), now())
ON CONFLICT (provider_id, provider) DO NOTHING;

-- Seed Data for SchoolOS E2E Tests
-- Organizations
INSERT INTO public.organizations (id, name) VALUES ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01', 'Test Organization') ON CONFLICT DO NOTHING;

-- Branches
INSERT INTO public.branches (id, organization_id, name) VALUES ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01', 'Test Branch') ON CONFLICT DO NOTHING;
INSERT INTO public.branches (id, organization_id, name) VALUES ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee03', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01', 'Second Test Branch') ON CONFLICT DO NOTHING;


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


-- Seed data for Group 2C Timetable & Substitution E2E Tests
-- Branch: eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02 (Test Branch)
-- Academic Year
INSERT INTO public.academic_years (id, branch_id, name, start_date, end_date, status)
VALUES ('aaaaaaaa-1111-1111-1111-111111111111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', 'Test Year 2026', '2026-01-01', '2026-12-31', 'ACTIVE')
ON CONFLICT DO NOTHING;

-- Class (no status)
INSERT INTO public.classes (id, branch_id, academic_year_id, name, level)
VALUES ('aaaaaaaa-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', 'aaaaaaaa-1111-1111-1111-111111111111', 'Class 10', 10)
ON CONFLICT DO NOTHING;

INSERT INTO public.classes (id, branch_id, academic_year_id, name, level)
VALUES ('aaaaaaaa-2222-2222-2222-222222222223', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', 'aaaaaaaa-1111-1111-1111-111111111111', 'Class 11', 11)
ON CONFLICT DO NOTHING;

-- Section (no status)
INSERT INTO public.sections (id, branch_id, academic_year_id, class_id, name)
VALUES ('aaaaaaaa-3333-3333-3333-333333333333', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', 'aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-2222-2222-2222-222222222222', 'Section A')
ON CONFLICT DO NOTHING;

INSERT INTO public.sections (id, branch_id, academic_year_id, class_id, name)
VALUES ('aaaaaaaa-3333-3333-3333-333333333334', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', 'aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-2222-2222-2222-222222222223', 'Section B')
ON CONFLICT DO NOTHING;

-- Subject
INSERT INTO public.subjects (id, branch_id, name, code, status)
VALUES ('aaaaaaaa-4444-4444-4444-444444444444', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', 'Mathematics', 'MATH101', 'ACTIVE')
ON CONFLICT DO NOTHING;

INSERT INTO public.subjects (id, branch_id, name, code, status)
VALUES ('aaaaaaaa-4444-4444-4444-444444444445', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', 'Science', 'SCI101', 'ACTIVE')
ON CONFLICT DO NOTHING;

-- Room
INSERT INTO public.rooms (id, branch_id, name, capacity, status)
VALUES ('aaaaaaaa-5555-5555-5555-555555555555', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', 'Room 101', 30, 'ACTIVE')
ON CONFLICT DO NOTHING;

INSERT INTO public.rooms (id, branch_id, name, capacity, status)
VALUES ('aaaaaaaa-5555-5555-5555-555555555556', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', 'Room 102', 30, 'ACTIVE')
ON CONFLICT DO NOTHING;

-- Period
INSERT INTO public.periods (id, branch_id, name, start_time, end_time, status)
VALUES ('aaaaaaaa-6666-6666-6666-666666666666', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', 'Period 1', '08:00', '09:00', 'ACTIVE')
ON CONFLICT DO NOTHING;
