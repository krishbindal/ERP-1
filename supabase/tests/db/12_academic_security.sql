BEGIN;

SELECT plan(24);

-- ==========================================
-- 1. STRUCTURAL FUNCTION SECURITY TESTS
-- ==========================================

SELECT has_function('public', 'auth_is_branch_admin', ARRAY['uuid']);
SELECT function_privs_are('public', 'auth_is_branch_admin', ARRAY['uuid'], 'public', ARRAY[]::text[], 'PUBLIC should not have EXECUTE on auth_is_branch_admin');
SELECT function_privs_are('public', 'auth_is_branch_admin', ARRAY['uuid'], 'authenticated', ARRAY['EXECUTE'], 'authenticated should have EXECUTE on auth_is_branch_admin');
SELECT is_definer('public', 'auth_is_branch_admin', ARRAY['uuid'], 'auth_is_branch_admin must be SECURITY DEFINER');

SELECT has_function('public', 'auth_is_super_admin_for_org', ARRAY['uuid']);
SELECT function_privs_are('public', 'auth_is_super_admin_for_org', ARRAY['uuid'], 'public', ARRAY[]::text[], 'PUBLIC should not have EXECUTE on auth_is_super_admin_for_org');
SELECT function_privs_are('public', 'auth_is_super_admin_for_org', ARRAY['uuid'], 'authenticated', ARRAY['EXECUTE'], 'authenticated should have EXECUTE on auth_is_super_admin_for_org');
SELECT is_definer('public', 'auth_is_super_admin_for_org', ARRAY['uuid'], 'auth_is_super_admin_for_org must be SECURITY DEFINER');

SELECT has_function('public', 'get_branch_org', ARRAY['uuid']);
SELECT function_privs_are('public', 'get_branch_org', ARRAY['uuid'], 'public', ARRAY[]::text[], 'PUBLIC should not have EXECUTE on get_branch_org');
SELECT function_privs_are('public', 'get_branch_org', ARRAY['uuid'], 'authenticated', ARRAY['EXECUTE'], 'authenticated should have EXECUTE on get_branch_org');
SELECT is_definer('public', 'get_branch_org', ARRAY['uuid'], 'get_branch_org must be SECURITY DEFINER');


-- ==========================================
-- 2. SETUP TEST DATA
-- ==========================================

-- Create an organization
INSERT INTO public.organizations (id, name) VALUES ('00000000-0000-0000-0000-000000000001', 'Test Org');
-- Create branches
INSERT INTO public.branches (id, organization_id, name, timezone) VALUES 
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Test Branch 1', 'UTC'),
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Test Branch 2', 'UTC');

-- Create Roles
INSERT INTO public.roles (id, organization_id, name) VALUES 
('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Branch Admin');

-- Create Users
INSERT INTO auth.users (id, email) VALUES 
('00000000-0000-0000-0001-000000000001', 'super@test.com'),
('00000000-0000-0000-0001-000000000002', 'admin1@test.com'),
('00000000-0000-0000-0001-000000000003', 'teacher1@test.com'),
('00000000-0000-0000-0001-000000000004', 'student1@test.com'),
('00000000-0000-0000-0001-000000000005', 'crossadmin@test.com');

-- Create Profiles (Staff) for Super, Admin1, Teacher1, CrossAdmin
INSERT INTO public.profiles (id, first_name, last_name) VALUES 
('00000000-0000-0000-0001-000000000001', 'Super', 'Admin'),
('00000000-0000-0000-0001-000000000002', 'Branch', 'Admin'),
('00000000-0000-0000-0001-000000000003', 'Regular', 'Teacher'),
('00000000-0000-0000-0001-000000000005', 'Cross', 'Admin');

