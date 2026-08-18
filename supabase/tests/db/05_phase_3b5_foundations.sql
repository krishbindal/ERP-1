BEGIN;

SELECT plan(20);

CREATE FUNCTION get_org_id() RETURNS uuid LANGUAGE sql AS $$ SELECT '11111111-1111-1111-1111-111111111111'::uuid $$;
CREATE FUNCTION get_branch_1() RETURNS uuid LANGUAGE sql AS $$ SELECT '33333333-3333-3333-3333-333333333333'::uuid $$;
CREATE FUNCTION get_branch_2() RETURNS uuid LANGUAGE sql AS $$ SELECT '44444444-4444-4444-4444-444444444444'::uuid $$;
CREATE FUNCTION get_admin_a1() RETURNS uuid LANGUAGE sql AS $$ SELECT '99999999-9999-9999-9999-999999999999'::uuid $$;
CREATE FUNCTION get_admin_a2() RETURNS uuid LANGUAGE sql AS $$ SELECT 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid $$;
CREATE FUNCTION get_guardian_a1() RETURNS uuid LANGUAGE sql AS $$ SELECT 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid $$;
CREATE FUNCTION get_role_branch_admin() RETURNS uuid LANGUAGE sql AS $$ SELECT '11111111-2222-3333-4444-555555555555'::uuid $$;
CREATE FUNCTION get_student_a() RETURNS uuid LANGUAGE sql AS $$ SELECT 'aaaaaaaa-0000-0000-0000-000000000000'::uuid $$;
CREATE FUNCTION get_student_b() RETURNS uuid LANGUAGE sql AS $$ SELECT 'bbbbbbbb-0000-0000-0000-000000000000'::uuid $$;
CREATE FUNCTION get_student_a_profile() RETURNS uuid LANGUAGE sql AS $$ SELECT 'aaaaaaaa-1111-2222-3333-000000000000'::uuid $$;
CREATE FUNCTION get_enrollment_a() RETURNS uuid LANGUAGE sql AS $$ SELECT 'aaaaaaaa-1111-0000-0000-000000000000'::uuid $$;
CREATE FUNCTION get_stu_001() RETURNS text LANGUAGE sql AS $$ SELECT 'STU-001'::text $$;
CREATE FUNCTION get_status_active() RETURNS text LANGUAGE sql AS $$ SELECT 'ACTIVE'::text $$;


-- 1. Setup Mock Data
INSERT INTO organizations (id, name, status) VALUES 
(get_org_id(), 'Test Org A', get_status_active()) ON CONFLICT DO NOTHING;

INSERT INTO branches (id, organization_id, name, status) VALUES 
(get_branch_1(), get_org_id(), 'Branch A1', get_status_active()), 
(get_branch_2(), get_org_id(), 'Branch A2', get_status_active()) ON CONFLICT DO NOTHING;

INSERT INTO roles (id, organization_id, name) VALUES 
(get_role_branch_admin(), get_org_id(), 'Branch Admin') ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, email) VALUES 
(get_admin_a1(), 'admin_a1@test.com'),
(get_admin_a2(), 'admin_a2@test.com'),
(get_guardian_a1(), 'guardian_a1@test.com') ON CONFLICT DO NOTHING;

INSERT INTO profiles (id, first_name, last_name) VALUES 
(get_admin_a1(), 'Admin', 'A1'),
(get_admin_a2(), 'Admin', 'A2'),
(get_guardian_a1(), 'Guardian', 'A1') ON CONFLICT DO NOTHING;

INSERT INTO organization_memberships (id, user_id, organization_id) VALUES 
('12345678-0000-0000-0000-123456789012', get_admin_a1(), get_org_id()),
('12345678-0000-0000-0000-123456789013', get_admin_a2(), get_org_id()) ON CONFLICT DO NOTHING;

INSERT INTO branch_memberships (id, user_id, branch_id) VALUES 
('12345678-1234-1234-1234-123456789012', get_admin_a1(), get_branch_1()),
('12345678-1234-1234-1234-123456789013', get_admin_a2(), get_branch_2()) ON CONFLICT DO NOTHING;

