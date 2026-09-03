BEGIN;

SELECT plan(5);

-- Helper functions for deterministic UUIDs
CREATE FUNCTION get_test_user_1() RETURNS uuid LANGUAGE sql AS $$ SELECT '77777777-7777-7777-7777-777777777777'::uuid $$;
CREATE FUNCTION get_test_user_2() RETURNS uuid LANGUAGE sql AS $$ SELECT '88888888-8888-8888-8888-888888888888'::uuid $$;
CREATE FUNCTION get_test_role() RETURNS uuid LANGUAGE sql AS $$ SELECT '99999999-8888-7777-6666-555555555555'::uuid $$;
CREATE FUNCTION get_test_org() RETURNS uuid LANGUAGE sql AS $$ SELECT 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'::uuid $$;

-- 1. Setup Mock Data
-- Need auth schema since users table is in auth
-- Need auth schema since users table is in auth

INSERT INTO auth.users (id, email) VALUES
(get_test_user_1(), 'test1@example.com'),
(get_test_user_2(), 'test2@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO public.profiles (id, first_name, last_name) VALUES
(get_test_user_1(), 'Test', 'User1'),
(get_test_user_2(), 'Test', 'User2')
ON CONFLICT DO NOTHING;

INSERT INTO public.organizations (id, name, status) VALUES
(get_test_org(), 'Test Org', 'ACTIVE')
ON CONFLICT DO NOTHING;

INSERT INTO public.roles (id, organization_id, name) VALUES
(get_test_role(), get_test_org(), 'test_role')
ON CONFLICT DO NOTHING;

INSERT INTO public.user_credentials (username, profile_id, role_id, is_active, force_password_reset) VALUES
('testuser1', get_test_user_1(), get_test_role(), true, true),
('testuser2', get_test_user_2(), get_test_role(), true, false)
ON CONFLICT DO NOTHING;

-- =================================================================
-- TEST 1: requires_password_reset() returns true when force_password_reset = true
-- =================================================================
SELECT set_config('request.jwt.claims', format('{"sub": "%s", "role": "authenticated"}', get_test_user_1()), true);
SELECT set_config('role', 'authenticated', true);

SELECT is(
    public.requires_password_reset(),
    true,
    'TEST 1: requires_password_reset() returns true for user with force_password_reset = true'
);

-- =================================================================
-- TEST 2: requires_password_reset() returns false when force_password_reset = false
-- =================================================================
SELECT set_config('request.jwt.claims', format('{"sub": "%s", "role": "authenticated"}', get_test_user_2()), true);
SELECT set_config('role', 'authenticated', true);

SELECT is(
    public.requires_password_reset(),
    false,
    'TEST 2: requires_password_reset() returns false for user with force_password_reset = false'
);

-- =================================================================
-- TEST 3: clear_password_reset_flag() sets force_password_reset to false
-- =================================================================
SELECT set_config('request.jwt.claims', format('{"sub": "%s", "role": "authenticated"}', get_test_user_1()), true);
SELECT set_config('role', 'authenticated', true);

SELECT lives_ok(
    $$ SELECT public.clear_password_reset_flag() $$,
    'TEST 3a: clear_password_reset_flag() executes without error'
);

SELECT is(
    public.requires_password_reset(),
    false,
    'TEST 3b: requires_password_reset() returns false after calling clear_password_reset_flag()'
);

-- =================================================================
-- TEST 4: requires_password_reset() returns false when record doesn't exist
-- =================================================================
SELECT set_config('request.jwt.claims', '{"sub": "99999999-9999-9999-9999-999999999999", "role": "authenticated"}', true);
SELECT set_config('role', 'authenticated', true);

SELECT is(
    public.requires_password_reset(),
    false,
    'TEST 4: requires_password_reset() returns false for unknown user'
);

SELECT * FROM finish();
ROLLBACK;
