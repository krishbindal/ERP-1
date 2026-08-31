BEGIN;
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
('eeeeeeee-eeee-eeee-eeee-eeeeeeeea003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'teacher.a1.e2e@test.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{}', '', '', '', '', false, false),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeea004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'guardian.e2e@test.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{}', '', '', '', '', false, false)
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
('eeeeeeee-eeee-eeee-eeee-eeeeeeeea003', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeea003', 'teacher.a1.e2e@test.com', format('{"sub": "%s", "email": "%s"}', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeea003', 'teacher.a1.e2e@test.com')::jsonb, 'email', now(), now(), now()),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeea004', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeea004', 'guardian.e2e@test.com', format('{"sub": "%s", "email": "%s"}', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeea004', 'guardian.e2e@test.com')::jsonb, 'email', now(), now(), now())
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

-- Bell Schedule
INSERT INTO public.bell_schedules (id, branch_id, name, status)
VALUES ('aaaaaaaa-7777-7777-7777-777777777777', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', 'Standard Bell Schedule', 'ACTIVE')
ON CONFLICT DO NOTHING;

-- Period
INSERT INTO public.periods (id, bell_schedule_id, branch_id, name, start_time, end_time, status)
VALUES ('aaaaaaaa-6666-6666-6666-666666666666', 'aaaaaaaa-7777-7777-7777-777777777777', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', 'Period 1', '08:00', '10:00', 'ACTIVE')
ON CONFLICT DO NOTHING;

-- Phase 5: Communication permissions for Branch Admin
DO $$
DECLARE
    v_perm_id UUID;
    v_role_id UUID;
BEGIN
    SELECT id INTO v_perm_id FROM public.permissions WHERE name = 'communication.manage.branch';
    SELECT id INTO v_role_id FROM public.roles WHERE name = 'Branch Admin';
    
    IF v_perm_id IS NOT NULL AND v_role_id IS NOT NULL THEN
        INSERT INTO public.role_permissions (role_id, permission_id) 
        VALUES (v_role_id, v_perm_id) 
        ON CONFLICT DO NOTHING;
    END IF;
END $$;


INSERT INTO public.class_subjects (branch_id, class_id, subject_id, is_optional)
VALUES ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', 'aaaaaaaa-2222-2222-2222-222222222222', 'aaaaaaaa-4444-4444-4444-444444444444', false)
ON CONFLICT DO NOTHING;

-- Phase 5: Assign Teacher A to a Class and Section for E2E Tests
INSERT INTO public.teacher_subject_assignments (
  branch_id,
  academic_year_id,
  class_id,
  section_id,
  subject_id,
  staff_branch_profile_id,
  is_primary
)
SELECT 
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', 
  'aaaaaaaa-1111-1111-1111-111111111111', 
  'aaaaaaaa-2222-2222-2222-222222222222',
  'aaaaaaaa-3333-3333-3333-333333333333',
  'aaaaaaaa-4444-4444-4444-444444444444',
  sbp.id,
  true
FROM public.staff_branch_profiles sbp
WHERE sbp.staff_id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee22'
ON CONFLICT DO NOTHING;




﻿-- E2E Student and Guardian setup
INSERT INTO public.profiles (id, first_name, last_name)
SELECT id, 'Guardian', 'E2E' FROM auth.users WHERE email = 'guardian.e2e@test.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.guardians (id, organization_id, profile_id, first_name, last_name)
SELECT 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee50', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01', id, 'Guardian', 'E2E' FROM auth.users WHERE email = 'guardian.e2e@test.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.students (id, organization_id, first_name, last_name)
VALUES ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee51', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01', 'Student', 'E2E')
ON CONFLICT DO NOTHING;

INSERT INTO public.student_guardians (student_id, guardian_id, relationship)
VALUES ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee51', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee50', 'PARENT')
ON CONFLICT DO NOTHING;

INSERT INTO public.student_branch_profiles (id, student_id, branch_id)
VALUES ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee53', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee51', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02')
ON CONFLICT DO NOTHING;

INSERT INTO public.enrollments (id, organization_id, branch_id, student_id, student_branch_profile_id, academic_year_id, class_id, section_id, status)
VALUES ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee52', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee51', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee53', 'aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-2222-2222-2222-222222222222', 'aaaaaaaa-3333-3333-3333-333333333333', 'ACTIVE')
ON CONFLICT DO NOTHING;


-- ADDITIONAL TEACHERS FOR ISOLATED TESTS

INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change_token_new, email_change, is_super_admin, is_sso_user
) VALUES 
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeb03', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'teacher2.e2e@test.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{}', '', '', '', '', false, false),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeec03', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'teacher.limit.e2e@test.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{}', '', '', '', '', false, false),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeed04', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'reset.user@test.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{}', '', '', '', '', false, false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
) VALUES
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeb03', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeb03', 'teacher2.e2e@test.com', format('{"sub": "%s", "email": "%s"}', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeb03', 'teacher2.e2e@test.com')::jsonb, 'email', now(), now(), now()),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeec03', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeec03', 'teacher.limit.e2e@test.com', format('{"sub": "%s", "email": "%s"}', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeec03', 'teacher.limit.e2e@test.com')::jsonb, 'email', now(), now(), now()),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeed04', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeed04', 'reset.user@test.com', format('{"sub": "%s", "email": "%s"}', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeed04', 'reset.user@test.com')::jsonb, 'email', now(), now(), now())
ON CONFLICT (provider_id, provider) DO NOTHING;

INSERT INTO public.profiles (id, first_name, last_name)
SELECT id, 'Teacher', 'A2' FROM auth.users WHERE email = 'teacher2.e2e@test.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.profiles (id, first_name, last_name)
SELECT id, 'Teacher', 'Limit' FROM auth.users WHERE email = 'teacher.limit.e2e@test.com'
UNION ALL
SELECT id, 'Reset', 'User' FROM auth.users WHERE email = 'reset.user@test.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.staff (id, organization_id, profile_id, first_name, last_name)
SELECT 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeb22', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01', id, 'Teacher', 'A2' FROM auth.users WHERE email = 'teacher2.e2e@test.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.staff (id, organization_id, profile_id, first_name, last_name)
SELECT 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeec22', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01', id, 'Teacher', 'Limit' FROM auth.users WHERE email = 'teacher.limit.e2e@test.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.staff_branch_profiles (staff_id, branch_id)
SELECT id, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02' FROM public.staff WHERE id IN ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeb22', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeec22')
ON CONFLICT DO NOTHING;

INSERT INTO public.branch_memberships (id, branch_id, user_id)
SELECT 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeb41', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', id FROM auth.users WHERE email = 'teacher2.e2e@test.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.branch_memberships (id, branch_id, user_id)
SELECT 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeec41', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', id FROM auth.users WHERE email = 'teacher.limit.e2e@test.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.user_role_assignments (branch_membership_id, role_id)
SELECT id, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee31' FROM public.branch_memberships WHERE id IN ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeb41', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeec41')
ON CONFLICT DO NOTHING;

INSERT INTO public.organization_memberships (organization_id, user_id)
SELECT 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01', id FROM auth.users WHERE email IN ('teacher2.e2e@test.com', 'teacher.limit.e2e@test.com')
ON CONFLICT DO NOTHING;

-- Assign to class so they can send class announcements
INSERT INTO public.teacher_subject_assignments (
  branch_id, academic_year_id, class_id, section_id, subject_id, staff_branch_profile_id, is_primary
)
SELECT 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', 'aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-2222-2222-2222-222222222222', 'aaaaaaaa-3333-3333-3333-333333333333', 'aaaaaaaa-4444-4444-4444-444444444444', sbp.id, false
FROM public.staff_branch_profiles sbp 
WHERE sbp.staff_id IN ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeb22', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeec22')
ON CONFLICT DO NOTHING;
COMMIT;


