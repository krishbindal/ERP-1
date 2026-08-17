BEGIN;
SELECT plan(10);

-- Test 1: Organizations exist
SELECT has_table('public', 'organizations', 'organizations table exists');

-- Test 2: Branches exist
SELECT has_table('public', 'branches', 'branches table exists');

-- Test 3: Profiles exist
SELECT has_table('public', 'profiles', 'profiles table exists');

-- Test 4: Memberships exist
SELECT has_table('public', 'organization_memberships', 'org memberships exist');
SELECT has_table('public', 'branch_memberships', 'branch memberships exist');

-- Test 5: Roles and Permissions exist
SELECT has_table('public', 'roles', 'roles exist');
SELECT has_table('public', 'permissions', 'permissions exist');
SELECT has_table('public', 'role_permissions', 'role permissions exist');
SELECT has_table('public', 'user_role_assignments', 'user role assignments exist');

-- Mock users for RLS tests
-- Assuming an auth.users mock could be injected here, but for this basic suite, we'll verify the helper functions exist.
SELECT has_function('public', 'auth_user_branches', 'auth_user_branches function exists');

SELECT * FROM finish();
ROLLBACK;
