BEGIN;

SELECT plan(23);

-- Setup Mock Data
INSERT INTO organizations (id, name, status) VALUES 
('11111111-1111-1111-1111-111111111111', 'Test Org A', 'ACTIVE'), 
('22222222-2222-2222-2222-222222222222', 'Test Org B', 'ACTIVE');

INSERT INTO branches (id, organization_id, name, status) VALUES 
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Branch A1', 'ACTIVE'), 
('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Branch A2', 'ACTIVE'), 
('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'Branch B1', 'ACTIVE');

INSERT INTO auth.users (id, email) VALUES 
('66666666-6666-6666-6666-666666666666', 'sa@test.com'), 
('77777777-7777-7777-7777-777777777777', 'a1@test.com'), 
('88888888-8888-8888-8888-888888888888', 'b1@test.com'), 
('99999999-9999-9999-9999-999999999999', 'multi@test.com'), 
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'rev@test.com'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'susp@test.com');

INSERT INTO profiles (id, first_name, last_name, status) VALUES 
('66666666-6666-6666-6666-666666666666', 'Super', 'Admin', 'ACTIVE'),
('77777777-7777-7777-7777-777777777777', 'User', 'A1', 'ACTIVE'),
('88888888-8888-8888-8888-888888888888', 'User', 'B1', 'ACTIVE'),
('99999999-9999-9999-9999-999999999999', 'Multi', 'User', 'ACTIVE'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Rev', 'User', 'ACTIVE'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Susp', 'User', 'SUSPENDED');