INSERT INTO user_role_assignments (branch_membership_id, role_id) VALUES 
('12345678-1234-1234-1234-123456789012', get_role_branch_admin()),
('12345678-1234-1234-1234-123456789013', get_role_branch_admin()) ON CONFLICT DO NOTHING;

INSERT INTO guardians (id, organization_id, first_name, last_name, profile_id) VALUES
('cccccccc-cccc-cccc-cccc-cccccccccccc', get_org_id(), 'Guardian', 'A1', get_guardian_a1()) ON CONFLICT DO NOTHING;

-- Base student creation
SELECT set_config('role', 'postgres', true);
SELECT set_config('request.jwt.claims', '{"sub": "99999999-9999-9999-9999-999999999999"}', true);
SELECT set_config('role', 'authenticated', true);

SELECT create_student_with_initial_placement(get_org_id(), get_branch_1(), 'Branch', 'One');
-- Find the student id
DO $DO_BLOCK$
DECLARE
    v_student_id UUID;
    v_profile_id UUID;
BEGIN
    SELECT id INTO v_student_id FROM public.students WHERE first_name = 'Branch' AND last_name = 'One' LIMIT 1;
    -- Link guardian
    INSERT INTO public.student_guardians (student_id, guardian_id, relationship) VALUES (v_student_id, 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Parent') ON CONFLICT DO NOTHING;
END $DO_BLOCK$;

-- Test 1-5: Student Branch Profiles constraints and RLS
SELECT set_config('role', 'postgres', true);
SELECT set_config('request.jwt.claims', '{"sub": "99999999-9999-9999-9999-999999999999"}', true); -- Admin A1
SELECT set_config('role', 'authenticated', true);

-- Update the student local id for the branch one student
UPDATE public.student_branch_profiles SET student_id_local = get_stu_001() WHERE branch_id = get_branch_1();
SELECT is((SELECT COUNT(*) FROM student_branch_profiles WHERE student_id_local = get_stu_001()), 1::bigint, 'Admin A1 can update local ID in their branch');

-- Try to create another profile with same local ID in the SAME branch (should fail)
SELECT throws_ok(
    'INSERT INTO student_branch_profiles (student_id, branch_id, student_id_local) VALUES (gen_random_uuid(), get_branch_1(), get_stu_001())',
    '23505',
    NULL,
    'Duplicate student_id_local in the SAME branch is rejected'
);

-- Test 6-8: Cross-branch isolation for profiles
SELECT set_config('role', 'postgres', true);
SELECT set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}', true); -- Admin A2
SELECT set_config('role', 'authenticated', true);

-- Admin A2 creates student in A2
SELECT create_student_with_initial_placement(get_org_id(), get_branch_2(), 'Branch', 'Two');

-- Update the local id to STU-001 in Branch A2. This SHOULD succeed because it's a different branch!
UPDATE public.student_branch_profiles SET student_id_local = get_stu_001() WHERE branch_id = get_branch_2();
SELECT is((SELECT COUNT(*) FROM student_branch_profiles WHERE student_id_local = get_stu_001()), 1::bigint, 'Duplicate student_id_local in a DIFFERENT branch is allowed and only 1 visible to Admin A2');

-- Try to read profiles from A1 as A2
SELECT is((SELECT COUNT(*) FROM student_branch_profiles WHERE branch_id = get_branch_1()), 0::bigint, 'Admin A2 cannot see profiles in Branch A1');

-- Try to insert into A1 as A2
SELECT throws_ok(
    'INSERT INTO student_branch_profiles (student_id, branch_id) VALUES (gen_random_uuid(), get_branch_1())',
    '42501',
    NULL,
    'Admin A2 cannot insert profile into Branch A1'
);

-- Try to update branch_id (reassignment attack)
SELECT throws_ok(
    'UPDATE student_branch_profiles SET branch_id = get_branch_1() WHERE branch_id = get_branch_2()',
    'P0001',
    NULL,
    'Cannot reassign branch_id for student_branch_profiles'
);

