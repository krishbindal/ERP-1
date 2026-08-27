
BEGIN;

SELECT plan(14);

-- 1. Setup Mock Data
INSERT INTO public.organizations (id, name, status) VALUES 
('11111111-1111-1111-1111-111111111111', 'Test Org A', 'ACTIVE');

INSERT INTO public.branches (id, organization_id, name, status, timezone) VALUES 
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Branch A1', 'ACTIVE', 'UTC');

-- Auth Users and Profiles
INSERT INTO auth.users (id, email) VALUES 
('66666666-6666-6666-6666-666666666666', 'sa@test.com'), 
('77777777-7777-7777-7777-777777777777', 'teacher@test.com'), 
('88888888-8888-8888-8888-888888888888', 'student@test.com'),
('99999999-9999-9999-9999-999999999999', 'parent@test.com');

INSERT INTO public.profiles (id, first_name, last_name, status) VALUES 
('66666666-6666-6666-6666-666666666666', 'Super', 'Admin', 'ACTIVE'),
('77777777-7777-7777-7777-777777777777', 'Teacher', 'A', 'ACTIVE'),
('88888888-8888-8888-8888-888888888888', 'Student', 'A', 'ACTIVE'),
('99999999-9999-9999-9999-999999999999', 'Parent', 'A', 'ACTIVE');

-- Memberships for Teacher
INSERT INTO public.organization_memberships (id, organization_id, user_id, status) VALUES 
('11111111-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', '77777777-7777-7777-7777-777777777777', 'ACTIVE');

INSERT INTO public.branch_memberships (id, branch_id, user_id, status) VALUES 
('11111111-1111-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', '77777777-7777-7777-7777-777777777777', 'ACTIVE');

-- Roles
INSERT INTO public.roles (id, organization_id, name, slug) VALUES 
('00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Teacher Role', 'teacher');

-- The permissions should already be seeded by earlier migrations. We just link them.
INSERT INTO public.role_permissions (role_id, permission_id) 
SELECT '00000000-0000-0000-0000-000000000001', id FROM public.permissions WHERE name IN ('attendance.session.read', 'attendance.session.manage', 'attendance.session.publish');

INSERT INTO public.user_role_assignments (branch_membership_id, role_id) VALUES 
('11111111-1111-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001');

-- Students, Guardians, Enrollments
INSERT INTO public.students (id, organization_id, profile_id, first_name, last_name, status) VALUES
('aaaaaaaa-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', '88888888-8888-8888-8888-888888888888', 'Student', 'A1', 'ACTIVE');

INSERT INTO public.guardians (id, organization_id, profile_id, first_name, last_name, status) VALUES
('aaaaaaaa-2222-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999999', 'Guardian', 'A1', 'ACTIVE');

INSERT INTO public.student_guardians (id, student_id, guardian_id, relationship, is_primary, is_emergency_contact) VALUES
('aaaaaaaa-3333-0000-0000-000000000000', 'aaaaaaaa-0000-0000-0000-000000000000', 'aaaaaaaa-2222-0000-0000-000000000000', 'FATHER', true, true);

INSERT INTO public.student_branch_profiles (id, student_id, branch_id) VALUES
('aaaaaaaa-1111-2222-3333-000000000000', 'aaaaaaaa-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333');

INSERT INTO public.academic_years (id, branch_id, name, start_date, end_date, operating_days) VALUES 
('aaaaaaaa-4444-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'Year A', '2026-01-01', '2026-12-31', '{1,2,3,4,5}');

INSERT INTO public.classes (id, academic_year_id, branch_id, name, level) VALUES 
('aaaaaaaa-5555-0000-0000-000000000000', 'aaaaaaaa-4444-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'Class A', 1);

INSERT INTO public.sections (id, class_id, academic_year_id, branch_id, name) VALUES 
('aaaaaaaa-6666-0000-0000-000000000000', 'aaaaaaaa-5555-0000-0000-000000000000', 'aaaaaaaa-4444-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'Section A');

INSERT INTO public.enrollments (id, organization_id, branch_id, student_id, student_branch_profile_id, academic_year_id, class_id, section_id, status) VALUES
('aaaaaaaa-1111-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-0000-0000-0000-000000000000', 'aaaaaaaa-1111-2222-3333-000000000000', 'aaaaaaaa-4444-0000-0000-000000000000', 'aaaaaaaa-5555-0000-0000-000000000000', 'aaaaaaaa-6666-0000-0000-000000000000', 'ACTIVE');


-- Create an unpublished attendance session directly
INSERT INTO public.attendance_sessions (id, branch_id, academic_year_id, section_id, date) VALUES
('dddddddd-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-4444-0000-0000-000000000000', 'aaaaaaaa-6666-0000-0000-000000000000', '2026-08-01');

INSERT INTO public.attendance_records (id, session_id, student_id, status) VALUES
('eeeeeeee-0000-0000-0000-000000000000', 'dddddddd-0000-0000-0000-000000000000', 'aaaaaaaa-0000-0000-0000-000000000000', 'PRESENT');


-- Create a PUBLISHED attendance session
INSERT INTO public.attendance_sessions (id, branch_id, academic_year_id, section_id, date, published_at) VALUES
('ffffffff-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-4444-0000-0000-000000000000', 'aaaaaaaa-6666-0000-0000-000000000000', '2026-08-02', '2026-08-02 10:00:00+00');

INSERT INTO public.attendance_records (id, session_id, student_id, status) VALUES
('11111111-aaaa-0000-0000-000000000000', 'ffffffff-0000-0000-0000-000000000000', 'aaaaaaaa-0000-0000-0000-000000000000', 'ABSENT');


-- Tests as Student
SET ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"88888888-8888-8888-8888-888888888888"}', true);

SELECT is(
    (SELECT count(*) FROM public.attendance_sessions),
    1::bigint,
    'Student can only see published sessions'
);

SELECT is(
    (SELECT count(*) FROM public.attendance_records),
    1::bigint,
    'Student can only see published records for themselves'
);

SELECT results_eq(
    'SELECT status FROM public.attendance_records',
    $$VALUES ('ABSENT'::public.attendance_status)$$,
    'Student sees their absent record'
);

-- Tests as Parent
SET ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"99999999-9999-9999-9999-999999999999"}', true);

SELECT is(
    (SELECT count(*) FROM public.attendance_sessions),
    1::bigint,
    'Parent can only see published sessions'
);

SELECT is(
    (SELECT count(*) FROM public.attendance_records),
    1::bigint,
    'Parent can only see published records for their child'
);

SELECT results_eq(
    'SELECT status FROM public.attendance_records',
    $$VALUES ('ABSENT'::public.attendance_status)$$,
    'Parent sees their child absent record'
);

-- Tests as Teacher
SET ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"77777777-7777-7777-7777-777777777777"}', true);