-- Add user_credentials for reset user
INSERT INTO public.user_credentials (id, username, profile_id, role_id, branch_id, force_password_reset) VALUES ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeed04', 'resetuser', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeed04', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee31', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', true) ON CONFLICT DO NOTHING;
INSERT INTO public.branch_memberships (id, branch_id, user_id) VALUES ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeed04', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeed04') ON CONFLICT DO NOTHING;
INSERT INTO public.user_role_assignments (id, branch_membership_id, role_id) VALUES ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeed04', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeed04', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee31') ON CONFLICT DO NOTHING;

-- Fix missing role permissions for attendance
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee31', id FROM public.permissions WHERE name IN ('attendance.session.read', 'attendance.session.manage')
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee30', id FROM public.permissions WHERE name IN ('attendance.session.read', 'attendance.session.manage', 'attendance.session.publish', 'attendance.session.correct')
ON CONFLICT DO NOTHING;

-- Fix Teacher RLS locking bug
ALTER POLICY "Staff can update attendance_sessions" ON public.attendance_sessions
USING (
    public.auth_user_has_branch_permission(branch_id, 'attendance.session.manage') AND
    (locked_at IS NULL OR public.auth_user_has_branch_permission(branch_id, 'attendance.session.publish') OR public.auth_user_has_branch_permission(branch_id, 'attendance.session.correct'))
)
WITH CHECK (
    public.auth_user_has_branch_permission(branch_id, 'attendance.session.manage')
);



-- Give guardian an organization membership (required for roles RLS)
INSERT INTO public.organization_memberships (organization_id, user_id)
SELECT 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01', id FROM auth.users WHERE email = 'guardian.e2e@test.com'
ON CONFLICT DO NOTHING;

-- Give guardian a branch membership
INSERT INTO public.branch_memberships (id, branch_id, user_id)
SELECT 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee44', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', id FROM auth.users WHERE email = 'guardian.e2e@test.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.roles (id, organization_id, name) VALUES 
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee32', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01', 'guardian') ON CONFLICT DO NOTHING;

INSERT INTO public.user_role_assignments (branch_membership_id, role_id)
VALUES ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee44', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee32')
ON CONFLICT DO NOTHING;




-- Seed attendance session for Guardian test
INSERT INTO public.attendance_sessions (id, branch_id, section_id, academic_year_id, date, locked_at, published_at, published_by)
VALUES ('aaaaaaaa-4444-4444-4444-444444444444', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', 'aaaaaaaa-3333-3333-3333-333333333333', 'aaaaaaaa-1111-1111-1111-111111111111', '2026-08-10', now(), now(), 'eeeeeeee-eeee-eeee-eeee-eeeeeeeea002')
ON CONFLICT DO NOTHING;

INSERT INTO public.attendance_records (session_id, student_id, status, notes)
VALUES ('aaaaaaaa-4444-4444-4444-444444444444', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee51', 'ABSENT', 'Sick')
ON CONFLICT DO NOTHING;

-- Seed homework assignment for Student test
INSERT INTO public.homework_assignments (id, branch_id, academic_year_id, class_id, section_id, subject_id, author_profile_id, title, description, issue_at, due_at, max_marks, status, created_by, updated_by)
VALUES ('bbbbbbbb-5555-5555-5555-555555555555', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', 'aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-2222-2222-2222-222222222222', 'aaaaaaaa-3333-3333-3333-333333333333', 'aaaaaaaa-6666-6666-6666-666666666666', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeea002', 'E2E Seeded Homework', 'Please complete the assignment.', '2026-08-01', '2026-08-30', 100, 'PUBLISHED', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeea002', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeea002')
ON CONFLICT DO NOTHING;

