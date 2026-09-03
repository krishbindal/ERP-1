BEGIN;

SELECT plan(9);

CREATE FUNCTION get_test_user_1() RETURNS uuid LANGUAGE sql AS $$ SELECT '77777777-7777-7777-7777-777777777777'::uuid $$;
CREATE FUNCTION get_test_user_2() RETURNS uuid LANGUAGE sql AS $$ SELECT '88888888-8888-8888-8888-888888888888'::uuid $$;
CREATE FUNCTION get_test_role() RETURNS uuid LANGUAGE sql AS $$ SELECT '99999999-8888-7777-6666-555555555555'::uuid $$;
CREATE FUNCTION get_test_org() RETURNS uuid LANGUAGE sql AS $$ SELECT 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'::uuid $$;

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

SELECT set_config('request.jwt.claims', format('{"sub": "%s", "role": "authenticated"}', get_test_user_1()), true);
SELECT set_config('role', 'authenticated', true);
SELECT is(public.requires_password_reset(), true, 'flagged user requires reset');

SELECT set_config('request.jwt.claims', format('{"sub": "%s", "role": "authenticated"}', get_test_user_2()), true);
SELECT set_config('role', 'authenticated', true);
SELECT is(public.requires_password_reset(), false, 'unflagged user does not require reset');

SELECT set_config('request.jwt.claims', format('{"sub": "%s", "role": "authenticated"}', get_test_user_1()), true);
SELECT set_config('role', 'authenticated', true);
SELECT lives_ok($$ SELECT public.clear_password_reset_flag() $$, 'clear_password_reset_flag() executes');
SELECT is(public.requires_password_reset(), false, 'reset flag is cleared');

SELECT set_config('request.jwt.claims', '{"sub": "99999999-9999-9999-9999-999999999999", "role": "authenticated"}', true);
SELECT set_config('role', 'authenticated', true);
SELECT is(public.requires_password_reset(), false, 'unknown user does not require reset');

SELECT is(has_function_privilege('public', 'public.requires_password_reset()', 'EXECUTE'), false, 'PUBLIC cannot execute requires_password_reset()');
SELECT is(has_function_privilege('authenticated', 'public.requires_password_reset()', 'EXECUTE'), true, 'authenticated can execute requires_password_reset()');
SELECT is(has_function_privilege('public', 'public.clear_password_reset_flag()', 'EXECUTE'), false, 'PUBLIC cannot execute clear_password_reset_flag()');
SELECT is(has_function_privilege('authenticated', 'public.clear_password_reset_flag()', 'EXECUTE'), true, 'authenticated can execute clear_password_reset_flag()');

SELECT * FROM finish();
ROLLBACK;
