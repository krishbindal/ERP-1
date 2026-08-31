BEGIN;

SELECT plan(12);

-- Helper functions
CREATE FUNCTION get_org_id() RETURNS uuid LANGUAGE sql AS $$ SELECT '11111111-1111-1111-1111-111111111111'::uuid $$;
CREATE FUNCTION get_branch_1() RETURNS uuid LANGUAGE sql AS $$ SELECT '33333333-3333-3333-3333-333333333333'::uuid $$;
CREATE FUNCTION get_branch_2() RETURNS uuid LANGUAGE sql AS $$ SELECT '44444444-4444-4444-4444-444444444444'::uuid $$;
CREATE FUNCTION get_admin_a1() RETURNS uuid LANGUAGE sql AS $$ SELECT '99999999-9999-9999-9999-999999999999'::uuid $$;
CREATE FUNCTION get_admin_a2() RETURNS uuid LANGUAGE sql AS $$ SELECT 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid $$;
CREATE FUNCTION get_teacher_a1() RETURNS uuid LANGUAGE sql AS $$ SELECT 'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid $$;
CREATE FUNCTION get_role_branch_admin() RETURNS uuid LANGUAGE sql AS $$ SELECT '11111111-2222-3333-4444-555555555555'::uuid $$;
CREATE FUNCTION get_role_teacher() RETURNS uuid LANGUAGE sql AS $$ SELECT '33333333-2222-3333-4444-555555555555'::uuid $$;

-- 1. Setup Mock Data
INSERT INTO organizations (id, name, status) VALUES 
(get_org_id(), 'Test Org A', 'ACTIVE') ON CONFLICT DO NOTHING;

INSERT INTO branches (id, organization_id, name, status) VALUES 
(get_branch_1(), get_org_id(), 'Branch A1', 'ACTIVE'), 
(get_branch_2(), get_org_id(), 'Branch A2', 'ACTIVE') ON CONFLICT DO NOTHING;

INSERT INTO roles (id, organization_id, name) VALUES 
(get_role_branch_admin(), get_org_id(), 'branchadmin'),
(get_role_teacher(), get_org_id(), 'teacher') ON CONFLICT DO NOTHING;

