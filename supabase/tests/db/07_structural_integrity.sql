BEGIN;

SELECT plan(21);

-- Setup helpers (using standard org/branch IDs from globals)
CREATE FUNCTION get_org_id() RETURNS uuid LANGUAGE sql AS $$ SELECT '11111111-1111-1111-1111-111111111111'::uuid $$;
CREATE FUNCTION get_branch_1() RETURNS uuid LANGUAGE sql AS $$ SELECT '33333333-3333-3333-3333-333333333333'::uuid $$;
CREATE FUNCTION get_branch_2() RETURNS uuid LANGUAGE sql AS $$ SELECT '44444444-4444-4444-4444-444444444444'::uuid $$;

-- 19. Composite FK constraints exist
SELECT has_fk('public', 'classes', 'classes has foreign key to academic_years');
SELECT has_fk('public', 'sections', 'sections has foreign key to classes');
SELECT has_fk('public', 'class_subjects', 'class_subjects has foreign key to classes');
SELECT has_fk('public', 'class_subjects', 'class_subjects has foreign key to subjects');

-- 20. Required supporting indexes exist
SELECT has_index('public', 'sections', 'idx_sections_academic_year', 'sections has index on academic_year_id');

-- Setup user auth variables
CREATE FUNCTION get_admin_a1() RETURNS uuid LANGUAGE sql AS $$ SELECT '99999999-9999-9999-9999-999999999999'::uuid $$;
CREATE FUNCTION get_admin_a2() RETURNS uuid LANGUAGE sql AS $$ SELECT 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid $$;

-- 1. Setup Mock Data
INSERT INTO organizations (id, name, status) VALUES 
(get_org_id(), 'Test Org A', 'ACTIVE') ON CONFLICT DO NOTHING;

INSERT INTO branches (id, organization_id, name, status) VALUES 
(get_branch_1(), get_org_id(), 'Branch A1', 'ACTIVE'), 
(get_branch_2(), get_org_id(), 'Branch A2', 'ACTIVE') ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, email) VALUES 
(get_admin_a1(), 'admin_a1@test.com'),
(get_admin_a2(), 'admin_a2@test.com') ON CONFLICT DO NOTHING;

INSERT INTO profiles (id, first_name, last_name) VALUES 
(get_admin_a1(), 'Admin', 'A1'),
(get_admin_a2(), 'Admin', 'A2') ON CONFLICT DO NOTHING;

INSERT INTO organization_memberships (id, user_id, organization_id) VALUES 
('12345678-0000-0000-0000-123456789012', get_admin_a1(), get_org_id()),
('12345678-0000-0000-0000-123456789013', get_admin_a2(), get_org_id()) ON CONFLICT DO NOTHING;

INSERT INTO branch_memberships (id, user_id, branch_id) VALUES 
('12345678-1234-1234-1234-123456789012', get_admin_a1(), get_branch_1()),
('12345678-1234-1234-1234-123456789013', get_admin_a2(), get_branch_2()) ON CONFLICT DO NOTHING;

INSERT INTO public.roles (id, organization_id, name) VALUES 
('00000000-0000-0000-0000-000000000004', get_org_id(), 'Branch Admin') ON CONFLICT DO NOTHING;

INSERT INTO public.user_role_assignments (branch_membership_id, role_id) VALUES 
('12345678-1234-1234-1234-123456789012', '00000000-0000-0000-0000-000000000004'),
('12345678-1234-1234-1234-123456789013', '00000000-0000-0000-0000-000000000004') ON CONFLICT DO NOTHING;

-- Authenticate as Branch Admin 1
SELECT set_config('role', 'authenticated', true);
SELECT set_config('request.jwt.claims', format('{"sub": "%s"}', get_admin_a1()), true);

-- Prepare valid records
WITH valid_ay AS (
    INSERT INTO public.academic_years (id, branch_id, name, start_date, end_date, status)
    VALUES ('aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', get_branch_1(), '2025-2026', '2025-01-01', '2025-12-31', 'PLANNED')
    RETURNING id, branch_id
), valid_class AS (
    INSERT INTO public.classes (id, branch_id, academic_year_id, name, level)
    SELECT 'bbbbbbbb-1111-1111-1111-bbbbbbbbbbbb', branch_id, id, 'Class 1', 1 FROM valid_ay
    RETURNING id, branch_id, academic_year_id
), valid_subject AS (
    INSERT INTO public.subjects (id, branch_id, name, code, status)
    VALUES ('dddddddd-1111-1111-1111-dddddddddddd', get_branch_1(), 'Math', 'MTH101', 'ACTIVE')
    RETURNING id
)
INSERT INTO public.sections (id, branch_id, class_id, academic_year_id, name, capacity)
SELECT 'cccccccc-1111-1111-1111-cccccccccccc', branch_id, id, academic_year_id, 'Section A', 40 FROM valid_class;