-- Test 9-16: Audit Logs
SELECT set_config('role', 'postgres', true);
SELECT set_config('request.jwt.claims', '{"sub": "99999999-9999-9999-9999-999999999999"}', true); -- Admin A1
SELECT set_config('role', 'authenticated', true);
SELECT set_config('request.reason', 'Testing Audit Update', true);

-- Trigger an update
UPDATE enrollments SET status = 'TRANSFERRED' WHERE branch_id = get_branch_1();
SELECT is((SELECT COUNT(*) FROM audit_logs WHERE table_name = 'enrollments' AND action = 'UPDATE' AND reason = 'Testing Audit Update'), 1::bigint, 'Audit log created for enrollment update with reason');
SELECT is((SELECT actor_id FROM audit_logs WHERE table_name = 'enrollments' AND action = 'UPDATE' LIMIT 1), get_admin_a1()::UUID, 'Actor ID is recorded correctly');
SELECT is((SELECT (old_data->>'status') FROM audit_logs WHERE table_name = 'enrollments' AND action = 'UPDATE' LIMIT 1), get_status_active(), 'old_data JSONB is recorded correctly');
SELECT is((SELECT (new_data->>'status') FROM audit_logs WHERE table_name = 'enrollments' AND action = 'UPDATE' LIMIT 1), 'TRANSFERRED', 'new_data JSONB is recorded correctly');

-- Verify ordinary users cannot modify audit logs
SELECT throws_ok(
    'DELETE FROM audit_logs',
    '42501',
    NULL,
    'Ordinary user cannot delete audit logs'
);
SELECT throws_ok(
    'INSERT INTO audit_logs (table_name, record_id, action) VALUES (''fake'', gen_random_uuid(), ''INSERT'')',
    '42501',
    NULL,
    'Ordinary user cannot insert fake audit logs'
);

-- Test 17-21: User Credentials RLS
INSERT INTO user_credentials (username, profile_id, role_id, branch_id) VALUES ('admin_a1', get_admin_a1(), get_role_branch_admin(), get_branch_1());
SELECT is((SELECT COUNT(*) FROM user_credentials), 1::bigint, 'Branch Admin can see credentials in their branch');

SELECT throws_ok(
    'UPDATE user_credentials SET branch_id = get_branch_2()',
    'P0001',
    NULL,
    'Cannot reassign branch_id for user_credentials'
);

SELECT set_config('role', 'postgres', true);
SELECT set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}', true); -- Admin A2
SELECT set_config('role', 'authenticated', true);

SELECT is((SELECT COUNT(*) FROM user_credentials), 0::bigint, 'Admin A2 cannot see credentials in Branch A1');
SELECT throws_ok(
    'INSERT INTO user_credentials (username, profile_id, role_id, branch_id) VALUES (''admin_a1_fake'', get_admin_a1(), get_role_branch_admin(), get_branch_1())',
    '42501',
    NULL,
    'Admin A2 cannot insert credentials into Branch A1'
);

-- Test 22-31: Guardian Authorization (Self-access)
SELECT set_config('role', 'postgres', true);
SELECT set_config('request.jwt.claims', '{"sub": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"}', true); -- Guardian A1
SELECT set_config('role', 'authenticated', true);

SELECT is((SELECT COUNT(*) FROM guardians), 1::bigint, 'Guardian can see their own guardian record');
SELECT is((SELECT COUNT(*) FROM students), 1::bigint, 'Guardian can see their linked students');

-- Try to update student (Guardian has no UPDATE access)
SELECT results_eq('UPDATE students SET first_name = ''Hacked'' RETURNING id', ARRAY[]::uuid[], 'Guardian cannot update student record');

-- Try to update guardian (Guardian has no UPDATE access yet, only SELECT)
SELECT results_eq('UPDATE guardians SET first_name = ''Hacked'' RETURNING id', ARRAY[]::uuid[], 'Guardian cannot update guardian record');

SELECT * FROM finish();
ROLLBACK;


