BEGIN;

SELECT plan(31);

-- ==========================================
-- 1. Setup & Context
-- ==========================================
WITH 
  orgs (id, name) AS (VALUES 
    ('00000000-0000-0000-0000-000000000001'::uuid, 'Org 1'),
    ('00000000-0000-0000-0000-000000000002'::uuid, 'Org 2')
  ),
  ins_orgs AS (
    INSERT INTO public.organizations (id, name) 
    SELECT * FROM orgs 
    RETURNING id
  ),
  branches (id, organization_id, name) AS (VALUES 
    ('00000000-0000-0000-0000-000000000011'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Branch A'),
    ('00000000-0000-0000-0000-000000000012'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Branch B'),
    ('00000000-0000-0000-0000-000000000013'::uuid, '00000000-0000-0000-0000-000000000002'::uuid, 'Branch C')
  ),
  ins_branches AS (
    INSERT INTO public.branches (id, organization_id, name) 
    SELECT * FROM branches 
    RETURNING id
  ),
  acad_years (id, branch_id, name, start_date, end_date) AS (VALUES 
    ('00000000-0000-0000-0000-000000000101'::uuid, '00000000-0000-0000-0000-000000000011'::uuid, '2026-A', '2026-01-01'::date, '2026-12-31'::date),
    ('00000000-0000-0000-0000-000000000102'::uuid, '00000000-0000-0000-0000-000000000012'::uuid, '2026-B', '2026-01-01'::date, '2026-12-31'::date),
    ('00000000-0000-0000-0000-000000000103'::uuid, '00000000-0000-0000-0000-000000000013'::uuid, '2026-C', '2026-01-01'::date, '2026-12-31'::date)
  ),
  ins_years AS (
    INSERT INTO public.academic_years (id, branch_id, name, start_date, end_date) 
    SELECT * FROM acad_years 
    RETURNING id
  ),
  cls (id, academic_year_id, branch_id, name, level) AS (VALUES 
    ('00000000-0000-0000-0000-000000001001'::uuid, '00000000-0000-0000-0000-000000000101'::uuid, '00000000-0000-0000-0000-000000000011'::uuid, 'Class 1-A', 1),
    ('00000000-0000-0000-0000-000000001002'::uuid, '00000000-0000-0000-0000-000000000102'::uuid, '00000000-0000-0000-0000-000000000012'::uuid, 'Class 1-B', 1),
    ('00000000-0000-0000-0000-000000001003'::uuid, '00000000-0000-0000-0000-000000000103'::uuid, '00000000-0000-0000-0000-000000000013'::uuid, 'Class 1-C', 1)
  ),
  ins_cls AS (
    INSERT INTO public.classes (id, academic_year_id, branch_id, name, level) 
    SELECT * FROM cls 
    RETURNING id
  ),
  secs (id, class_id, academic_year_id, branch_id, name) AS (VALUES 
    ('00000000-0000-0000-0000-000000002001'::uuid, '00000000-0000-0000-0000-000000001001'::uuid, '00000000-0000-0000-0000-000000000101'::uuid, '00000000-0000-0000-0000-000000000011'::uuid, 'Sec A-1'),
    ('00000000-0000-0000-0000-000000002002'::uuid, '00000000-0000-0000-0000-000000001002'::uuid, '00000000-0000-0000-0000-000000000102'::uuid, '00000000-0000-0000-0000-000000000012'::uuid, 'Sec B-1'),
    ('00000000-0000-0000-0000-000000002003'::uuid, '00000000-0000-0000-0000-000000001003'::uuid, '00000000-0000-0000-0000-000000000103'::uuid, '00000000-0000-0000-0000-000000000013'::uuid, 'Sec C-1')
  ),
  ins_secs AS (
    INSERT INTO public.sections (id, class_id, academic_year_id, branch_id, name) 
    SELECT * FROM secs 
    RETURNING id
  ),
  a_users (id, email, is_super_admin) AS (VALUES 
    ('00000000-0000-0000-0000-000000000003'::uuid, 'branch_admin_both@test.com', false),
    ('00000000-0000-0000-0000-000000000004'::uuid, 'branch_admin_one@test.com', false),
    ('00000000-0000-0000-0000-000000000007'::uuid, 'superadmin@test.com', true),
    ('00000000-0000-0000-0000-000000000005'::uuid, 'branch_admin_dest@test.com', false),
    ('00000000-0000-0000-0000-000000000006'::uuid, 'teacher@test.com', false),
    ('00000000-0000-0000-0000-000000000008'::uuid, 'superadmin2@test.com', true),
    ('00000000-0000-0000-0000-000000000009'::uuid, 'inactive_admin@test.com', false)

  ),
  ins_a_users AS (
    INSERT INTO auth.users (id, email, raw_app_meta_data)
    SELECT id, email, jsonb_build_object('is_super_admin', is_super_admin) FROM a_users
    RETURNING id
  ),
  profs (id, first_name, last_name) AS (VALUES 
    ('00000000-0000-0000-0000-000000000003'::uuid, 'Admin', 'Both'),
    ('00000000-0000-0000-0000-000000000004'::uuid, 'Admin', 'One'),
    ('00000000-0000-0000-0000-000000000007'::uuid, 'Super', 'Admin'),
    ('00000000-0000-0000-0000-000000000005'::uuid, 'Admin', 'Dest'),
    ('00000000-0000-0000-0000-000000000006'::uuid, 'Teacher', 'One'),
    ('00000000-0000-0000-0000-000000000008'::uuid, 'Super', 'Admin2'),
    ('00000000-0000-0000-0000-000000000009'::uuid, 'Inactive', 'Admin')

  ),
  ins_profs AS (
    INSERT INTO public.profiles (id, first_name, last_name)
    SELECT * FROM profs
    RETURNING id
  ),
  o_mems (id, organization_id, user_id) AS (VALUES 
    ('00000000-0000-0000-0000-000000000003'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000003'::uuid),
    ('00000000-0000-0000-0000-000000000004'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000004'::uuid),
    ('00000000-0000-0000-0000-000000000007'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000007'::uuid),
    ('00000000-0000-0000-0000-000000000005'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000005'::uuid),
    ('00000000-0000-0000-0000-000000000006'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000006'::uuid),
    ('00000000-0000-0000-0000-000000000008'::uuid, '00000000-0000-0000-0000-000000000002'::uuid, '00000000-0000-0000-0000-000000000008'::uuid),
    ('00000000-0000-0000-0000-000000000009'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000009'::uuid)

  ),
  ins_o_mems AS (
    INSERT INTO public.organization_memberships (id, organization_id, user_id)
    SELECT * FROM o_mems
    RETURNING id
  ),
  b_mems (id, branch_id, user_id) AS (VALUES 
    -- Admin Both in A and B
    ('00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000011'::uuid, '00000000-0000-0000-0000-000000000003'::uuid),
    ('00000000-0000-0000-0000-000000000002'::uuid, '00000000-0000-0000-0000-000000000012'::uuid, '00000000-0000-0000-0000-000000000003'::uuid),
    -- Admin One in A only
    ('00000000-0000-0000-0000-000000000003'::uuid, '00000000-0000-0000-0000-000000000011'::uuid, '00000000-0000-0000-0000-000000000004'::uuid)
    ,('00000000-0000-0000-0000-000000000004'::uuid, '00000000-0000-0000-0000-000000000012'::uuid, '00000000-0000-0000-0000-000000000005'::uuid),
    ('00000000-0000-0000-0000-000000000005'::uuid, '00000000-0000-0000-0000-000000000011'::uuid, '00000000-0000-0000-0000-000000000006'::uuid),
    ('00000000-0000-0000-0000-000000000006'::uuid, '00000000-0000-0000-0000-000000000011'::uuid, '00000000-0000-0000-0000-000000000009'::uuid),
    ('00000000-0000-0000-0000-000000000007'::uuid, '00000000-0000-0000-0000-000000000012'::uuid, '00000000-0000-0000-0000-000000000009'::uuid)

  ),
  ins_b_mems AS (
    INSERT INTO public.branch_memberships (id, branch_id, user_id)
    SELECT * FROM b_mems
    RETURNING id
  ),
  rls_def (id, organization_id, name) AS (VALUES 
    ('00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Branch Admin')
    ,('00000000-0000-0000-0000-000000000002'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Teacher')

  ),
  ins_roles AS (
    INSERT INTO public.roles (id, organization_id, name)
    SELECT * FROM rls_def
    RETURNING id
  ),
  ura (id, branch_membership_id, role_id) AS (VALUES 
    ('00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000001'::uuid),
    ('00000000-0000-0000-0000-000000000002'::uuid, '00000000-0000-0000-0000-000000000002'::uuid, '00000000-0000-0000-0000-000000000001'::uuid),
    ('00000000-0000-0000-0000-000000000003'::uuid, '00000000-0000-0000-0000-000000000003'::uuid, '00000000-0000-0000-0000-000000000001'::uuid)
    ,('00000000-0000-0000-0000-000000000004'::uuid, '00000000-0000-0000-0000-000000000004'::uuid, '00000000-0000-0000-0000-000000000001'::uuid),
    ('00000000-0000-0000-0000-000000000005'::uuid, '00000000-0000-0000-0000-000000000005'::uuid, '00000000-0000-0000-0000-000000000002'::uuid),
    ('00000000-0000-0000-0000-000000000006'::uuid, '00000000-0000-0000-0000-000000000006'::uuid, '00000000-0000-0000-0000-000000000001'::uuid),
    ('00000000-0000-0000-0000-000000000007'::uuid, '00000000-0000-0000-0000-000000000007'::uuid, '00000000-0000-0000-0000-000000000001'::uuid)

  )
  INSERT INTO public.user_role_assignments (id, branch_membership_id, role_id)
  SELECT * FROM ura;

-- Create Inactive Student
INSERT INTO public.students (id, organization_id, first_name, last_name, status)
VALUES ('00000000-0000-0000-0000-000000005002'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Inactive', 'Student', 'ARCHIVED');

-- Create Student
INSERT INTO public.students (id, organization_id, first_name, last_name, status)
VALUES ('00000000-0000-0000-0000-000000005001'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Student', 'One', 'ACTIVE');

-- Create Profile A
INSERT INTO public.student_branch_profiles (id, student_id, branch_id, admission_number, status)
VALUES ('00000000-0000-0000-0000-000000006001'::uuid, '00000000-0000-0000-0000-000000005001'::uuid, '00000000-0000-0000-0000-000000000011'::uuid, 'ADM-001', 'ACTIVE');

-- Create Enrollment A
INSERT INTO public.enrollments (id, organization_id, branch_id, student_id, student_branch_profile_id, academic_year_id, class_id, section_id, status, effective_from)
VALUES ('00000000-0000-0000-0000-000000007001'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000011'::uuid, '00000000-0000-0000-0000-000000005001'::uuid, '00000000-0000-0000-0000-000000006001'::uuid, '00000000-0000-0000-0000-000000000101'::uuid, '00000000-0000-0000-0000-000000001001'::uuid, '00000000-0000-0000-0000-000000002001'::uuid, 'ACTIVE', '2026-01-01');

-- Set actor to branch_admin_one (who only has Branch A access)
SELECT set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-000000000004", "app_metadata": {"is_super_admin": false}}', true);



-- Verify function properties
SELECT is_definer('public', 'rpc_transfer_student', ARRAY['uuid', 'uuid', 'uuid', 'date', 'text'], 'Function should be SECURITY DEFINER');
SELECT function_returns('public', 'rpc_transfer_student', ARRAY['uuid', 'uuid', 'uuid', 'date', 'text'], 'uuid', 'Function should return UUID');
SELECT function_owner_is('public', 'rpc_transfer_student', ARRAY['uuid', 'uuid', 'uuid', 'date', 'text'], 'postgres', 'Function should be owned by postgres');

-- Check that EXECUTE is revoked from PUBLIC
SELECT results_eq(
    $$ SELECT has_function_privilege('public', 'public.rpc_transfer_student(uuid, uuid, uuid, date, text)', 'EXECUTE') $$,
    $$ VALUES (false) $$,
    'PUBLIC should not have EXECUTE privilege'
);

-- Check that EXECUTE is granted to authenticated
SELECT results_eq(
    $$ SELECT has_function_privilege('authenticated', 'public.rpc_transfer_student(uuid, uuid, uuid, date, text)', 'EXECUTE') $$,
    $$ VALUES (true) $$,
    'authenticated role should have EXECUTE privilege'
);

-- Helper for testing transfer with different JWT actors
CREATE OR REPLACE FUNCTION pg_temp.test_transfer_with_role(
    p_actor_id UUID, p_is_super_admin BOOLEAN, p_student_id UUID, p_src_branch UUID, p_dest_branch UUID, p_effective_date DATE, p_admission_no TEXT
) RETURNS VOID AS $fn$
BEGIN
    PERFORM set_config('request.jwt.claims', format('{"sub": "%s", "app_metadata": {"is_super_admin": %s}}', p_actor_id, p_is_super_admin::text), true);
    PERFORM public.rpc_transfer_student(p_student_id, p_src_branch, p_dest_branch, p_effective_date, p_admission_no);
END;
$fn$ LANGUAGE plpgsql;

-- Data-driven authorization tests
SELECT throws_ok(
    format('SELECT pg_temp.test_transfer_with_role(%L, %L, %L, %L, %L, %L, %L)', 
           actor_id, is_super_admin, '00000000-0000-0000-0000-000000005001', '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000002002', '2026-02-01', 'ADM-002'),
    'P0001', 'Not authorized: Must be Super Admin or Branch Admin for both branches', descr
)
FROM (VALUES
    ('00000000-0000-0000-0000-000000000005'::uuid, false, 'Destination-only Branch Admin denied'),
    ('00000000-0000-0000-0000-000000000006'::uuid, false, 'Teacher denied'),
    ('00000000-0000-0000-0000-000000000008'::uuid, true,  'Super admin from unrelated org denied')
) as t(actor_id, is_super_admin, descr);

-- Make admin's source membership inactive
UPDATE public.branch_memberships SET status = 'SUSPENDED' WHERE user_id = '00000000-0000-0000-0000-000000000009' AND branch_id = '00000000-0000-0000-0000-000000000011';
SELECT set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-000000000009", "app_metadata": {"is_super_admin": false}}', true);
SELECT throws_ok(
    $$ SELECT public.rpc_transfer_student('00000000-0000-0000-0000-000000005001'::uuid, '00000000-0000-0000-0000-000000000011'::uuid, '00000000-0000-0000-0000-000000002002'::uuid, '2026-02-01'::date, 'ADM-002') $$,
    'P0001', 'Not authorized: Must be Super Admin or Branch Admin for both branches', 'Inactive source membership denied'
);

-- Make admin's dest membership inactive (after restoring source)
UPDATE public.branch_memberships SET status = 'ACTIVE' WHERE user_id = '00000000-0000-0000-0000-000000000009' AND branch_id = '00000000-0000-0000-0000-000000000011';
UPDATE public.branch_memberships SET status = 'SUSPENDED' WHERE user_id = '00000000-0000-0000-0000-000000000009' AND branch_id = '00000000-0000-0000-0000-000000000012';
SELECT throws_ok(
    $$ SELECT public.rpc_transfer_student('00000000-0000-0000-0000-000000005001'::uuid, '00000000-0000-0000-0000-000000000011'::uuid, '00000000-0000-0000-0000-000000002002'::uuid, '2026-02-01'::date, 'ADM-002') $$,
    'P0001', 'Not authorized: Must be Super Admin or Branch Admin for both branches', 'Inactive dest membership denied'
);

-- Super admin inactive membership
UPDATE public.organization_memberships SET status = 'SUSPENDED' WHERE user_id = '00000000-0000-0000-0000-000000000007';
SELECT set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-000000000007", "app_metadata": {"is_super_admin": true}}', true);
SELECT throws_ok(
    $$ SELECT public.rpc_transfer_student('00000000-0000-0000-0000-000000005001'::uuid, '00000000-0000-0000-0000-000000000011'::uuid, '00000000-0000-0000-0000-000000002002'::uuid, '2026-02-01'::date, 'ADM-002') $$,
    'P0001', 'Not authorized: Must be Super Admin or Branch Admin for both branches', 'Inactive super admin membership denied'
);
UPDATE public.organization_memberships SET status = 'ACTIVE' WHERE user_id = '00000000-0000-0000-0000-000000000007';

-- Switch to active super admin for remaining error cases
SELECT set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-000000000007", "app_metadata": {"is_super_admin": true}}', true);

-- Inactive student
SELECT throws_ok(
    $$ SELECT public.rpc_transfer_student('00000000-0000-0000-0000-000000005002'::uuid, '00000000-0000-0000-0000-000000000011'::uuid, '00000000-0000-0000-0000-000000002002'::uuid, '2026-02-01'::date, 'ADM-002') $$,
    'P0001', 'Student is not active or does not exist', 'Inactive student denied'
);

-- Inactive destination branch
UPDATE public.branches SET status = 'ARCHIVED' WHERE id = '00000000-0000-0000-0000-000000000012';
SELECT throws_ok(
    $$ SELECT public.rpc_transfer_student('00000000-0000-0000-0000-000000005001'::uuid, '00000000-0000-0000-0000-000000000011'::uuid, '00000000-0000-0000-0000-000000002002'::uuid, '2026-02-01'::date, 'ADM-002') $$,
    'P0001', 'Destination branch is not active', 'Inactive destination branch denied'
);
UPDATE public.branches SET status = 'ACTIVE' WHERE id = '00000000-0000-0000-0000-000000000012';

-- Inactive academic year
UPDATE public.academic_years SET status = 'ARCHIVED' WHERE id = '00000000-0000-0000-0000-000000000102';
SELECT throws_ok(
    $$ SELECT public.rpc_transfer_student('00000000-0000-0000-0000-000000005001'::uuid, '00000000-0000-0000-0000-000000000011'::uuid, '00000000-0000-0000-0000-000000002002'::uuid, '2026-02-01'::date, 'ADM-002') $$,
    'P0001', 'Destination academic year is not active or planned', 'Inactive academic year denied'
);
UPDATE public.academic_years SET status = 'ACTIVE' WHERE id = '00000000-0000-0000-0000-000000000102';

-- Switch back to branch_admin_one (who only has Branch A access) for the original test
SELECT set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-000000000004", "app_metadata": {"is_super_admin": false}}', true);

SELECT throws_ok(
    $$ SELECT public.rpc_transfer_student(
        '00000000-0000-0000-0000-000000005001'::uuid,
        '00000000-0000-0000-0000-000000000011'::uuid,
        '00000000-0000-0000-0000-000000002002'::uuid,
        '2026-02-01'::date,
        'ADM-002'
    ) $$,
    'P0001',
    'Not authorized: Must be Super Admin or Branch Admin for both branches',
    'Fails when actor is not admin of destination branch'
);

-- Set actor to branch_admin_both (Branch A and B)
SELECT set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-000000000003", "app_metadata": {"is_super_admin": false}}', true);

-- Test cross-org transfer fails
SELECT throws_ok(
    $$ SELECT public.rpc_transfer_student(
        '00000000-0000-0000-0000-000000005001'::uuid,
        '00000000-0000-0000-0000-000000000011'::uuid,
        '00000000-0000-0000-0000-000000002003'::uuid,
        '2026-02-01'::date,
        'ADM-002'
    ) $$,
    'P0001',
    'Source and destination branches must belong to the same organization',
    'Fails when destination section is in a different org'
);

-- Test same branch transfer fails
SELECT throws_ok(
    $$ SELECT public.rpc_transfer_student(
        '00000000-0000-0000-0000-000000005001'::uuid,
        '00000000-0000-0000-0000-000000000011'::uuid,
        '00000000-0000-0000-0000-000000002001'::uuid,
        '2026-02-01'::date,
        'ADM-002'
    ) $$,
    'P0001',
    'Destination branch must be different from source branch',
    'Fails when destination section is in the same branch'
);

-- Test effective date invariant
SELECT throws_ok(
    $$ SELECT public.rpc_transfer_student(
        '00000000-0000-0000-0000-000000005001'::uuid,
        '00000000-0000-0000-0000-000000000011'::uuid,
        '00000000-0000-0000-0000-000000002002'::uuid,
        '2025-12-31'::date,
        'ADM-002'
    ) $$,
    'P0001',
    'Effective date must be strictly after the source enrollment effective_from date',
    'Fails when effective date is before source enrollment start'
);

-- Execute successful transfer
SELECT lives_ok(
    $$ SELECT public.rpc_transfer_student(
        '00000000-0000-0000-0000-000000005001'::uuid,
        '00000000-0000-0000-0000-000000000011'::uuid,
        '00000000-0000-0000-0000-000000002002'::uuid,
        '2026-02-01'::date,
        'ADM-002'
    ) $$,
    'Successful transfer executes without error'
);

-- Verify statuses
SELECT results_eq(
    $$ SELECT status FROM public.enrollments WHERE id = '00000000-0000-0000-0000-000000007001'::uuid $$,
    $$ VALUES ('TRANSFERRED') $$,
    'Source enrollment is TRANSFERRED'
);

SELECT results_eq(
    $$ SELECT status FROM public.student_branch_profiles WHERE id = '00000000-0000-0000-0000-000000006001'::uuid $$,
    $$ VALUES ('TRANSFERRED') $$,
    'Source profile is TRANSFERRED'
);

SELECT results_eq(
    $$ SELECT status FROM public.enrollments WHERE student_id = '00000000-0000-0000-0000-000000005001'::uuid AND branch_id = '00000000-0000-0000-0000-000000000012'::uuid $$,
    $$ VALUES ('ACTIVE') $$,
    'Destination enrollment is ACTIVE'
);

SELECT results_eq(
    $$ SELECT admission_number FROM public.student_branch_profiles WHERE student_id = '00000000-0000-0000-0000-000000005001'::uuid AND branch_id = '00000000-0000-0000-0000-000000000012'::uuid $$,
    $$ VALUES ('ADM-002') $$,
    'Destination profile has new admission number'
);

-- Verify audit log
SELECT results_eq(
    $$ SELECT reason FROM public.audit_logs WHERE action = 'INSERT' AND table_name = 'enrollments' AND new_data->>'branch_id' = '00000000-0000-0000-0000-000000000012' LIMIT 1 $$,
    $$ VALUES ('Student transfer') $$,
    'Audit log is created with correct reason'
);


-- Verify audit log actor
SELECT results_eq(
    $$ SELECT actor_id FROM public.audit_logs WHERE action = 'INSERT' AND table_name = 'enrollments' AND new_data->>'branch_id' = '00000000-0000-0000-0000-000000000012' LIMIT 1 $$,
    $$ VALUES ('00000000-0000-0000-0000-000000000003'::uuid) $$,
    'Audit log is created with correct actor'
);

-- Verify unique constraints by trying to add a second ACTIVE profile
SELECT throws_ok(
    $$ INSERT INTO public.student_branch_profiles (student_id, branch_id, status) VALUES ('00000000-0000-0000-0000-000000005001'::uuid, '00000000-0000-0000-0000-000000000013'::uuid, 'ACTIVE') $$,
    '23505',
    NULL,
    'Global active profile invariant prevents multiple active profiles'
);

-- Verify global active enrollment per year invariant
SELECT throws_ok(
    $$ INSERT INTO public.enrollments (organization_id, branch_id, student_id, student_branch_profile_id, academic_year_id, class_id, section_id, status, effective_from)
       VALUES ('00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000012'::uuid, '00000000-0000-0000-0000-000000005001'::uuid, (SELECT id FROM public.student_branch_profiles WHERE student_id = '00000000-0000-0000-0000-000000005001'::uuid AND branch_id = '00000000-0000-0000-0000-000000000012'::uuid), '00000000-0000-0000-0000-000000000102'::uuid, '00000000-0000-0000-0000-000000001002'::uuid, '00000000-0000-0000-0000-000000002002'::uuid, 'ACTIVE', '2026-03-01'::date) $$,
    '23505',
    NULL,
    'Global active enrollment per year invariant prevents multiple active enrollments in the same year'
);

-- Try transfer again for same student
SELECT throws_ok(
    $$ SELECT public.rpc_transfer_student(
        '00000000-0000-0000-0000-000000005001'::uuid,
        '00000000-0000-0000-0000-000000000011'::uuid,
        '00000000-0000-0000-0000-000000002002'::uuid,
        '2026-03-01'::date,
        'ADM-003'
    ) $$,
    'P0001',
    'No active profile found in source branch',
    'Fails on second transfer from original source because profile is TRANSFERRED'
);

-- Verify delete protection on enrollments
SELECT throws_ok(
    $$ DELETE FROM public.enrollments WHERE id = '00000000-0000-0000-0000-000000007001'::uuid $$,
    'P0001',
    'Hard deletion of enrollments is not allowed',
    'Delete protection on enrollments'
);

-- Verify delete protection on profiles
SELECT throws_ok(
    $$ DELETE FROM public.student_branch_profiles WHERE id = '00000000-0000-0000-0000-000000006001'::uuid $$,
    'P0001',
    'Hard deletion of student_branch_profiles is not allowed',
    'Delete protection on student branch profiles'
);


-- Verify parent deletion triggers RESTRICT or trigger exception
SELECT throws_ok(
    $$ DELETE FROM public.students WHERE id = '00000000-0000-0000-0000-000000005001'::uuid $$,
    'P0001',
    NULL,
    'Deletion of parent records with dependents protected'
);

SELECT * FROM finish();
ROLLBACK;