-- 1. Valid academic year -> class
SELECT results_eq(
    $$ SELECT count(*)::int FROM public.classes WHERE id = 'bbbbbbbb-1111-1111-1111-bbbbbbbbbbbb' $$,
    ARRAY[1],
    'Valid academic year -> class creation succeeds'
);

-- 3. Valid class -> section
SELECT results_eq(
    $$ SELECT count(*)::int FROM public.sections WHERE id = 'cccccccc-1111-1111-1111-cccccccccccc' $$,
    ARRAY[1],
    'Valid class -> section creation succeeds'
);

-- 14. Valid class_subject mapping succeeds
SELECT lives_ok(
    $$ INSERT INTO public.class_subjects (branch_id, class_id, subject_id) VALUES (get_branch_1(), 'bbbbbbbb-1111-1111-1111-bbbbbbbbbbbb', 'dddddddd-1111-1111-1111-dddddddddddd') $$,
    'Valid class_subject mapping succeeds'
);

-- Prepare valid Branch 2 records (bypassing RLS by switching to Branch Admin 2)
SELECT set_config('request.jwt.claims', format('{"sub": "%s"}', get_admin_a2()), true);
WITH valid_ay2 AS (
    INSERT INTO public.academic_years (id, branch_id, name, start_date, end_date, status)
    VALUES ('aaaaaaaa-2222-2222-2222-aaaaaaaaaaaa', get_branch_2(), '2025-2026', '2025-01-01', '2025-12-31', 'PLANNED')
    RETURNING id, branch_id
), valid_class2 AS (
    INSERT INTO public.classes (id, branch_id, academic_year_id, name, level)
    SELECT 'bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb', branch_id, id, 'Class 2', 2 FROM valid_ay2
    RETURNING id, branch_id, academic_year_id
)
INSERT INTO public.sections (id, branch_id, class_id, academic_year_id, name, capacity)
SELECT 'cccccccc-2222-2222-2222-cccccccccccc', branch_id, id, academic_year_id, 'Section A', 40 FROM valid_class2;

-- Switch back to Branch Admin 1
SELECT set_config('request.jwt.claims', format('{"sub": "%s"}', get_admin_a1()), true);

-- 7. Cross-branch SELECT denied
SELECT results_eq(
    $$ SELECT count(*)::int FROM public.academic_years WHERE branch_id = get_branch_2() $$,
    ARRAY[0],
    'Cross-branch SELECT denied for academic_years'
);

-- 8. Cross-branch INSERT denied (RLS policy check)
SELECT throws_ok(
    $$ INSERT INTO public.academic_years (branch_id, name, start_date, end_date) VALUES (get_branch_2(), '2026-2027', '2026-01-01', '2026-12-31') $$,
    'new row violates row-level security policy for table "academic_years"',
    'Cross-branch INSERT denied'
);

-- 9. Cross-branch UPDATE denied
UPDATE public.academic_years SET name = 'Hacked' WHERE branch_id = get_branch_2();
SELECT results_eq(
    $$ SELECT name FROM public.academic_years WHERE id = 'aaaaaaaa-2222-2222-2222-aaaaaaaaaaaa' $$,
    ARRAY[]::text[],
    'Cross-branch UPDATE denied (record not visible so not updated)'
);

-- 10. Cross-branch DELETE denied
DELETE FROM public.academic_years WHERE branch_id = get_branch_2();
SELECT set_config('request.jwt.claims', format('{"sub": "%s"}', get_admin_a2()), true);
SELECT results_eq(
    $$ SELECT count(*)::int FROM public.academic_years WHERE id = 'aaaaaaaa-2222-2222-2222-aaaaaaaaaaaa' $$,
    ARRAY[1],
    'Cross-branch DELETE denied (record still exists)'
);
SELECT set_config('request.jwt.claims', format('{"sub": "%s"}', get_admin_a1()), true);