-- Memberships
INSERT INTO organization_memberships (id, organization_id, user_id, status) VALUES 
('11111111-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'ACTIVE'),
('22222222-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', '77777777-7777-7777-7777-777777777777', 'ACTIVE'),
('33333333-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888888', 'ACTIVE'),
('44444444-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999999', 'ACTIVE'),
('55555555-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ACTIVE'),
('66666666-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'SUSPENDED');

INSERT INTO branch_memberships (id, branch_id, user_id, status) VALUES 
('11111111-1111-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', '77777777-7777-7777-7777-777777777777', 'ACTIVE'),
('22222222-2222-0000-0000-000000000000', '55555555-5555-5555-5555-555555555555', '88888888-8888-8888-8888-888888888888', 'ACTIVE'),
('33333333-3333-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', '99999999-9999-9999-9999-999999999999', 'ACTIVE'), 
('44444444-4444-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444', '99999999-9999-9999-9999-999999999999', 'ACTIVE'),
('55555555-5555-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ACTIVE'),
('66666666-6666-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'SUSPENDED');

-- Switch to authenticated role for RLS tests
SET ROLE authenticated;

-- Organization Isolation
SELECT set_config('request.jwt.claims', '{"sub":"77777777-7777-7777-7777-777777777777"}', true);
SELECT results_eq('SELECT id FROM organizations', ARRAY['11111111-1111-1111-1111-111111111111'::uuid], '1. User in Org A can access Org A');
SELECT is_empty('SELECT id FROM organizations WHERE id = ''22222222-2222-2222-2222-222222222222''', '2. User in Org A cannot access Org B');

-- Branch Isolation
SELECT set_config('request.jwt.claims', '{"sub":"77777777-7777-7777-7777-777777777777"}', true);
SELECT results_eq('SELECT id FROM branches', ARRAY['33333333-3333-3333-3333-333333333333'::uuid], '3. Branch A user can access Branch A');
SELECT is_empty('SELECT id FROM branches WHERE id = ''44444444-4444-4444-4444-444444444444''', '4. Branch A user cannot access Branch B');

SELECT set_config('request.jwt.claims', '{"sub":"88888888-8888-8888-8888-888888888888"}', true);
SELECT is_empty('SELECT id FROM branches WHERE id = ''33333333-3333-3333-3333-333333333333''', '5. Branch B user cannot access Branch A');

-- Multi-branch
SELECT set_config('request.jwt.claims', '{"sub":"99999999-9999-9999-9999-999999999999"}', true);
SELECT results_eq('SELECT id FROM branches ORDER BY id', ARRAY['33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid], '6/7. A+B user can read A and B');
SELECT is_empty('SELECT id FROM branches WHERE id = ''55555555-5555-5555-5555-555555555555''', '8. A+B user cannot read C');

-- Super Admin
SELECT set_config('request.jwt.claims', '{"sub":"66666666-6666-6666-6666-666666666666", "app_metadata": {"is_super_admin": true}}', true);
SELECT results_eq('SELECT id FROM branches ORDER BY id', ARRAY['33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid], '9. Super Admin can access all branches in authorized Org A');
SELECT is_empty('SELECT id FROM organizations WHERE id = ''22222222-2222-2222-2222-222222222222''', '10a. Super Admin cannot access Org B');
SELECT is_empty('SELECT id FROM branches WHERE id = ''55555555-5555-5555-5555-555555555555''', '10b. Super Admin cannot access Org B branches');

-- Revocation
SET ROLE postgres;
UPDATE branch_memberships SET status = 'ARCHIVED' WHERE user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
SET ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}', true);
SELECT is_empty('SELECT id FROM branches', '11. Revoked branch membership loses access');

SET ROLE postgres;
UPDATE organization_memberships SET status = 'ARCHIVED' WHERE user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
SET ROLE authenticated;
SELECT is_empty('SELECT id FROM organizations', '12. Revoked organization membership loses access');

-- Suspension
SELECT set_config('request.jwt.claims', '{"sub":"bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"}', true);
SELECT is_empty('SELECT id FROM organizations', '13. Suspended user is denied access to organizations');

-- Privilege Escalation
SELECT set_config('request.jwt.claims', '{"sub":"77777777-7777-7777-7777-777777777777"}', true);
-- Try to escalate to super admin (Not possible via query, but testing that they can't insert into user_role_assignments)
SELECT throws_ok('INSERT INTO user_role_assignments (branch_membership_id, role_id) VALUES (''11111111-1111-0000-0000-000000000000'', ''11111111-1111-1111-1111-111111111111'')', '42501', 'new row violates row-level security policy for table "user_role_assignments"', '15/17. User cannot assign unauthorized privileged role');
-- Note: 'permission denied for table' would mean lack of GRANT. 'violates row-level security policy' means RLS blocked it.

SELECT throws_ok('INSERT INTO branch_memberships (branch_id, user_id) VALUES (''55555555-5555-5555-5555-555555555555'', ''77777777-7777-7777-7777-777777777777'')', '42501', 'new row violates row-level security policy for table "branch_memberships"', '16. User cannot give self unauthorized branch membership');

-- Ownership tampering
-- Ordinary user tries to update, RLS blocks it by making the row invisible for UPDATE (0 rows affected). We test this by trying to update and checking it didn't change.
UPDATE branches SET organization_id = '22222222-2222-2222-2222-222222222222' WHERE id = '33333333-3333-3333-3333-333333333333';
SELECT results_eq('SELECT organization_id FROM branches WHERE id = ''33333333-3333-3333-3333-333333333333''', ARRAY['11111111-1111-1111-1111-111111111111'::uuid], '18. Cannot change organization ownership (User, silent 0 rows affected)');

-- As Super Admin
SELECT set_config('request.jwt.claims', '{"sub":"66666666-6666-6666-6666-666666666666", "app_metadata": {"is_super_admin": true}}', true);
SELECT throws_ok('UPDATE branches SET organization_id = ''22222222-2222-2222-2222-222222222222'' WHERE id = ''33333333-3333-3333-3333-333333333333''', '42501', 'new row violates row-level security policy for table "branches"', '18b. Cannot change organization ownership (Super Admin to Unauthorized Org)');

SELECT throws_ok('INSERT INTO branch_memberships (branch_id, user_id) VALUES (''55555555-5555-5555-5555-555555555555'', ''66666666-6666-6666-6666-666666666666'')', '42501', 'new row violates row-level security policy for table "branch_memberships"', '20. Cannot create unauthorized branch membership');

-- Structural checks
SELECT policies_are('organizations', ARRAY['Organizations are viewable by members or super admins', 'Super Admins can update their organizations'], '22. Organizations has correct policies');
SELECT policies_are('branches', ARRAY['Branches are viewable by members or super admins', 'Super Admins can insert branches in their organizations', 'Super Admins can update branches in their organizations'], '23. Branches has correct policies');
SELECT policies_are('branch_memberships', ARRAY['Branch Memberships are viewable by self or super admin', 'Super Admins can insert branch memberships', 'Super Admins can update branch memberships'], '24. Branch Memberships has correct policies');
SELECT policies_are('profiles', ARRAY['Profiles are viewable by self', 'Users can update their own profile'], '25. Profiles has correct policies');
SELECT policies_are('organization_memberships', ARRAY['Org Memberships are viewable by self or super admin'], '26. Organization Memberships has correct policies');

SELECT * FROM finish();
ROLLBACK;
