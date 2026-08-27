BEGIN;
SELECT plan(10);

-- 1. Test tables exist
SELECT has_table('branch_app_configs', 'branch_app_configs table exists');

-- 2. Test unique constraints
SELECT col_is_unique('public', 'branch_app_configs', 'branch_id', 'branch_id must be unique');
SELECT col_is_unique('public', 'branch_app_configs', 'slug', 'slug must be unique');
SELECT col_is_unique('public', 'branch_app_configs', 'android_package_id', 'android package id must be unique');
SELECT col_is_unique('public', 'branch_app_configs', 'ios_bundle_id', 'ios bundle id must be unique');

-- 3. Setup test data (we can assume the seed runs first, or we create some if needed)
-- We'll just verify the existing backfilled data or policies directly.

-- First, let's create a test user
SELECT set_config('role', 'postgres', true);
SELECT auth.uid() AS "test_setup_reset";

-- Insert a test organization
INSERT INTO organizations (id, name) VALUES ('00000000-0000-0000-0000-000000000001', 'Test Org 1') ON CONFLICT DO NOTHING;
INSERT INTO branches (id, organization_id, name) VALUES ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Test Branch 1') ON CONFLICT DO NOTHING;
INSERT INTO branches (id, organization_id, name) VALUES ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Test Branch 2') ON CONFLICT DO NOTHING;

-- 4. Verify trigger backfill (the config should exist for Test Branch 1 & 2)
SELECT results_eq(
    $$ SELECT branch_id FROM branch_app_configs WHERE branch_id = '00000000-0000-0000-0000-000000000002' $$,
    $$ VALUES ('00000000-0000-0000-0000-000000000002'::uuid) $$,
    'Trigger creates config for new branch'
);

-- 5. Test composite FK enforcement
-- We try to create a config where branch_id is branch 2, but org_id is different. It should fail.
PREPARE test_bad_fk AS
  UPDATE branch_app_configs 
  SET organization_id = '00000000-0000-0000-0000-000000000009'
  WHERE branch_id = '00000000-0000-0000-0000-000000000002';

SELECT throws_ok(
    'test_bad_fk',
    '23503',
    NULL,
    'Cannot update config with mismatched branch and organization ID'
);

-- Check RLS
-- (RLS tests can be more extensive, we just do a few basic assertions)
SELECT set_config('role', 'authenticated', true);
SELECT set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-000000000000"}', true); -- Anon user

-- Unauthenticated or no membership should see 0 configs
SELECT results_eq(
    $$ SELECT count(*)::integer FROM branch_app_configs $$,
    $$ VALUES (0::integer) $$,
    'User with no memberships sees 0 configs'
);

-- Assign super admin
SELECT set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-000000000000", "app_metadata": {"is_super_admin": true}}', true);

-- In Slice B, we tightened the policy so Super Admins ONLY see configs for their authorized organizations.
-- This user has NO organization memberships yet.
SELECT is(
    (SELECT count(*) > 0 FROM branch_app_configs),
    false,
    'Super admin cannot see configs outside their authorized organizations'
);

-- Give the super admin membership to Test Org 1
SELECT set_config('role', 'postgres', true);
INSERT INTO auth.users (id) VALUES ('00000000-0000-0000-0000-000000000000') ON CONFLICT DO NOTHING;
INSERT INTO public.profiles (id, status) VALUES ('00000000-0000-0000-0000-000000000000', 'ACTIVE') ON CONFLICT DO NOTHING;
INSERT INTO organization_memberships (user_id, organization_id, status) VALUES ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'ACTIVE') ON CONFLICT DO NOTHING;
SELECT set_config('role', 'authenticated', true);

SELECT is(
    (SELECT count(*) > 0 FROM branch_app_configs),
    true,
    'Super admin can see configs inside their authorized organizations'
);

-- Back to postgres to clean up
SELECT set_config('role', 'postgres', true);
ROLLBACK;
