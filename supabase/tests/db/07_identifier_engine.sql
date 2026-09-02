BEGIN;

SELECT plan(21);

-- =================================================================
-- Helper functions for deterministic UUIDs
-- =================================================================
CREATE FUNCTION get_org_id() RETURNS uuid LANGUAGE sql AS $$ SELECT '11111111-1111-1111-1111-111111111111'::uuid $$;
CREATE FUNCTION get_org_b() RETURNS uuid LANGUAGE sql AS $$ SELECT '22222222-1111-1111-1111-111111111111'::uuid $$;
CREATE FUNCTION get_branch_1() RETURNS uuid LANGUAGE sql AS $$ SELECT '33333333-3333-3333-3333-333333333333'::uuid $$;
CREATE FUNCTION get_branch_2() RETURNS uuid LANGUAGE sql AS $$ SELECT '44444444-4444-4444-4444-444444444444'::uuid $$;
CREATE FUNCTION get_branch_orgb() RETURNS uuid LANGUAGE sql AS $$ SELECT '55555555-5555-5555-5555-555555555555'::uuid $$;
CREATE FUNCTION get_admin_a1() RETURNS uuid LANGUAGE sql AS $$ SELECT '99999999-9999-9999-9999-999999999999'::uuid $$;
CREATE FUNCTION get_admin_a2() RETURNS uuid LANGUAGE sql AS $$ SELECT 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid $$;
CREATE FUNCTION get_teacher_a1() RETURNS uuid LANGUAGE sql AS $$ SELECT 'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid $$;
CREATE FUNCTION get_super_admin() RETURNS uuid LANGUAGE sql AS $$ SELECT 'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid $$;
CREATE FUNCTION get_orgb_user() RETURNS uuid LANGUAGE sql AS $$ SELECT 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid $$;
CREATE FUNCTION get_role_branch_admin() RETURNS uuid LANGUAGE sql AS $$ SELECT '11111111-2222-3333-4444-555555555555'::uuid $$;
CREATE FUNCTION get_role_teacher() RETURNS uuid LANGUAGE sql AS $$ SELECT '33333333-2222-3333-4444-555555555555'::uuid $$;
CREATE FUNCTION get_ay_branch1() RETURNS uuid LANGUAGE sql AS $$ SELECT 'aaaaaaaa-1111-2222-3333-444444444444'::uuid $$;
CREATE FUNCTION get_ay_branch2() RETURNS uuid LANGUAGE sql AS $$ SELECT 'aaaaaaaa-2222-3333-4444-555555555555'::uuid $$;

-- =================================================================
-- 1. Setup Mock Data
-- =================================================================

-- Organizations
INSERT INTO organizations (id, name, status) VALUES
(get_org_id(), 'Test Org A', 'ACTIVE'),
(get_org_b(), 'Test Org B', 'ACTIVE')
ON CONFLICT DO NOTHING;

-- Branches
INSERT INTO branches (id, organization_id, name, status) VALUES
(get_branch_1(), get_org_id(), 'Branch A1', 'ACTIVE'),
(get_branch_2(), get_org_id(), 'Branch A2', 'ACTIVE'),
(get_branch_orgb(), get_org_b(), 'Branch B1', 'ACTIVE')
ON CONFLICT DO NOTHING;

-- Academic Years (branch-scoped per schema)
INSERT INTO academic_years (id, branch_id, name, start_date, end_date, status) VALUES
(get_ay_branch1(), get_branch_1(), '2026-2027-A1', '2026-04-01', '2027-03-31', 'ACTIVE'),
(get_ay_branch2(), get_branch_2(), '2026-2027-A2', '2026-04-01', '2027-03-31', 'ACTIVE')
ON CONFLICT DO NOTHING;

-- Roles
INSERT INTO roles (id, organization_id, name) VALUES
(get_role_branch_admin(), get_org_id(), 'branchadmin'),
(get_role_teacher(), get_org_id(), 'teacher')
ON CONFLICT DO NOTHING;