INSERT INTO public.staff (id, organization_id, profile_id, first_name, last_name) VALUES 
('00000000-0000-0000-0000-000000006001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000001', 'Super', 'Admin'),
('00000000-0000-0000-0000-000000006002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000002', 'Branch', 'Admin'),
('00000000-0000-0000-0000-000000006003', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000003', 'Regular', 'Teacher'),
('00000000-0000-0000-0000-000000006005', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000005', 'Cross', 'Admin');

INSERT INTO public.staff_branch_profiles (id, staff_id, branch_id, employee_id_local, status) VALUES 
('00000000-0000-0000-0000-000000007001', '00000000-0000-0000-0000-000000006001', '00000000-0000-0000-0000-000000000002', 'EMP001', 'ACTIVE'),
('00000000-0000-0000-0000-000000007002', '00000000-0000-0000-0000-000000006002', '00000000-0000-0000-0000-000000000002', 'EMP002', 'ACTIVE'),
('00000000-0000-0000-0000-000000007003', '00000000-0000-0000-0000-000000006003', '00000000-0000-0000-0000-000000000002', 'EMP003', 'ACTIVE'),
('00000000-0000-0000-0000-000000007005', '00000000-0000-0000-0000-000000006005', '00000000-0000-0000-0000-000000000003', 'EMP005', 'ACTIVE');

-- Org Memberships
INSERT INTO public.organization_memberships (organization_id, user_id) VALUES 
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000001'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000002'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000003'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000004'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000005');

-- Branch Memberships
INSERT INTO public.branch_memberships (id, branch_id, user_id, status) VALUES 
('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0001-000000000001', 'ACTIVE'),
('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0001-000000000002', 'ACTIVE'),
('00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0001-000000000003', 'ACTIVE'),
('00000000-0000-0000-0002-000000000004', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0001-000000000004', 'ACTIVE'),
('00000000-0000-0000-0002-000000000005', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0001-000000000005', 'ACTIVE'); -- cross admin in branch 2

-- Role Assignments
-- Admin1 is Branch Admin in Branch 1
INSERT INTO public.user_role_assignments (branch_membership_id, role_id) VALUES 
('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000004');
-- CrossAdmin is Branch Admin in Branch 2
INSERT INTO public.user_role_assignments (branch_membership_id, role_id) VALUES 
('00000000-0000-0000-0002-000000000005', '00000000-0000-0000-0000-000000000004');

-- Base Record to Test UPDATE/DELETE
INSERT INTO public.academic_years (id, branch_id, name, start_date, end_date) VALUES 
('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0000-000000000002', 'Test Year 2026', '2026-01-01', '2026-12-31');

-- ==========================================
-- 3. HELPER FUNCTION FOR DATA-DRIVEN TESTS
-- ==========================================

CREATE OR REPLACE FUNCTION pg_temp.set_auth(p_user_id uuid, p_is_super boolean DEFAULT false)
RETURNS void AS $$
BEGIN
    PERFORM set_config('role', 'authenticated', true);
    PERFORM set_config('request.jwt.claims', 
        json_build_object(
            'sub', p_user_id::text,
            'app_metadata', json_build_object('is_super_admin', p_is_super)
        )::text, true);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION pg_temp.test_academic_write(
    p_user_id uuid, 
    p_is_super boolean, 
    p_role_desc text, 
    p_expect_success boolean
) RETURNS SETOF text AS $$
BEGIN
    PERFORM pg_temp.set_auth(p_user_id, p_is_super);
    
    IF p_expect_success THEN
        -- Test INSERT
        RETURN NEXT lives_ok(
            format('INSERT INTO public.academic_years (branch_id, name, start_date, end_date) VALUES (''00000000-0000-0000-0000-000000000002'', ''New Year %s'', ''2027-01-01'', ''2027-12-31'')', p_user_id),
            format('%s can INSERT academic_years', p_role_desc)
        );
        -- Test UPDATE
        RETURN NEXT lives_ok(
            'UPDATE public.academic_years SET name = ''Updated'' WHERE id = ''00000000-0000-0000-0003-000000000001''',
            format('%s can UPDATE academic_years', p_role_desc)
        );
        -- Test DELETE
        RETURN NEXT lives_ok(
            format('DELETE FROM public.academic_years WHERE name = ''New Year %s''', p_user_id),
            format('%s can DELETE academic_years', p_role_desc)
        );
    ELSE
        -- Test INSERT
        RETURN NEXT throws_ok(
            'INSERT INTO public.academic_years (branch_id, name, start_date, end_date) VALUES (''00000000-0000-0000-0000-000000000002'', ''Fail Year'', ''2027-01-01'', ''2027-12-31'')',
            'new row violates row-level security policy for table "academic_years"',
            format('%s cannot INSERT academic_years', p_role_desc)
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Super Admin
SELECT pg_temp.test_academic_write('00000000-0000-0000-0001-000000000001', true, 'Super Admin', true);
-- Branch Admin
SELECT pg_temp.test_academic_write('00000000-0000-0000-0001-000000000002', false, 'Branch Admin', true);
-- Teacher
SELECT pg_temp.test_academic_write('00000000-0000-0000-0001-000000000003', false, 'Teacher', false);
-- Ordinary Member
SELECT pg_temp.test_academic_write('00000000-0000-0000-0001-000000000004', false, 'Ordinary Member', false);
-- Cross Admin (Admin in Branch 2, trying to insert in Branch 1)
SELECT pg_temp.test_academic_write('00000000-0000-0000-0001-000000000005', false, 'Cross Branch Admin', false);

-- Explicitly test UPDATE denial for Teacher
SELECT pg_temp.set_auth('00000000-0000-0000-0001-000000000001', true);
UPDATE public.academic_years SET name = 'Test Year 2026' WHERE id = '00000000-0000-0000-0003-000000000001';

SELECT pg_temp.set_auth('00000000-0000-0000-0001-000000000003', false);
UPDATE public.academic_years SET name = 'Teacher Update' WHERE id = '00000000-0000-0000-0003-000000000001';
SELECT is(
    (SELECT name FROM public.academic_years WHERE id = '00000000-0000-0000-0003-000000000001'),
    'Test Year 2026',
    'Teacher UPDATE on academic_years affects 0 rows due to RLS'
);

-- ==========================================
-- 4. VALIDATE TIMEZONE TRIGGER
-- ==========================================
SELECT pg_temp.set_auth('00000000-0000-0000-0001-000000000001', true);
SELECT lives_ok(
    'INSERT INTO public.branches (organization_id, name, timezone) VALUES (''00000000-0000-0000-0000-000000000001'', ''Valid TZ Branch'', ''Asia/Kolkata'')',
    'Can insert branch with valid IANA timezone'
);
SELECT throws_ok(
    'INSERT INTO public.branches (organization_id, name, timezone) VALUES (''00000000-0000-0000-0000-000000000001'', ''Invalid TZ Branch'', ''Fake/Timezone'')',
    'P0001',
    'Invalid timezone: Fake/Timezone',
    'Cannot insert branch with invalid timezone'
);

SELECT * FROM finish();
ROLLBACK;
