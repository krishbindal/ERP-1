BEGIN;

SELECT plan(22);

-- 1. Setup Mock Data
INSERT INTO organizations (id, name, status) VALUES 
('11111111-1111-1111-1111-111111111111', 'Test Org A', 'ACTIVE'), 
('22222222-2222-2222-2222-222222222222', 'Test Org B', 'ACTIVE');

INSERT INTO branches (id, organization_id, name, status) VALUES 
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Branch A1', 'ACTIVE'), 
('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Branch A2', 'ACTIVE'), 
('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'Branch B1', 'ACTIVE');

-- Auth Users and Profiles
INSERT INTO auth.users (id, email) VALUES 
('66666666-6666-6666-6666-666666666666', 'sa@test.com'), 
('77777777-7777-7777-7777-777777777777', 'a1@test.com'), 
('88888888-8888-8888-8888-888888888888', 'b1@test.com');

INSERT INTO profiles (id, first_name, last_name, status) VALUES 
('66666666-6666-6666-6666-666666666666', 'Super', 'Admin', 'ACTIVE'),
('77777777-7777-7777-7777-777777777777', 'User', 'A1', 'ACTIVE'),
('88888888-8888-8888-8888-888888888888', 'User', 'B1', 'ACTIVE');

-- Memberships
INSERT INTO organization_memberships (id, organization_id, user_id, status) VALUES 
('11111111-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'ACTIVE'),
('22222222-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', '77777777-7777-7777-7777-777777777777', 'ACTIVE'),
('33333333-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888888', 'ACTIVE');

INSERT INTO branch_memberships (id, branch_id, user_id, status) VALUES 
('11111111-1111-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', '77777777-7777-7777-7777-777777777777', 'ACTIVE'),
('22222222-2222-0000-0000-000000000000', '55555555-5555-5555-5555-555555555555', '88888888-8888-8888-8888-888888888888', 'ACTIVE');

INSERT INTO public.roles (id, organization_id, name) VALUES 
('00000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'Branch Admin'),
('00000000-0000-0000-0000-000000000005', '22222222-2222-2222-2222-222222222222', 'Branch Admin');

INSERT INTO public.user_role_assignments (branch_membership_id, role_id) VALUES 
('11111111-1111-0000-0000-000000000000', '00000000-0000-0000-0000-000000000004'),
('22222222-2222-0000-0000-000000000000', '00000000-0000-0000-0000-000000000005');

-- Phase 3A Mock Data: Students, Guardians, Enrollments
INSERT INTO students (id, organization_id, first_name, last_name, status) VALUES
('aaaaaaaa-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'Student', 'A1', 'ACTIVE'),
('bbbbbbbb-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'Student', 'B1', 'ACTIVE');

INSERT INTO student_branch_profiles (id, student_id, branch_id) VALUES
('aaaaaaaa-1111-2222-3333-000000000000', 'aaaaaaaa-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333'),
('bbbbbbbb-1111-2222-3333-000000000000', 'bbbbbbbb-0000-0000-0000-000000000000', '55555555-5555-5555-5555-555555555555');

INSERT INTO academic_years (id, branch_id, name, start_date, end_date) VALUES 
('aaaaaaaa-4444-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'Year A', '2026-01-01', '2026-12-31'),
('bbbbbbbb-4444-0000-0000-000000000000', '55555555-5555-5555-5555-555555555555', 'Year B', '2026-01-01', '2026-12-31');

INSERT INTO classes (id, academic_year_id, branch_id, name, level) VALUES 
('aaaaaaaa-5555-0000-0000-000000000000', 'aaaaaaaa-4444-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'Class A', 1),
('bbbbbbbb-5555-0000-0000-000000000000', 'bbbbbbbb-4444-0000-0000-000000000000', '55555555-5555-5555-5555-555555555555', 'Class B', 1);

INSERT INTO sections (id, class_id, academic_year_id, branch_id, name) VALUES 
('aaaaaaaa-6666-0000-0000-000000000000', 'aaaaaaaa-5555-0000-0000-000000000000', 'aaaaaaaa-4444-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'Section A'),
('bbbbbbbb-6666-0000-0000-000000000000', 'bbbbbbbb-5555-0000-0000-000000000000', 'bbbbbbbb-4444-0000-0000-000000000000', '55555555-5555-5555-5555-555555555555', 'Section B');

INSERT INTO enrollments (id, organization_id, branch_id, student_id, student_branch_profile_id, academic_year_id, class_id, section_id, status) VALUES
('aaaaaaaa-1111-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-0000-0000-0000-000000000000', 'aaaaaaaa-1111-2222-3333-000000000000', 'aaaaaaaa-4444-0000-0000-000000000000', 'aaaaaaaa-5555-0000-0000-000000000000', 'aaaaaaaa-6666-0000-0000-000000000000', 'ACTIVE'),
('bbbbbbbb-1111-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 'bbbbbbbb-0000-0000-0000-000000000000', 'bbbbbbbb-1111-2222-3333-000000000000', 'bbbbbbbb-4444-0000-0000-000000000000', 'bbbbbbbb-5555-0000-0000-000000000000', 'bbbbbbbb-6666-0000-0000-000000000000', 'ACTIVE');

INSERT INTO guardians (id, organization_id, first_name, last_name, status) VALUES
('aaaaaaaa-2222-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'Guardian', 'A1', 'ACTIVE'),
('bbbbbbbb-2222-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'Guardian', 'B1', 'ACTIVE'),
('cccccccc-2222-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'UnlinkedGuardian', 'A2', 'ACTIVE');

INSERT INTO student_guardians (id, student_id, guardian_id, relationship) VALUES
('aaaaaaaa-3333-0000-0000-000000000000', 'aaaaaaaa-0000-0000-0000-000000000000', 'aaaaaaaa-2222-0000-0000-000000000000', 'Father'),
('bbbbbbbb-3333-0000-0000-000000000000', 'bbbbbbbb-0000-0000-0000-000000000000', 'bbbbbbbb-2222-0000-0000-000000000000', 'Mother');


-- Start Tests as Authenticated
SET ROLE authenticated;

-- Branch Admin A1 Testing
SELECT set_config('request.jwt.claims', '{"sub":"77777777-7777-7777-7777-777777777777"}', true);

SELECT results_eq('SELECT id FROM students', ARRAY['aaaaaaaa-0000-0000-0000-000000000000'::uuid], '1. Branch A admin can see Branch A student');
SELECT is_empty('SELECT id FROM students WHERE id = ''bbbbbbbb-0000-0000-0000-000000000000''', '2. Branch A admin cannot see Branch B student');

SELECT results_eq('SELECT id FROM guardians', ARRAY['aaaaaaaa-2222-0000-0000-000000000000'::uuid], '3. Branch A admin can see linked Guardian A1');
SELECT is_empty('SELECT id FROM guardians WHERE id = ''cccccccc-2222-0000-0000-000000000000''', '4. Branch A admin cannot see unlinked Guardian A2 even in same Org');

SELECT results_eq('SELECT id FROM enrollments', ARRAY['aaaaaaaa-1111-0000-0000-000000000000'::uuid], '5. Branch A admin can see Branch A enrollments');

-- Branch Admin B1 Testing
SELECT set_config('request.jwt.claims', '{"sub":"88888888-8888-8888-8888-888888888888"}', true);
SELECT results_eq('SELECT id FROM students', ARRAY['bbbbbbbb-0000-0000-0000-000000000000'::uuid], '6. Branch B admin can see Branch B student');
SELECT is_empty('SELECT id FROM students WHERE id = ''aaaaaaaa-0000-0000-0000-000000000000''', '7. Branch B admin cannot see Branch A student');

-- Super Admin A Testing
SELECT set_config('request.jwt.claims', '{"sub":"66666666-6666-6666-6666-666666666666", "app_metadata": {"is_super_admin": true}}', true);
SELECT results_eq('SELECT id FROM students', ARRAY['aaaaaaaa-0000-0000-0000-000000000000'::uuid], '8. Super Admin A can see Org A student');
SELECT is_empty('SELECT id FROM students WHERE id = ''bbbbbbbb-0000-0000-0000-000000000000''', '9. Super Admin A cannot see Org B student');

-- Unauthenticated or No Membership
SELECT set_config('request.jwt.claims', '{"sub":"cccccccc-cccc-cccc-cccc-cccccccccccc"}', true);
SELECT is_empty('SELECT id FROM students', '10. Unrelated user cannot see any students');

-- Ownership Tampering
SELECT set_config('request.jwt.claims', '{"sub":"77777777-7777-7777-7777-777777777777"}', true);

SELECT throws_ok(
    'INSERT INTO students (organization_id, first_name, last_name) VALUES (''22222222-2222-2222-2222-222222222222'', ''Hacker'', ''Student'')',
    '42501', 'new row violates row-level security policy for table "students"', '11. Cannot insert student into unauthorized organization'
);

SELECT throws_ok(
    'INSERT INTO student_guardians (student_id, guardian_id, relationship) VALUES (''aaaaaaaa-0000-0000-0000-000000000000'', ''bbbbbbbb-2222-0000-0000-000000000000'', ''Hacker'')',
    '42501', 'new row violates row-level security policy for table "student_guardians"', '12. Cannot link student to cross-org guardian'
);

-- Duplicate relationship test
SELECT throws_ok(
    'INSERT INTO student_guardians (student_id, guardian_id, relationship) VALUES (''aaaaaaaa-0000-0000-0000-000000000000'', ''aaaaaaaa-2222-0000-0000-000000000000'', ''Father2'')',
    '23505', NULL, '13. Duplicate relationship identical links DENY'
);

-- Placement creation for unauthorized branch
SELECT throws_ok(
    'INSERT INTO enrollments (organization_id, branch_id, student_id, student_branch_profile_id, academic_year_id, class_id, section_id) VALUES (''11111111-1111-1111-1111-111111111111'', ''44444444-4444-4444-4444-444444444444'', ''aaaaaaaa-0000-0000-0000-000000000000'', ''aaaaaaaa-1111-2222-3333-000000000000'', ''aaaaaaaa-4444-0000-0000-000000000000'', ''aaaaaaaa-5555-0000-0000-000000000000'', ''aaaaaaaa-6666-0000-0000-000000000000'')',
    'P0001', 'enrollment branch_id contradicts the profile branch_id', '14. Cannot create placement in unauthorized branch (A1 user -> A2 branch)'
);

-- Organization change test
SELECT throws_ok(
    'UPDATE students SET organization_id = ''22222222-2222-2222-2222-222222222222'' WHERE id = ''aaaaaaaa-0000-0000-0000-000000000000''',
    '23503', NULL, '15. Cannot change organization_id on students (FK prevents changing organization_id before RLS)'
);

-- Placement ownership modification
SELECT throws_ok(
    'UPDATE enrollments SET branch_id = ''55555555-5555-5555-5555-555555555555'' WHERE id = ''aaaaaaaa-1111-0000-0000-000000000000''',
    'P0001', 'branch_id cannot be modified after creation', '16. Cannot modify placement branch to unauthorized branch'
);

-- Structural RLS Checks
SELECT policies_are('students', ARRAY['Super Admins can manage students', 'Branch members can view students placed in their branches', 'Branch Admins can insert students', 'Branch Admins can update students', 'Guardians can view their linked students', 'Students can view their own record'], '17. Students table policies are structurally correct');
SELECT policies_are('guardians', ARRAY['Super Admins can manage guardians', 'Branch members can view guardians linked to visible students', 'Branch Admins can insert guardians', 'Branch Admins can update guardians', 'Students can view their linked guardians', 'Guardians can view their own record'], '18. Guardians table policies are structurally correct');
SELECT policies_are('student_guardians', ARRAY['Super Admins can manage student_guardians', 'Branch members can view student_guardians linked to visible students', 'Branch Admins can insert student_guardians', 'Branch Admins can update student_guardians'], '19. StudentGuardians table policies are structurally correct');
SELECT policies_are('enrollments', ARRAY['Super Admins can manage enrollments', 'Branch members can view enrollments in their branches', 'Branch Admins can insert enrollments', 'Branch Admins can update enrollments'], '20. Enrollments table policies are structurally correct');

-- Atomic creation function tests
SELECT throws_ok(
    $$ SELECT create_student_with_initial_placement('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'New', 'Student') $$,
    'P0001', NULL, '21. Atomic function respects RLS (fails on unauthorized branch)'
);

SELECT lives_ok(
    $$ SELECT create_student_with_initial_placement('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'New', 'Student') $$,
    '22. Atomic function succeeds on authorized branch'
);

SELECT * FROM finish();
ROLLBACK;


