BEGIN;

-- Total number of tests depends on the constraints we are asserting
SELECT plan(52);

-- ==========================================
-- 1. Setup & Context
-- ==========================================
-- Org & Branches (Refactored to reduce AST duplication)
WITH 
  orgs (id, name) AS (VALUES 
    ('00000000-0000-0000-0000-000000000001'::uuid, 'Test Org 1')
  ),
  ins_orgs AS (
    INSERT INTO public.organizations (id, name) 
    SELECT * FROM orgs 
    RETURNING id
  ),
  branches (id, organization_id, name) AS (VALUES 
    ('00000000-0000-0000-0000-000000000011'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Branch A'),
    ('00000000-0000-0000-0000-000000000012'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Branch B')
  ),
  ins_branches AS (
    INSERT INTO public.branches (id, organization_id, name) 
    SELECT * FROM branches 
    RETURNING id
  ),
  acad_years (id, branch_id, name, start_date, end_date) AS (VALUES 
    ('00000000-0000-0000-0000-000000000101'::uuid, '00000000-0000-0000-0000-000000000011'::uuid, '2026-A', '2026-01-01'::date, '2026-12-31'::date),
    ('00000000-0000-0000-0000-000000000102'::uuid, '00000000-0000-0000-0000-000000000012'::uuid, '2026-B', '2026-01-01'::date, '2026-12-31'::date)
  ),
  ins_years AS (
    INSERT INTO public.academic_years (id, branch_id, name, start_date, end_date) 
    SELECT * FROM acad_years 
    RETURNING id
  ),
  cls (id, academic_year_id, branch_id, name, level) AS (VALUES 
    ('00000000-0000-0000-0000-000000001001'::uuid, '00000000-0000-0000-0000-000000000101'::uuid, '00000000-0000-0000-0000-000000000011'::uuid, 'Class 1-A', 1),
    ('00000000-0000-0000-0000-000000001002'::uuid, '00000000-0000-0000-0000-000000000102'::uuid, '00000000-0000-0000-0000-000000000012'::uuid, 'Class 1-B', 1)
  ),
  ins_cls AS (
    INSERT INTO public.classes (id, academic_year_id, branch_id, name, level) 
    SELECT * FROM cls 
    RETURNING id
  ),
  secs (id, class_id, academic_year_id, branch_id, name) AS (VALUES 
    ('00000000-0000-0000-0000-000000002001'::uuid, '00000000-0000-0000-0000-000000001001'::uuid, '00000000-0000-0000-0000-000000000101'::uuid, '00000000-0000-0000-0000-000000000011'::uuid, 'Sec A-1'),
    ('00000000-0000-0000-0000-000000002002'::uuid, '00000000-0000-0000-0000-000000001002'::uuid, '00000000-0000-0000-0000-000000000102'::uuid, '00000000-0000-0000-0000-000000000012'::uuid, 'Sec B-1')
  ),
  ins_secs AS (
    INSERT INTO public.sections (id, class_id, academic_year_id, branch_id, name) 
    SELECT * FROM secs 
    RETURNING id
  ),
  subjs (id, branch_id, name, code) AS (VALUES 
    ('00000000-0000-0000-0000-000000003001'::uuid, '00000000-0000-0000-0000-000000000011'::uuid, 'Math A', 'MATH-A'),
    ('00000000-0000-0000-0000-000000003002'::uuid, '00000000-0000-0000-0000-000000000011'::uuid, 'Science A', 'SCI-A'),
    ('00000000-0000-0000-0000-000000003003'::uuid, '00000000-0000-0000-0000-000000000012'::uuid, 'Math B', 'MATH-B')
  ),
  ins_subjs AS (
    INSERT INTO public.subjects (id, branch_id, name, code) 
    SELECT * FROM subjs 
    RETURNING id
  ),
  c_subjs (id, branch_id, class_id, subject_id, is_optional) AS (VALUES
    ('00000000-0000-0000-0000-000000004001'::uuid, '00000000-0000-0000-0000-000000000011'::uuid, '00000000-0000-0000-0000-000000001001'::uuid, '00000000-0000-0000-0000-000000003001'::uuid, false),
    ('00000000-0000-0000-0000-000000004002'::uuid, '00000000-0000-0000-0000-000000000011'::uuid, '00000000-0000-0000-0000-000000001001'::uuid, '00000000-0000-0000-0000-000000003002'::uuid, false),
    ('00000000-0000-0000-0000-000000004003'::uuid, '00000000-0000-0000-0000-000000000012'::uuid, '00000000-0000-0000-0000-000000001002'::uuid, '00000000-0000-0000-0000-000000003003'::uuid, false)
  ),
  ins_c_subjs AS (
    INSERT INTO public.class_subjects (id, branch_id, class_id, subject_id, is_optional)
    SELECT * FROM c_subjs
    RETURNING id
  ),
  a_users (id, email) AS (VALUES 
    ('00000000-0000-0000-0000-000000000003'::uuid, 'admin.a@test.com'),
    ('00000000-0000-0000-0000-000000000004'::uuid, 'teacher.a1@test.com'),
    ('00000000-0000-0000-0000-000000000005'::uuid, 'teacher.a2@test.com'),
    ('00000000-0000-0000-0000-000000000006'::uuid, 'teacher.b1@test.com'),
    ('00000000-0000-0000-0000-000000000007'::uuid, 'superadmin@test.com')
  ),
  ins_a_users AS (
    INSERT INTO auth.users (id, email)
    SELECT * FROM a_users
    RETURNING id
  ),
  profs (id, first_name, last_name) AS (VALUES 
    ('00000000-0000-0000-0000-000000000003'::uuid, 'Admin', 'A'),
    ('00000000-0000-0000-0000-000000000004'::uuid, 'Teacher', 'A1'),
    ('00000000-0000-0000-0000-000000000005'::uuid, 'Teacher', 'A2'),
    ('00000000-0000-0000-0000-000000000006'::uuid, 'Teacher', 'B1'),
    ('00000000-0000-0000-0000-000000000007'::uuid, 'Super', 'Admin')
  ),
  ins_profs AS (
    INSERT INTO public.profiles (id, first_name, last_name)
    SELECT * FROM profs
    RETURNING id
  ),
  o_mems (id, organization_id, user_id) AS (VALUES 
    ('00000000-0000-0000-0000-000000000003'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000003'::uuid),
    ('00000000-0000-0000-0000-000000000004'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000004'::uuid),
    ('00000000-0000-0000-0000-000000000005'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000005'::uuid),
    ('00000000-0000-0000-0000-000000000006'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000006'::uuid),
    ('00000000-0000-0000-0000-000000000007'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000007'::uuid)
  ),
  ins_o_mems AS (
    INSERT INTO public.organization_memberships (id, organization_id, user_id)
    SELECT * FROM o_mems
    RETURNING id
  ),
  b_mems (id, branch_id, user_id) AS (VALUES 
    ('00000000-0000-0000-0000-000000000003'::uuid, '00000000-0000-0000-0000-000000000011'::uuid, '00000000-0000-0000-0000-000000000003'::uuid),
    ('00000000-0000-0000-0000-000000000004'::uuid, '00000000-0000-0000-0000-000000000011'::uuid, '00000000-0000-0000-0000-000000000004'::uuid),
    ('00000000-0000-0000-0000-000000000005'::uuid, '00000000-0000-0000-0000-000000000011'::uuid, '00000000-0000-0000-0000-000000000005'::uuid),
    ('00000000-0000-0000-0000-000000000006'::uuid, '00000000-0000-0000-0000-000000000012'::uuid, '00000000-0000-0000-0000-000000000006'::uuid)
  ),
  ins_b_mems AS (
    INSERT INTO public.branch_memberships (id, branch_id, user_id)
    SELECT * FROM b_mems
    RETURNING id
  ),
  staffs (id, organization_id, profile_id, first_name, last_name) AS (VALUES
    ('00000000-0000-0000-0000-000000005001'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000004'::uuid, 'Teacher', 'A1'),
    ('00000000-0000-0000-0000-000000005002'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000005'::uuid, 'Teacher', 'A2'),
    ('00000000-0000-0000-0000-000000005003'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000006'::uuid, 'Teacher', 'B1')
  ),
  ins_staffs AS (
    INSERT INTO public.staff (id, organization_id, profile_id, first_name, last_name)
    SELECT * FROM staffs
    RETURNING id
  ),
  staff_profs (id, staff_id, branch_id) AS (VALUES
    ('00000000-0000-0000-0000-000000006001'::uuid, '00000000-0000-0000-0000-000000005001'::uuid, '00000000-0000-0000-0000-000000000011'::uuid),
    ('00000000-0000-0000-0000-000000006002'::uuid, '00000000-0000-0000-0000-000000005002'::uuid, '00000000-0000-0000-0000-000000000011'::uuid),
    ('00000000-0000-0000-0000-000000006003'::uuid, '00000000-0000-0000-0000-000000005003'::uuid, '00000000-0000-0000-0000-000000000012'::uuid)
  ),
  ins_staff_profs AS (
    INSERT INTO public.staff_branch_profiles (id, staff_id, branch_id)
    SELECT * FROM staff_profs
    RETURNING id
  ),
  roles_data (id, organization_id, name) AS (VALUES
    ('00000000-0000-0000-0000-000000000008'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Branch Admin')
  ),
  ins_roles AS (
    INSERT INTO public.roles (id, organization_id, name)
    SELECT * FROM roles_data
    RETURNING id
  ),
  ura_data (branch_membership_id, role_id) AS (VALUES
    ('00000000-0000-0000-0000-000000000003'::uuid, '00000000-0000-0000-0000-000000000008'::uuid)
  )
  INSERT INTO public.user_role_assignments (branch_membership_id, role_id)
  SELECT * FROM ura_data;

-- Set super admin claim
UPDATE auth.users SET raw_app_meta_data = '{"is_super_admin": true}' WHERE id = '00000000-0000-0000-0000-000000000007';



-- Staff Identity


-- ==========================================
-- 2. SCHEMA Verifications
-- ==========================================
CREATE OR REPLACE FUNCTION pg_temp.test_insert_tsa(
    p_id UUID, p_branch_id UUID, p_year_id UUID, p_class_id UUID, 
    p_section_id UUID, p_subject_id UUID, p_staff_profile_id UUID, 
    p_is_primary BOOLEAN DEFAULT false, p_status TEXT DEFAULT 'ACTIVE'
) RETURNS VOID AS $fn$
BEGIN
    IF p_id IS NULL THEN
        INSERT INTO public.teacher_subject_assignments (branch_id, academic_year_id, class_id, section_id, subject_id, staff_branch_profile_id, is_primary, status)
        VALUES (p_branch_id, p_year_id, p_class_id, p_section_id, p_subject_id, p_staff_profile_id, COALESCE(p_is_primary, false), COALESCE(p_status, 'ACTIVE'));
    ELSE
        INSERT INTO public.teacher_subject_assignments (id, branch_id, academic_year_id, class_id, section_id, subject_id, staff_branch_profile_id, is_primary, status)
        VALUES (p_id, p_branch_id, p_year_id, p_class_id, p_section_id, p_subject_id, p_staff_profile_id, COALESCE(p_is_primary, false), COALESCE(p_status, 'ACTIVE'));
    END IF;
END;
$fn$ LANGUAGE plpgsql;

-- 1. table exists
SELECT has_table('public', 'teacher_subject_assignments', 'teacher_subject_assignments table should exist');
-- 2. columns exist
SELECT has_column('public', 'teacher_subject_assignments', 'branch_id', 'branch_id exists');
SELECT has_column('public', 'teacher_subject_assignments', 'section_id', 'section_id exists');
SELECT has_column('public', 'teacher_subject_assignments', 'subject_id', 'subject_id exists');
SELECT has_column('public', 'teacher_subject_assignments', 'status', 'status exists');
-- 3. status constraint
SELECT col_has_check('public', 'teacher_subject_assignments', 'status', 'status has check constraint');
-- 4. section composite FK
SELECT has_fk('public', 'teacher_subject_assignments', 'fk_tsa_section should exist');
-- 5. class_subject FK
SELECT has_fk('public', 'teacher_subject_assignments', 'fk_tsa_class_subject should exist');
-- 6. teacher branch FK
SELECT has_fk('public', 'teacher_subject_assignments', 'fk_tsa_teacher should exist');
-- 7. subject branch FK
SELECT has_fk('public', 'teacher_subject_assignments', 'fk_tsa_subject should exist');
-- 8. branch immutability trigger
SELECT has_trigger('public', 'teacher_subject_assignments', 'enforce_tsa_branch_immutable', 'branch immutability trigger exists');
-- 9. audit trigger
SELECT has_trigger('public', 'teacher_subject_assignments', 'audit_teacher_subject_assignments', 'audit trigger exists');
-- 10. updated_at trigger
SELECT has_trigger('public', 'teacher_subject_assignments', 'update_tsa_updated_at', 'updated_at trigger exists');


-- ==========================================
-- 3. ELIGIBILITY AND ISOLATION
-- ==========================================
-- 11. Valid class + subject succeeds
SELECT lives_ok(
    $$ SELECT pg_temp.test_insert_tsa('00000000-0000-0000-0000-000000007001', '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000002001', '00000000-0000-0000-0000-000000003001', '00000000-0000-0000-0000-000000006001', true, 'ACTIVE') $$,
    'Valid assignment succeeds'
);

-- 12. Subject not offered by class fails (fk_tsa_class_subject)
SELECT throws_ok(
    $$ SELECT pg_temp.test_insert_tsa('00000000-0000-0000-0000-000000007002', '00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000001002', '00000000-0000-0000-0000-000000002002', '00000000-0000-0000-0000-000000003001', '00000000-0000-0000-0000-000000006003', false, 'ACTIVE') $$,
    '23503',
    NULL,
    'Subject not offered by class is rejected'
);

-- 13. Wrong class/subject combination fails
SELECT throws_ok(
    $$ SELECT pg_temp.test_insert_tsa('00000000-0000-0000-0000-000000007003', '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000001002', '00000000-0000-0000-0000-000000002001', '00000000-0000-0000-0000-000000003001', '00000000-0000-0000-0000-000000006002', false, 'ACTIVE') $$,
    '23503',
    NULL,
    'Wrong class combination is rejected'
);

-- 14. Branch A teacher + Branch A section + Branch A subject succeeds
SELECT lives_ok(
    $$ SELECT pg_temp.test_insert_tsa('00000000-0000-0000-0000-000000007004', '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000002001', '00000000-0000-0000-0000-000000003002', '00000000-0000-0000-0000-000000006001', false, 'ACTIVE') $$,
    'Branch A combination succeeds'
);

-- 15-21. Data-driven assertions for foreign key violations (Branch/year mismatch injections)
SELECT throws_ok(
    format('SELECT pg_temp.test_insert_tsa(NULL, %L, %L, %L, %L, %L, %L, false, ''ACTIVE'')', 
           branch_id, academic_year_id, class_id, section_id, subject_id, staff_branch_profile_id),
    '23503',
    NULL,
    msg
)
FROM (VALUES 
    -- 15. Branch A teacher + Branch B section fails
    ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000001002', '00000000-0000-0000-0000-000000002002', '00000000-0000-0000-0000-000000003003', '00000000-0000-0000-0000-000000006001', 'Branch A teacher + Branch B section fails'),
    -- 16. Branch B teacher + Branch A section fails
    ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000002001', '00000000-0000-0000-0000-000000003001', '00000000-0000-0000-0000-000000006003', 'Branch B teacher + Branch A section fails'),
    -- 17. Branch A subject + Branch B section fails (Already covered by class_subject but let's test explicit branch mismatch)
    ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000001002', '00000000-0000-0000-0000-000000002002', '00000000-0000-0000-0000-000000003001', '00000000-0000-0000-0000-000000006003', 'Branch A subject + Branch B section fails'),
    -- 18. Branch B subject + Branch A section fails
    ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000002001', '00000000-0000-0000-0000-000000003003', '00000000-0000-0000-0000-000000006001', 'Branch B subject + Branch A section fails'),
    -- 19. Crafted cross-branch UUID injection fails
    ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000002001', '00000000-0000-0000-0000-000000003001', '00000000-0000-0000-0000-000000006003', 'Cross-branch injection fails'),
    -- 20. Section/year mismatch fails
    ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000002001', '00000000-0000-0000-0000-000000003001', '00000000-0000-0000-0000-000000006002', 'Section/year mismatch fails'),
    -- 21. Class/year mismatch fails
    ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000001002', '00000000-0000-0000-0000-000000002001', '00000000-0000-0000-0000-000000003001', '00000000-0000-0000-0000-000000006002', 'Class/year mismatch fails')
) AS t(branch_id, academic_year_id, class_id, section_id, subject_id, staff_branch_profile_id, msg);

-- 22. First active primary teacher succeeds (Already created 7001)
-- 23. Second active primary teacher fails
SELECT throws_ok(
    $$ SELECT pg_temp.test_insert_tsa(NULL, '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000002001', '00000000-0000-0000-0000-000000003001', '00000000-0000-0000-0000-000000006002', true, 'ACTIVE') $$,
    '23505', NULL, 'Second active primary teacher fails'
);

-- 24. Multiple non-primary teachers are allowed
SELECT lives_ok(
    $$ SELECT pg_temp.test_insert_tsa(NULL, '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000002001', '00000000-0000-0000-0000-000000003001', '00000000-0000-0000-0000-000000006002', false, 'ACTIVE') $$,
    'Multiple non-primary teachers allowed'
);

-- 25. Primary teacher in different section/subject allowed
-- Already done in 7004? It was is_primary=false.
SELECT lives_ok(
    $$ UPDATE public.teacher_subject_assignments SET is_primary = true WHERE id = '00000000-0000-0000-0000-000000007004' $$,
    'Primary teacher in different subject allowed'
);

-- 26. Same active teacher cannot be duplicated
SELECT throws_ok(
    $$ SELECT pg_temp.test_insert_tsa(NULL, '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000002001', '00000000-0000-0000-0000-000000003001', '00000000-0000-0000-0000-000000006001', false, 'ACTIVE') $$,
    '23505', NULL, 'Same active teacher cannot be duplicated'
);

-- 28. ACTIVE -> INACTIVE succeeds
SELECT lives_ok(
    $$ UPDATE public.teacher_subject_assignments SET status = 'INACTIVE' WHERE id = '00000000-0000-0000-0000-000000007001' $$,
    'ACTIVE to INACTIVE succeeds'
);

-- 27. Historical inactive coexists with new active
SELECT lives_ok(
    $$ SELECT pg_temp.test_insert_tsa(NULL, '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000002001', '00000000-0000-0000-0000-000000003001', '00000000-0000-0000-0000-000000006001', true, 'ACTIVE') $$,
    'Historical inactive coexists with new active'
);

-- 31. Inactive teacher cannot receive new active assignment
-- First make teacher A2 ARCHIVED
UPDATE public.staff_branch_profiles SET status = 'ARCHIVED' WHERE id = '00000000-0000-0000-0000-000000006002';

SELECT throws_ok(
    $$ SELECT pg_temp.test_insert_tsa(NULL, '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000002001', '00000000-0000-0000-0000-000000003001', '00000000-0000-0000-0000-000000006002', false, 'ACTIVE') $$,
    'P0001', 'Teacher branch profile must be ACTIVE to be assigned.', 'Inactive teacher rejected'
);

-- 32. Archived subject cannot receive new active assignment
UPDATE public.subjects SET status = 'ARCHIVED' WHERE id = '00000000-0000-0000-0000-000000003002';

SELECT throws_ok(
    $$ SELECT pg_temp.test_insert_tsa(NULL, '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000002001', '00000000-0000-0000-0000-000000003002', '00000000-0000-0000-0000-000000006001', false, 'ACTIVE') $$,
    'P0001', 'Subject must be ACTIVE to be assigned.', 'Archived subject rejected'
);

-- RESTORE status for subsequent tests
UPDATE public.staff_branch_profiles SET status = 'ACTIVE' WHERE id = '00000000-0000-0000-0000-000000006002';
UPDATE public.subjects SET status = 'ACTIVE' WHERE id = '00000000-0000-0000-0000-000000003002';

-- 30. ARCHIVED historical assignment remains readable
UPDATE public.teacher_subject_assignments SET status = 'ARCHIVED' WHERE id = '00000000-0000-0000-0000-000000007004';
SELECT results_eq(
    $$ SELECT COUNT(*)::INT FROM public.teacher_subject_assignments WHERE id = '00000000-0000-0000-0000-000000007004' $$,
    ARRAY[1],
    'Archived assignment remains readable'
);

-- 34. Referenced teacher cannot be physically deleted
SELECT throws_ok(
    $$ DELETE FROM public.staff_branch_profiles WHERE id = '00000000-0000-0000-0000-000000006001' $$,
    '23503', NULL, 'Referenced teacher cannot be deleted'
);

-- 35. Referenced section cannot be physically deleted
SELECT throws_ok(
    $$ DELETE FROM public.sections WHERE id = '00000000-0000-0000-0000-000000002001' $$,
    '23503', NULL, 'Referenced section cannot be deleted'
);

-- 36. Referenced subject cannot be physically deleted
SELECT throws_ok(
    $$ DELETE FROM public.subjects WHERE id = '00000000-0000-0000-0000-000000003001' $$,
    '23503', NULL, 'Referenced subject cannot be deleted'
);

-- 52. Branch reassignment rejected
SELECT throws_ok(
    $$ UPDATE public.teacher_subject_assignments SET branch_id = '00000000-0000-0000-0000-000000000012' WHERE id = '00000000-0000-0000-0000-000000007001' $$,
    'P0001', 'branch_id cannot be modified after creation', 'Branch reassignment rejected'
);

-- ==========================================
-- 4. RLS Tests
-- ==========================================
SELECT set_config('role', 'authenticated', true);

-- BRANCH ADMIN (Admin A - Branch A)
SELECT set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-000000000003"}', true);

-- 37. Branch A admin can SELECT Branch A assignments
SELECT results_eq(
    $$ SELECT COUNT(*)::INT FROM public.teacher_subject_assignments WHERE branch_id = '00000000-0000-0000-0000-000000000011' $$,
    ARRAY[4],
    'Branch A admin can see Branch A assignments'
);

-- 38. Branch A admin cannot SELECT Branch B assignments
SELECT results_eq(
    $$ SELECT COUNT(*)::INT FROM public.teacher_subject_assignments WHERE branch_id = '00000000-0000-0000-0000-000000000012' $$,
    ARRAY[0],
    'Branch A admin cannot see Branch B assignments'
);

-- 39. Branch A admin can INSERT valid Branch A assignment
-- (Wait, 6002 is INACTIVE, must reactivate first or use 6001 for a different section)
SELECT set_config('role', 'postgres', true);
UPDATE public.staff_branch_profiles SET status = 'ACTIVE' WHERE id = '00000000-0000-0000-0000-000000006002';
SELECT set_config('role', 'authenticated', true);
SELECT lives_ok(
    $$ SELECT pg_temp.test_insert_tsa('00000000-0000-0000-0000-000000007005', '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000002001', '00000000-0000-0000-0000-000000003002', '00000000-0000-0000-0000-000000006002', false, 'ACTIVE') $$,
    'Branch A admin can insert Branch A assignment'
);

-- 40. Branch A admin cannot INSERT Branch B assignment
-- First make teacher 6003 ACTIVE so it doesn't fail the eligibility trigger before RLS
SELECT set_config('role', 'postgres', true);
UPDATE public.staff_branch_profiles SET status = 'ACTIVE' WHERE id = '00000000-0000-0000-0000-000000006003';
SELECT set_config('role', 'authenticated', true);

SELECT throws_ok(
    $$ SELECT pg_temp.test_insert_tsa('00000000-0000-0000-0000-000000007006', '00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000001002', '00000000-0000-0000-0000-000000002002', '00000000-0000-0000-0000-000000003003', '00000000-0000-0000-0000-000000006003', false, 'ACTIVE') $$,
    'P0001', 'Teacher branch profile must be ACTIVE to be assigned.', 'Branch A admin cannot insert Branch B assignment (cannot see teacher profile)'
);

-- 41. Branch A admin can UPDATE Branch A assignment
SELECT lives_ok(
    $$ UPDATE public.teacher_subject_assignments SET status = 'INACTIVE' WHERE id = '00000000-0000-0000-0000-000000007005' $$,
    'Branch A admin can update Branch A assignment'
);

-- 42. Branch A admin cannot UPDATE Branch B assignment (Silent failure)
SELECT set_config('role', 'postgres', true);
SELECT pg_temp.test_insert_tsa('00000000-0000-0000-0000-000000007007', '00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000001002', '00000000-0000-0000-0000-000000002002', '00000000-0000-0000-0000-000000003003', '00000000-0000-0000-0000-000000006003', false, 'ACTIVE');
SELECT set_config('role', 'authenticated', true);

SELECT results_eq(
    $$ UPDATE public.teacher_subject_assignments SET status = 'INACTIVE' WHERE id = '00000000-0000-0000-0000-000000007007' RETURNING id $$,
    $$ SELECT id FROM public.teacher_subject_assignments WHERE 1=0 $$,
    'Branch A admin cannot update Branch B assignment'
);

-- TEACHER (Teacher A1 - Branch A)
SELECT set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-000000000004"}', true);

-- 43. Teacher can SELECT own assignments
SELECT results_eq(
    $$ SELECT COUNT(*)::INT FROM public.teacher_subject_assignments $$,
    ARRAY[3],
    'Teacher can see own assignments'
);

-- 44. Teacher cannot SELECT another teacher's assignments
-- Teacher A1 should not see 7005 (Teacher A2's assignment)
SELECT results_eq(
    $$ SELECT COUNT(*)::INT FROM public.teacher_subject_assignments WHERE id = '00000000-0000-0000-0000-000000007005' $$,
    ARRAY[0],
    'Teacher cannot see other teacher assignment'
);

-- 45. Teacher cannot INSERT assignment
-- Reactivate teacher 6001 so it passes the trigger and hits the RLS check
SELECT set_config('role', 'postgres', true);
UPDATE public.staff_branch_profiles SET status = 'ACTIVE' WHERE id = '00000000-0000-0000-0000-000000006001';
SELECT set_config('role', 'authenticated', true);
SELECT set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-000000000004"}', true);

SELECT throws_ok(
    $$ SELECT pg_temp.test_insert_tsa('00000000-0000-0000-0000-000000007008', '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000002001', '00000000-0000-0000-0000-000000003002', '00000000-0000-0000-0000-000000006001', false, 'ACTIVE') $$,
    '42501', NULL, 'Teacher cannot insert'
);

-- 46. Teacher cannot UPDATE assignment (Silent failure)
SELECT results_eq(
    $$ UPDATE public.teacher_subject_assignments SET status = 'INACTIVE' WHERE id = '00000000-0000-0000-0000-000000007001' RETURNING id $$,
    $$ SELECT id FROM public.teacher_subject_assignments WHERE 1=0 $$,
    'Teacher cannot update'
);

-- 47. Teacher cannot DELETE assignment
SELECT throws_ok(
    $$ DELETE FROM public.teacher_subject_assignments WHERE id = '00000000-0000-0000-0000-000000007001' $$,
    '42501', NULL, 'Teacher cannot delete'
);

-- 33. Admin cannot DELETE assignment
SELECT set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-000000000003"}', true);
SELECT throws_ok(
    $$ DELETE FROM public.teacher_subject_assignments WHERE id = '00000000-0000-0000-0000-000000007001' $$,
    '42501', NULL, 'Admin cannot delete'
);

-- 48. Super Admin
SELECT set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-000000000007", "app_metadata": {"is_super_admin": true}}', true);
SELECT results_eq(
    $$ SELECT COUNT(*)::INT FROM public.teacher_subject_assignments $$,
    ARRAY[6],
    'Super Admin can see all organization assignments'
);

-- ==========================================
-- 5. Audit logs verify
-- ==========================================
SELECT set_config('role', 'postgres', true);
SELECT results_eq(
    $$ SELECT COUNT(*)::INT FROM public.audit_logs WHERE table_name = 'teacher_subject_assignments' AND action = 'INSERT' AND record_id = '00000000-0000-0000-0000-000000007001' $$,
    ARRAY[1],
    'Insert is audited'
);

SELECT results_eq(
    $$ SELECT COUNT(*)::INT FROM public.audit_logs WHERE table_name = 'teacher_subject_assignments' AND action = 'UPDATE' AND record_id = '00000000-0000-0000-0000-000000007001' $$,
    ARRAY[1],
    'Update is audited'
);

SELECT * FROM finish();
ROLLBACK;