-- Users
INSERT INTO auth.users (id, email, instance_id, aud, role, encrypted_password, raw_app_meta_data) VALUES
(get_admin_a1(), 'admin.a1@test.com', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', '...', '{"provider":"email"}'),
(get_admin_a2(), 'admin.a2@test.com', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', '...', '{"provider":"email"}'),
(get_teacher_a1(), 'teacher.a1@test.com', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', '...', '{"provider":"email"}'),
(get_super_admin(), 'super.admin@test.com', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', '...', '{"provider":"email","is_super_admin":true}'),
(get_orgb_user(), 'orgb.user@test.com', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', '...', '{"provider":"email"}')
ON CONFLICT DO NOTHING;

-- Profiles (needed for auth_is_active_user / auth_is_super_admin)
INSERT INTO profiles (id, first_name, last_name, status) VALUES
(get_admin_a1(), 'Admin', 'A1', 'ACTIVE'),
(get_admin_a2(), 'Admin', 'A2', 'ACTIVE'),
(get_teacher_a1(), 'Teacher', 'A1', 'ACTIVE'),
(get_super_admin(), 'Super', 'Admin', 'ACTIVE'),
(get_orgb_user(), 'OrgB', 'User', 'ACTIVE')
ON CONFLICT DO NOTHING;

-- Organization memberships
INSERT INTO organization_memberships (user_id, organization_id, status) VALUES
(get_admin_a1(), get_org_id(), 'ACTIVE'),
(get_admin_a2(), get_org_id(), 'ACTIVE'),
(get_teacher_a1(), get_org_id(), 'ACTIVE'),
(get_super_admin(), get_org_id(), 'ACTIVE'),
(get_orgb_user(), get_org_b(), 'ACTIVE')
ON CONFLICT DO NOTHING;

-- Branch memberships
INSERT INTO branch_memberships (id, user_id, branch_id, status) VALUES
('11111111-1111-1111-1111-111111111111', get_admin_a1(), get_branch_1(), 'ACTIVE'),
('22222222-2222-2222-2222-222222222222', get_admin_a2(), get_branch_2(), 'ACTIVE'),
('33333333-3333-3333-3333-333333333333', get_teacher_a1(), get_branch_1(), 'ACTIVE'),
('66666666-6666-6666-6666-666666666666', get_orgb_user(), get_branch_orgb(), 'ACTIVE')
ON CONFLICT DO NOTHING;
-- Note: Super Admin has NO branch membership (operates at org level via canonical model)

-- Role assignments
INSERT INTO user_role_assignments (branch_membership_id, role_id) VALUES
('11111111-1111-1111-1111-111111111111', get_role_branch_admin()),
('22222222-2222-2222-2222-222222222222', get_role_branch_admin()),
('33333333-3333-3333-3333-333333333333', get_role_teacher())
ON CONFLICT DO NOTHING;

-- =================================================================
-- 2. Configure test sequences (as admin)
-- =================================================================
SELECT set_config('request.jwt.claims', format('{"sub": "%s", "role": "authenticated"}', get_admin_a1()), true);
SELECT set_config('role', 'authenticated', true);

SELECT lives_ok(
    $$
    INSERT INTO public.identifier_sequences (organization_id, branch_id, entity_type, prefix, padding_length)
    VALUES ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'student_code', 'STU-', 4)
    $$,
    'Admin A1 can create a sequence for Branch A1'
);

-- Also create a sequence for Branch A2 (as admin_a2)
SELECT set_config('request.jwt.claims', format('{"sub": "%s", "role": "authenticated"}', get_admin_a2()), true);
SELECT lives_ok(
    $$
    INSERT INTO public.identifier_sequences (organization_id, branch_id, entity_type, prefix, padding_length)
    VALUES ('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'student_code', 'STU2-', 4)
    $$,
    'Admin A2 can create a sequence for Branch A2'
);

-- Create an academic-year-scoped sequence for Branch A1
SELECT set_config('request.jwt.claims', format('{"sub": "%s", "role": "authenticated"}', get_admin_a1()), true);
SELECT lives_ok(
    $$
    INSERT INTO public.identifier_sequences (organization_id, branch_id, academic_year_id, entity_type, prefix, padding_length)
    VALUES ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-1111-2222-3333-444444444444', 'enrollment_code', 'ENR-', 5)
    $$,
    'Can create academic-year-scoped sequence for Branch A1'
);

-- Global (org-level) sequence
SELECT lives_ok(
    $$
    INSERT INTO public.identifier_sequences (organization_id, branch_id, entity_type, prefix, padding_length)
    VALUES ('11111111-1111-1111-1111-111111111111', NULL, 'invoice', 'GLOBAL-INV-', 5)
    $$,
    'Can create global sequence (branch_id IS NULL)'
);

-- =================================================================
-- TEST 1: Branch A1 authorized user -> Branch A1 generation succeeds
-- =================================================================
SELECT set_config('request.jwt.claims', format('{"sub": "%s", "role": "authenticated"}', get_teacher_a1()), true);
SELECT set_config('role', 'authenticated', true);

SELECT is(
    public.generate_business_identifier('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', NULL, 'student_code'),
    'STU-0001',
    'TEST 1: Teacher in Branch A1 can generate identifier for Branch A1'
);

-- =================================================================
-- TEST 2: Branch A1 user -> Branch A2 generation FAILS
-- =================================================================
-- Record last_value before the attempt
SELECT set_config('role', 'service_role', true);
SELECT set_config('request.jwt.claims', '{"role": "service_role"}', true);

-- Check last_value on Branch A2 sequence before unauthorized attempt
CREATE TEMP TABLE _test_state AS
SELECT last_value FROM public.identifier_sequences
WHERE organization_id = get_org_id() AND branch_id = get_branch_2() AND entity_type = 'student_code';

-- Switch to teacher_a1 (Branch A1 only)
SELECT set_config('request.jwt.claims', format('{"sub": "%s", "role": "authenticated"}', get_teacher_a1()), true);
SELECT set_config('role', 'authenticated', true);

SELECT throws_ok(
    $$
    SELECT public.generate_business_identifier('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', NULL, 'student_code')
    $$,
    'P0001',
    'Unauthorized: caller does not have an active membership in the requested branch',
    'TEST 2: Teacher in Branch A1 CANNOT generate for Branch A2'
);

-- Verify last_value was NOT incremented
SELECT set_config('role', 'service_role', true);
SELECT set_config('request.jwt.claims', '{"role": "service_role"}', true);

SELECT is(
    (SELECT last_value FROM public.identifier_sequences
     WHERE organization_id = get_org_id() AND branch_id = get_branch_2() AND entity_type = 'student_code'),
    (SELECT last_value FROM _test_state),
    'TEST 2b: Unauthorized attempt did NOT increment last_value'
);

DROP TABLE _test_state;

-- =================================================================
-- TEST 3: Branch A2 user -> Branch A1 generation FAILS
-- =================================================================
SELECT set_config('request.jwt.claims', format('{"sub": "%s", "role": "authenticated"}', get_admin_a2()), true);
SELECT set_config('role', 'authenticated', true);

SELECT throws_ok(
    $$
    SELECT public.generate_business_identifier('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', NULL, 'student_code')
    $$,
    'P0001',
    'Unauthorized: caller does not have an active membership in the requested branch',
    'TEST 3: Admin A2 (Branch A2 only) CANNOT generate for Branch A1'
);

-- =================================================================
-- TEST 4: User outside organization -> generation FAILS
-- =================================================================
SELECT set_config('request.jwt.claims', format('{"sub": "%s", "role": "authenticated"}', get_orgb_user()), true);
SELECT set_config('role', 'authenticated', true);

SELECT throws_ok(
    $$
    SELECT public.generate_business_identifier('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', NULL, 'student_code')
    $$,
    'P0001',
    'Unauthorized: caller is not an active member of the requested organization',
    'TEST 4: User from Org B CANNOT generate identifiers for Org A'
);

-- =================================================================
-- TEST 5: Super Admin -> cross-branch generation SUCCEEDS
-- =================================================================
SELECT set_config('request.jwt.claims', format('{"sub": "%s", "role": "authenticated", "app_metadata": {"is_super_admin": true}}', get_super_admin()), true);
SELECT set_config('role', 'authenticated', true);

SELECT is(
    public.generate_business_identifier('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', NULL, 'student_code'),
    'STU2-0001',
    'TEST 5: Super Admin can generate for Branch A2 (cross-branch via canonical model)'
);

-- Super Admin can also generate for Branch A1
SELECT is(
    public.generate_business_identifier('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', NULL, 'student_code'),
    'STU-0002',
    'TEST 5b: Super Admin can generate for Branch A1'
);

-- =================================================================
-- TEST 6: Branch from Org B paired with Org A -> FAILS
-- =================================================================
SELECT set_config('request.jwt.claims', format('{"sub": "%s", "role": "authenticated", "app_metadata": {"is_super_admin": true}}', get_super_admin()), true);

SELECT throws_ok(
    $$
    SELECT public.generate_business_identifier('11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', NULL, 'student_code')
    $$,
    'P0001',
    'Invalid branch: does not exist or does not belong to the requested organization',
    'TEST 6: Branch from Org B paired with Org A is rejected'
);

-- =================================================================
-- TEST 7: Academic year from Branch B paired with Branch A -> FAILS
-- =================================================================
SELECT set_config('request.jwt.claims', format('{"sub": "%s", "role": "authenticated"}', get_admin_a1()), true);
SELECT set_config('role', 'authenticated', true);

SELECT throws_ok(
    $$
    SELECT public.generate_business_identifier('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-2222-3333-4444-555555555555', 'enrollment_code')
    $$,
    'P0001',
    'Invalid academic year: does not belong to the requested branch',
    'TEST 7: Academic year from Branch A2 paired with Branch A1 is rejected'
);

-- =================================================================
-- TEST 8: Invalid/nonexistent branch -> FAILS
-- =================================================================
SELECT throws_ok(
    $$
    SELECT public.generate_business_identifier('11111111-1111-1111-1111-111111111111', 'ffffffff-ffff-ffff-ffff-ffffffffffff', NULL, 'student_code')
    $$,
    'P0001',
    'Invalid branch: does not exist or does not belong to the requested organization',
    'TEST 8: Nonexistent branch is rejected'
);

-- =================================================================
-- TEST 9: Global/org-level generation works
-- =================================================================
SELECT set_config('request.jwt.claims', format('{"sub": "%s", "role": "authenticated"}', get_admin_a1()), true);

SELECT is(
    public.generate_business_identifier('11111111-1111-1111-1111-111111111111', NULL, NULL, 'invoice'),
    'GLOBAL-INV-00001',
    'TEST 9: Global (org-level) sequence generation works'
);

-- =================================================================
-- TEST 10: service_role behavior works
-- =================================================================
SELECT set_config('request.jwt.claims', '{"role": "service_role"}', true);
SELECT set_config('role', 'service_role', true);

SELECT lives_ok(
    $$
    SELECT public.generate_business_identifier('11111111-1111-1111-1111-111111111111', NULL, NULL, 'invoice')
    $$,
    'TEST 10: service_role can generate identifier without user authorization'
);

-- =================================================================
-- TEST 11: Successful requests increment exactly once
-- =================================================================
SELECT set_config('request.jwt.claims', format('{"sub": "%s", "role": "authenticated"}', get_teacher_a1()), true);
SELECT set_config('role', 'authenticated', true);

SELECT is(
    public.generate_business_identifier('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', NULL, 'student_code'),
    'STU-0003',
    'TEST 11: Third generation returns STU-0003 (increments exactly once)'
);

-- =================================================================
-- TEST 12: Academic-year-scoped generation with correct branch works
-- =================================================================
SELECT is(
    public.generate_business_identifier('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-1111-2222-3333-444444444444', 'enrollment_code'),
    'ENR-00001',
    'TEST 12: Academic-year-scoped generation with matching branch succeeds'
);

-- =================================================================
-- TEST 13: Savepoint rollback restores sequence state (transactional behavior)
-- =================================================================
SAVEPOINT before_generate;
SELECT is(
    public.generate_business_identifier('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', NULL, 'student_code'),
    'STU-0004',
    'TEST 13a: Generates STU-0004 inside savepoint'
);
ROLLBACK TO SAVEPOINT before_generate;

SELECT is(
    public.generate_business_identifier('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', NULL, 'student_code'),
    'STU-0004',
    'TEST 13b: After savepoint rollback, generates STU-0004 again (transactional UPDATE rolls back)'
);

-- =================================================================
-- TEST 14: Missing sequence configuration throws correctly
-- =================================================================
SELECT throws_ok(
    $$
    SELECT public.generate_business_identifier('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', NULL, 'nonexistent_entity')
    $$,
    'P0001',
    'Sequence not configured for entity nonexistent_entity',
    'TEST 14: Missing sequence configuration throws correctly'
);

-- =================================================================
-- Finish
-- =================================================================
SELECT * FROM finish();
ROLLBACK;