-- Admins
INSERT INTO auth.users (id, email, instance_id, aud, role, encrypted_password) VALUES 
(get_admin_a1(), 'admin.a1@test.com', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', '...'),
(get_admin_a2(), 'admin.a2@test.com', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', '...'),
(get_teacher_a1(), 'teacher.a1@test.com', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', '...')
ON CONFLICT DO NOTHING;

INSERT INTO organization_memberships (user_id, organization_id) VALUES 
(get_admin_a1(), get_org_id()),
(get_admin_a2(), get_org_id()),
(get_teacher_a1(), get_org_id())
ON CONFLICT DO NOTHING;

INSERT INTO branch_memberships (id, user_id, branch_id) VALUES 
('11111111-1111-1111-1111-111111111111', get_admin_a1(), get_branch_1()),
('22222222-2222-2222-2222-222222222222', get_admin_a2(), get_branch_2()),
('33333333-3333-3333-3333-333333333333', get_teacher_a1(), get_branch_1())
ON CONFLICT DO NOTHING;

INSERT INTO user_role_assignments (branch_membership_id, role_id) VALUES 
('11111111-1111-1111-1111-111111111111', get_role_branch_admin()),
('22222222-2222-2222-2222-222222222222', get_role_branch_admin()),
('33333333-3333-3333-3333-333333333333', get_role_teacher())
ON CONFLICT DO NOTHING;

-- 2. Test configuration of sequences by Admin
SELECT set_config('request.jwt.claims', format('{"sub": "%s", "role": "authenticated"}', get_admin_a1()), true);
SELECT set_config('role', 'authenticated', true);

SELECT lives_ok(
    $$
    INSERT INTO public.identifier_sequences (organization_id, branch_id, entity_type, prefix, padding_length)
    VALUES ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'student_code', 'STU-', 4)
    $$,
    'Admin A1 can create a sequence for Branch A1'
);

-- Test uniqueness constraint
SELECT throws_ok(
    $$
    INSERT INTO public.identifier_sequences (organization_id, branch_id, entity_type, prefix, padding_length)
    VALUES ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'student_code', 'STU2-', 4)
    $$,
    '23505',
    NULL,
    'Cannot create duplicate sequence configuration for same context'
);

-- 3. Test Unauthorized Configuration
SELECT set_config('request.jwt.claims', format('{"sub": "%s", "role": "authenticated"}', get_teacher_a1()), true);
SELECT throws_ok(
    $$
    INSERT INTO public.identifier_sequences (organization_id, branch_id, entity_type, prefix, padding_length)
    VALUES ('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'invoice_code', 'INV-', 6)
    $$,
    '42501',
    NULL,
    'Teacher cannot configure sequences'
);

-- 4. Test Valid Generation
-- Ensure Teacher has generation access (since they can create entities, they can use the engine via SECURITY DEFINER)
SELECT is(
    public.generate_business_identifier('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', NULL, 'student_code'),
    'STU-0001',
    'Identifier generated correctly with padding and prefix'
);

SELECT is(
    public.generate_business_identifier('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', NULL, 'student_code'),
    'STU-0002',
    'Identifier increments correctly on subsequent call'
);

-- 5. Test Missing Configuration
SELECT throws_ok(
    $$
    SELECT public.generate_business_identifier('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', NULL, 'missing_entity')
    $$,
    'P0001',
    'Sequence not configured for entity missing_entity',
    'Throws error when sequence is missing'
);

-- 6. Test Organization Isolation
-- If user doesn't belong to organization, they cannot generate
SELECT set_config('request.jwt.claims', format('{"sub": "%s", "role": "authenticated"}', '00000000-0000-0000-0000-000000000000'), true);
SELECT throws_ok(
    $$
    SELECT public.generate_business_identifier('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', NULL, 'student_code')
    $$,
    'P0001',
    'Unauthorized: cannot generate identifier for this organization',
    'User outside organization cannot generate identifiers'
);

-- Restore admin 1
SELECT set_config('request.jwt.claims', format('{"sub": "%s", "role": "authenticated"}', get_admin_a1()), true);

-- 7. Test Concurrency and Deadlocks
-- Since pgTAP runs in a single connection, we can't do true parallel transactions inside one test block,
-- but we can test the behavior of rollback gaps.
SAVEPOINT before_generate;
SELECT is(
    public.generate_business_identifier('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', NULL, 'student_code'),
    'STU-0003',
    'Identifier generates 0003 inside savepoint'
);
ROLLBACK TO SAVEPOINT before_generate;

SELECT is(
    public.generate_business_identifier('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', NULL, 'student_code'),
    'STU-0003',
    'Wait, rolling back a savepoint rolls back the sequence update because it is transactional!'
);
-- NOTE: In Postgres, standard sequences (CREATE SEQUENCE) are outside transaction scope, so rollbacks cause gaps.
-- Our identifier engine uses a TABLE (UPDATE ... RETURNING) which IS transactional!
-- This means if the transaction rolls back, the sequence update rolls back too! No gaps from rollbacks!
-- Wait, if it's transactional, it holds a lock until transaction end. This means concurrent generation
-- will wait for the lock. This is perfectly safe and ensures NO gaps and NO duplicates.

-- Wait, let's verify if that's what happens. The test above checks this.
-- If the savepoint rolls back, the UPDATE on identifier_sequences rolls back, so the next call should get 0003 again.

-- 8. Test Global (Org-level) Sequences
SELECT lives_ok(
    $$
    INSERT INTO public.identifier_sequences (organization_id, branch_id, entity_type, prefix, padding_length)
    VALUES ('11111111-1111-1111-1111-111111111111', NULL, 'invoice', 'GLOBAL-INV-', 5)
    $$,
    'Can create global sequence (branch_id IS NULL)'
);

SELECT is(
    public.generate_business_identifier('11111111-1111-1111-1111-111111111111', NULL, NULL, 'invoice'),
    'GLOBAL-INV-00001',
    'Generates correctly for global sequence'
);

-- 9. Test Service Role execution
SELECT set_config('request.jwt.claims', format('{"role": "service_role"}'), true);
SELECT set_config('role', 'service_role', true);

SELECT lives_ok(
    $$
    SELECT public.generate_business_identifier('11111111-1111-1111-1111-111111111111', NULL, NULL, 'invoice')
    $$,
    'Service role can generate identifier without organization membership'
);

SELECT * FROM finish();
ROLLBACK;
