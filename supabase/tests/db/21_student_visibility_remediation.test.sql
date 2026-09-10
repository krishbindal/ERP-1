BEGIN;

SELECT plan(9);

-- Set up test data
\set org1 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01'

\set branch1 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02'
\set branch2 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee03'

-- users
\set superadmin 'eeeeeeee-eeee-eeee-eeee-eeeeeeeea000'
\set branch1admin 'eeeeeeee-eeee-eeee-eeee-eeeeeeeea001'
\set branch2admin 'eeeeeeee-eeee-eeee-eeee-eeeeeeeea005'

INSERT INTO auth.users (id, email) VALUES (:'branch1admin', 'b1@test.com'), (:'branch2admin', 'b2@test.com') ON CONFLICT DO NOTHING;
INSERT INTO public.profiles (id, first_name, last_name) VALUES (:'branch1admin', 'B1', 'Admin'), (:'branch2admin', 'B2', 'Admin') ON CONFLICT DO NOTHING;
INSERT INTO public.branch_memberships (id, branch_id, user_id, status) VALUES (gen_random_uuid(), :'branch1', :'branch1admin', 'ACTIVE'), (gen_random_uuid(), :'branch2', :'branch2admin', 'ACTIVE') ON CONFLICT DO NOTHING;

-- Clear out potential previous state
DELETE FROM public.students WHERE first_name LIKE 'VisTest%';

-- We'll create students directly avoiding the RPC to manually control states
-- S1: branch1 profile, NO enrollment
\set student1 'ccccccc1-cccc-cccc-cccc-cccccccccccc'
INSERT INTO public.students (id, organization_id, first_name, last_name) VALUES (:'student1', :'org1', 'VisTest1', 'NoEnrollment');
INSERT INTO public.student_branch_profiles (id, student_id, branch_id) VALUES ('bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbbb', :'student1', :'branch1');

-- S2: branch1 profile, WITH enrollment
\set student2 'ccccccc2-cccc-cccc-cccc-cccccccccccc'
INSERT INTO public.students (id, organization_id, first_name, last_name) VALUES (:'student2', :'org1', 'VisTest2', 'WithEnrollment');
INSERT INTO public.student_branch_profiles (id, student_id, branch_id) VALUES ('bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbbb', :'student2', :'branch1');
INSERT INTO public.enrollments (id, organization_id, branch_id, student_id, student_branch_profile_id, academic_year_id, class_id, section_id, status)
VALUES (gen_random_uuid(), :'org1', :'branch1', :'student2', 'bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-2222-2222-2222-222222222222', 'aaaaaaaa-3333-3333-3333-333333333333', 'ACTIVE');

-- S3: branch2 profile, NO enrollment
\set student3 'ccccccc3-cccc-cccc-cccc-cccccccccccc'
INSERT INTO public.students (id, organization_id, first_name, last_name) VALUES (:'student3', :'org1', 'VisTest3', 'Branch2NoEnrollment');
INSERT INTO public.student_branch_profiles (id, student_id, branch_id) VALUES ('bbbbbbb3-bbbb-bbbb-bbbb-bbbbbbbbbbbb', :'student3', :'branch2');

-- Test 1: Branch Admin 1
SELECT set_config('role', 'authenticated', true);
SELECT set_config('request.jwt.claims', '{"sub": "' || :'branch1admin' || '", "app_metadata": {"role": "branchadmin"}}', true);

SELECT results_eq(
    $$ SELECT id FROM public.students WHERE first_name LIKE 'VisTest%' $$,
    ARRAY['ccccccc1-cccc-cccc-cccc-cccccccccccc'::uuid, 'ccccccc2-cccc-cccc-cccc-cccccccccccc'::uuid],
    'Branch 1 Admin can see S1 (no enrollment) and S2 (with enrollment)'
);

SELECT results_eq(
    $$ SELECT id FROM public.student_branch_profiles WHERE student_id IN ('ccccccc1-cccc-cccc-cccc-cccccccccccc'::uuid, 'ccccccc2-cccc-cccc-cccc-cccccccccccc'::uuid, 'ccccccc3-cccc-cccc-cccc-cccccccccccc'::uuid) $$,
    ARRAY['bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, 'bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid],
    'Branch 1 Admin can only see branch 1 profiles'
);

SELECT lives_ok(
    $$ UPDATE public.students SET last_name = 'Updated1' WHERE id = 'ccccccc1-cccc-cccc-cccc-cccccccccccc'::uuid $$,
    'Branch 1 Admin can update S1 despite no enrollment'
);

-- Branch 1 Admin tries to update S3 (Branch 2)
UPDATE public.students SET last_name = 'Fail' WHERE id = 'ccccccc3-cccc-cccc-cccc-cccccccccccc'::uuid;

-- We switch to postgres to verify it didn't update (since branch1 admin can't even see it)
SELECT set_config('role', 'postgres', true);
SELECT results_eq(
    $$ SELECT last_name FROM public.students WHERE id = 'ccccccc3-cccc-cccc-cccc-cccccccccccc'::uuid $$,
    ARRAY['Branch2NoEnrollment'::text],
    'Branch 1 Admin cannot update S3 in Branch 2'
);
SELECT set_config('role', 'authenticated', true);
SELECT set_config('request.jwt.claims', '{"sub": "' || :'branch1admin' || '", "app_metadata": {"role": "branchadmin"}}', true);

-- Test 2: Branch Admin 2
SELECT set_config('request.jwt.claims', '{"sub": "' || :'branch2admin' || '", "app_metadata": {"role": "branchadmin"}}', true);

SELECT results_eq(
    $$ SELECT id FROM public.students WHERE first_name LIKE 'VisTest%' $$,
    ARRAY['ccccccc3-cccc-cccc-cccc-cccccccccccc'::uuid],
    'Branch 2 Admin can only see S3'
);

SELECT lives_ok(
    $$ UPDATE public.students SET last_name = 'Updated3' WHERE id = 'ccccccc3-cccc-cccc-cccc-cccccccccccc'::uuid $$,
    'Branch 2 Admin can update S3'
);

-- Reset to Super Admin to test guardians setup
SELECT set_config('role', 'postgres', true);

\set guardian 'dddddddd-dddd-dddd-dddd-dddddddddddd'
INSERT INTO public.guardians (id, organization_id, first_name, last_name, phone, email) 
VALUES (:'guardian', :'org1', 'Guardian', 'Test', '+1234567890', 'test@test.com');

INSERT INTO public.student_guardians (student_id, guardian_id, relationship) VALUES (:'student1', :'guardian', 'FATHER');

-- Back to Branch Admin 1
SELECT set_config('role', 'authenticated', true);
SELECT set_config('request.jwt.claims', '{"sub": "' || :'branch1admin' || '", "app_metadata": {"role": "branchadmin"}}', true);

SELECT results_eq(
    $$ SELECT guardian_id FROM public.student_guardians WHERE student_id = 'ccccccc1-cccc-cccc-cccc-cccccccccccc'::uuid $$,
    ARRAY['dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid],
    'Branch 1 Admin can see student_guardians for S1 (no enrollment)'
);

SELECT results_eq(
    $$ SELECT id FROM public.guardians WHERE id = 'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid $$,
    ARRAY['dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid],
    'Branch 1 Admin can see guardian for S1 (no enrollment)'
);

SELECT lives_ok(
    $$ UPDATE public.guardians SET last_name = 'TestUpdated' WHERE id = 'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid $$,
    'Branch 1 Admin can update guardian for S1'
);

SELECT * FROM finish();
ROLLBACK;