-- Switch to postgres to test DB constraints directly without RLS blocking them early
SELECT set_config('role', 'postgres', true);

-- 2. Invalid branch/year -> rejected (classes)
SELECT throws_ok(
    $$ INSERT INTO public.classes (branch_id, academic_year_id, name, level) VALUES (get_branch_2(), 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', 'Class 3', 3) $$,
    '23503',
    'insert or update on table "classes" violates foreign key constraint "fk_classes_academic_year"',
    'Invalid branch/year combination rejected'
);

-- 4. Invalid branch/class -> rejected (sections)
SELECT throws_ok(
    $$ INSERT INTO public.sections (branch_id, class_id, academic_year_id, name, capacity) VALUES (get_branch_2(), 'bbbbbbbb-1111-1111-1111-bbbbbbbbbbbb', 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', 'Section B', 40) $$,
    '23503',
    'insert or update on table "sections" violates foreign key constraint "fk_sections_class"',
    'Invalid branch/class combination rejected'
);

-- 5. Invalid academic_year/class -> rejected
SELECT throws_ok(
    $$ INSERT INTO public.sections (branch_id, class_id, academic_year_id, name, capacity) VALUES (get_branch_1(), 'bbbbbbbb-1111-1111-1111-bbbbbbbbbbbb', 'aaaaaaaa-2222-2222-2222-aaaaaaaaaaaa', 'Section B', 40) $$,
    '23503',
    'insert or update on table "sections" violates foreign key constraint "fk_sections_class"',
    'Invalid academic_year/class combination rejected'
);

-- 6. Invalid section/class relationship -> rejected (Wait, this is tested by the FK, similar to above)
-- Let's test providing a non-existent class id
SELECT throws_ok(
    $$ INSERT INTO public.sections (branch_id, class_id, academic_year_id, name, capacity) VALUES (get_branch_1(), 'ffffffff-1111-1111-1111-ffffffffffff', 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', 'Section B', 40) $$,
    '23503',
    'insert or update on table "sections" violates foreign key constraint "fk_sections_class"',
    'Invalid section/class relationship rejected'
);

-- 11. Branch reassignment rejected
SELECT throws_ok(
    $$ UPDATE public.academic_years SET branch_id = get_branch_2() WHERE id = 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa' $$,
    'P0001',
    'branch_id cannot be modified after creation',
    'Branch reassignment rejected via trigger'
);

-- 12. Academic-year reassignment into another branch rejected (fails due to child records)
SELECT throws_ok(
    $$ UPDATE public.classes SET academic_year_id = 'aaaaaaaa-2222-2222-2222-aaaaaaaaaaaa' WHERE id = 'bbbbbbbb-1111-1111-1111-bbbbbbbbbbbb' $$,
    '23503',
    'update or delete on table "classes" violates foreign key constraint "fk_sections_class" on table "sections"',
    'Academic-year reassignment into another branch rejected'
);

-- 13. Class/subject branch mismatch rejected
SELECT throws_ok(
    $$ INSERT INTO public.class_subjects (branch_id, class_id, subject_id) VALUES (get_branch_1(), 'bbbbbbbb-1111-1111-1111-bbbbbbbbbbbb', 'dddddddd-2222-2222-2222-dddddddddddd') $$,
    '23503',
    'insert or update on table "class_subjects" violates foreign key constraint "fk_class_subjects_subject"',
    'Class/subject branch mismatch rejected'
);

-- 22. Physical deletion cannot cascade into historical academic records (ON DELETE RESTRICT Test)
SELECT throws_ok(
    $$ DELETE FROM public.academic_years WHERE id = 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa' $$,
    '23503',
    'update or delete on table "academic_years" violates foreign key constraint "fk_classes_academic_year" on table "classes"',
    'Physical deletion blocked by RESTRICT to protect historical records'
);

-- 21. Historical/archived structures are preserved
UPDATE public.academic_years SET status = 'ARCHIVED' WHERE id = 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa';
SELECT results_eq(
    $$ SELECT count(*)::int FROM public.classes WHERE academic_year_id = 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa' $$,
    ARRAY[1],
    'Historical/archived structures are preserved and visible'
);

SELECT * FROM finish();

ROLLBACK;