SELECT is(
    (SELECT count(*) FROM public.attendance_sessions),
    2::bigint,
    'Teacher can see all sessions (published and unpublished)'
);

SELECT is(
    (SELECT count(*) FROM public.attendance_records),
    2::bigint,
    'Teacher can see all records'
);

-- Test Teacher inserting attendance via RPC
SELECT lives_ok(
    $$SELECT public.rpc_save_attendance(
        '33333333-3333-3333-3333-333333333333'::uuid, 
        'aaaaaaaa-4444-0000-0000-000000000000'::uuid, 
        'aaaaaaaa-6666-0000-0000-000000000000'::uuid, 
        '2026-08-03', 
        '[{"student_id": "aaaaaaaa-0000-0000-0000-000000000000", "status": "LATE"}]'::jsonb
    )$$,
    'Teacher can successfully use rpc_save_attendance'
);

SELECT is(
    (SELECT count(*) FROM public.attendance_sessions),
    3::bigint,
    'Session was created by RPC'
);

-- Security: Student cannot call RPC
SET ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"88888888-8888-8888-8888-888888888888"}', true);

SELECT throws_ok(
    $$SELECT public.rpc_save_attendance(
        '33333333-3333-3333-3333-333333333333'::uuid, 
        'aaaaaaaa-4444-0000-0000-000000000000'::uuid, 
        'aaaaaaaa-6666-0000-0000-000000000000'::uuid, 
        '2026-08-04', 
        '[{"student_id": "aaaaaaaa-0000-0000-0000-000000000000", "status": "LATE"}]'::jsonb
    )$$,
    'P0001',
    'Not authorized to manage attendance in this branch',
    'Student is denied by RPC permission check'
);

-- Security: Student cannot insert directly via SQL
SELECT throws_ok(
    $$INSERT INTO public.attendance_sessions (branch_id, academic_year_id, section_id, date) VALUES ('33333333-3333-3333-3333-333333333333', 'aaaaaaaa-4444-0000-0000-000000000000', 'aaaaaaaa-6666-0000-0000-000000000000', '2026-08-05')$$,
    '42501',
    'new row violates row-level security policy for table "attendance_sessions"',
    'Student is denied direct INSERT by RLS'
);

-- Additional RPC checks
SET ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"77777777-7777-7777-7777-777777777777"}', true);

SELECT throws_ok(
    $$SELECT public.rpc_save_attendance(
        '33333333-3333-3333-3333-333333333333'::uuid, 
        'aaaaaaaa-4444-0000-0000-000000000000'::uuid, 
        'aaaaaaaa-6666-0000-0000-000000000000'::uuid, 
        '2026-08-04', 
        '[{"student_id": "99999999-9999-9999-9999-999999999999", "status": "LATE"}]'::jsonb
    )$$,
    'P0001',
    'One or more students are not enrolled in the specified section and branch',
    'RPC prevents inserting attendance for unenrolled student'
);

SELECT throws_ok(
    $$SELECT public.rpc_save_attendance(
        '33333333-3333-3333-3333-333333333333'::uuid, 
        'aaaaaaaa-4444-0000-0000-000000000000'::uuid, 
        'aaaaaaaa-6666-0000-0000-000000000000'::uuid, 
        '2026-12-26', -- Assuming Saturday or Sunday or something
        '[]'::jsonb
    )$$,
    'P0001',
    'Cannot record attendance on a non-instructional day',
    'RPC validates calendar instructional days (assume standard weekend block)'
);

SELECT * FROM finish();
ROLLBACK;
