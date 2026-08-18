BEGIN;

SELECT plan(41);

-- 1. Setup Test Data
-- Organizations & Branches already exist from 01/02/03 tests:
-- (Actually pgTAP tests run in isolated transactions, so we must recreate base data here)
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
('88888888-8888-8888-8888-888888888888', 'b1@test.com');

INSERT INTO profiles (id, first_name, last_name, status) VALUES 
('66666666-6666-6666-6666-666666666666', 'Super', 'Admin', 'ACTIVE'),
('77777777-7777-7777-7777-777777777777', 'User', 'A1', 'ACTIVE'),
('88888888-8888-8888-8888-888888888888', 'User', 'B1', 'ACTIVE');

INSERT INTO branch_memberships (id, branch_id, user_id, status) VALUES 
('11111111-1111-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', '77777777-7777-7777-7777-777777777777', 'ACTIVE'),
('22222222-2222-0000-0000-000000000000', '55555555-5555-5555-5555-555555555555', '88888888-8888-8888-8888-888888888888', 'ACTIVE');

-- Org A: 11111111-1111-1111-1111-111111111111

-- Insert Test Data bypassing RLS (as postgres role)
INSERT INTO public.academic_years (id, branch_id, name, start_date, end_date, status) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', '2026-2027 A1', '2026-06-01', '2027-05-31', 'ACTIVE'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '55555555-5555-5555-5555-555555555555', '2026-2027 B1', '2026-06-01', '2027-05-31', 'ACTIVE');

INSERT INTO public.classes (id, branch_id, academic_year_id, name, level) VALUES
('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Class 1 A1', 1),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '55555555-5555-5555-5555-555555555555', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Class 1 B1', 1);

INSERT INTO public.sections (id, branch_id, academic_year_id, class_id, name) VALUES
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Section A A1'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', '55555555-5555-5555-5555-555555555555', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Section A B1');

INSERT INTO public.subjects (id, branch_id, name, code) VALUES
('11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'Math A1', 'MATH-A1'),
('22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '55555555-5555-5555-5555-555555555555', 'Math B1', 'MATH-B1');

INSERT INTO public.class_subjects (id, branch_id, class_id, subject_id) VALUES
('33333333-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
('44444444-dddd-dddd-dddd-dddddddddddd', '55555555-5555-5555-5555-555555555555', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

-- Become Authenticated User
SET ROLE authenticated;

-- ==========================================
-- 2. CROSS-BRANCH SELECT TESTS
-- ==========================================
-- Auth as Branch A1 User
SELECT set_config('request.jwt.claims', '{"sub":"77777777-7777-7777-7777-777777777777"}', true);

SELECT results_eq('SELECT id FROM public.academic_years', ARRAY['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid], '1. User A1 can SELECT academic_years from Branch A1');
SELECT is_empty('SELECT id FROM public.academic_years WHERE id = ''bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb''', '2. User A1 CANNOT SELECT academic_years from Branch B1');

SELECT results_eq('SELECT id FROM public.classes', ARRAY['cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid], '3. User A1 can SELECT classes from Branch A1');
SELECT is_empty('SELECT id FROM public.classes WHERE id = ''dddddddd-dddd-dddd-dddd-dddddddddddd''', '4. User A1 CANNOT SELECT classes from Branch B1');

SELECT results_eq('SELECT id FROM public.sections', ARRAY['eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid], '5. User A1 can SELECT sections from Branch A1');
SELECT is_empty('SELECT id FROM public.sections WHERE id = ''ffffffff-ffff-ffff-ffff-ffffffffffff''', '6. User A1 CANNOT SELECT sections from Branch B1');

SELECT results_eq('SELECT id FROM public.subjects', ARRAY['11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid], '7. User A1 can SELECT subjects from Branch A1');
SELECT is_empty('SELECT id FROM public.subjects WHERE id = ''22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb''', '8. User A1 CANNOT SELECT subjects from Branch B1');

SELECT results_eq('SELECT id FROM public.class_subjects', ARRAY['33333333-cccc-cccc-cccc-cccccccccccc'::uuid], '9. User A1 can SELECT class_subjects from Branch A1');
SELECT is_empty('SELECT id FROM public.class_subjects WHERE id = ''44444444-dddd-dddd-dddd-dddddddddddd''', '10. User A1 CANNOT SELECT class_subjects from Branch B1');

-- ==========================================
-- 3. CROSS-BRANCH INSERT TESTS
-- ==========================================

SELECT throws_ok(
    $$ INSERT INTO public.academic_years (branch_id, name, start_date, end_date) VALUES ('55555555-5555-5555-5555-555555555555', 'Hacked Year', '2026-01-01', '2026-12-31') $$,
    '42501', 'new row violates row-level security policy for table "academic_years"', '11. User A1 CANNOT INSERT academic_year into Branch B1'
);

SELECT throws_ok(
    $$ INSERT INTO public.classes (branch_id, academic_year_id, name, level) VALUES ('55555555-5555-5555-5555-555555555555', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Hacked Class', 1) $$,
    '42501', 'new row violates row-level security policy for table "classes"', '12. User A1 CANNOT INSERT class into Branch B1'
);

-- ==========================================
-- 4. INDIRECT TENANCY & INTEGRITY ATTACKS (INSERT)
-- ==========================================

SELECT throws_ok(
    $$ INSERT INTO public.classes (branch_id, academic_year_id, name, level) VALUES ('33333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Mismatch Class', 1) $$,
    '23503', NULL, '13. User A1 CANNOT INSERT class (Branch A1) pointing to academic_year (Branch B1) due to composite FK'
);

SELECT throws_ok(
    $$ INSERT INTO public.sections (branch_id, academic_year_id, class_id, name) VALUES ('33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Mismatch Section') $$,
    '23503', NULL, '14. User A1 CANNOT INSERT section (Branch A1) pointing to class (Branch B1) due to composite FK'
);

SELECT lives_ok(
    $$ INSERT INTO public.sections (branch_id, academic_year_id, class_id, name) VALUES ('33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'New Section A1') $$,
    '18. User A1 CAN INSERT section into Class A1'
);

SELECT throws_ok(
    $$ INSERT INTO public.class_subjects (branch_id, class_id, subject_id) VALUES ('33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb') $$,
    '23503', NULL, '15. User A1 CANNOT INSERT class_subject mixing Class A1 and Subject B1 due to composite FK'
);

-- ==========================================
-- 5. CROSS-BRANCH UPDATE TESTS
-- ==========================================

SELECT is_empty(
    $$ UPDATE public.academic_years SET name = 'Hacked' WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' RETURNING id $$,
    '16. User A1 CANNOT UPDATE academic_year in Branch B1 (fails closed)'
);

SELECT is_empty(
    $$ UPDATE public.academic_years SET name = 'Hacked' WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' RETURNING id $$,
    '17. User A1 UPDATE academic_year in Branch B1 affects 0 rows'
);

SELECT is_empty(
    $$ UPDATE public.classes SET name = 'Hacked' WHERE id = 'dddddddd-dddd-dddd-dddd-dddddddddddd' RETURNING id $$,
    '18. User A1 UPDATE class in Branch B1 affects 0 rows'
);

-- ==========================================
-- 6. IMMUTABILITY TRIGGER (REASSIGNMENT ATTACK)
-- ==========================================
-- Test as a user who has access to BOTH Branch A1 and Branch B1
SET ROLE postgres;
INSERT INTO auth.users (id, email) VALUES ('99999999-9999-9999-9999-999999999999', 'dual@test.com');
INSERT INTO public.branch_memberships (id, branch_id, user_id, status) VALUES 
('33333333-3333-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', '99999999-9999-9999-9999-999999999999', 'ACTIVE'),
('44444444-4444-0000-0000-000000000000', '55555555-5555-5555-5555-555555555555', '99999999-9999-9999-9999-999999999999', 'ACTIVE');

SET ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"99999999-9999-9999-9999-999999999999"}', true);

SELECT throws_ok(
    $$ UPDATE public.academic_years SET branch_id = '55555555-5555-5555-5555-555555555555' WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' $$,
    'P0001', 'branch_id cannot be modified after creation', '19. Dual-branch Admin CANNOT reassign academic_year branch_id (Immutability Trigger)'
);

SELECT throws_ok(
    $$ UPDATE public.classes SET branch_id = '55555555-5555-5555-5555-555555555555' WHERE id = 'cccccccc-cccc-cccc-cccc-cccccccccccc' $$,
    'P0001', 'branch_id cannot be modified after creation', '20. Dual-branch Admin CANNOT reassign class branch_id'
);

SELECT throws_ok(
    $$ UPDATE public.sections SET branch_id = '55555555-5555-5555-5555-555555555555' WHERE id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee' $$,
    'P0001', 'branch_id cannot be modified after creation', '21. Dual-branch Admin CANNOT reassign section branch_id'
);

SELECT throws_ok(
    $$ UPDATE public.subjects SET branch_id = '55555555-5555-5555-5555-555555555555' WHERE id = '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa' $$,
    'P0001', 'branch_id cannot be modified after creation', '22. Dual-branch Admin CANNOT reassign subject branch_id'
);

SELECT throws_ok(
    $$ UPDATE public.class_subjects SET branch_id = '55555555-5555-5555-5555-555555555555' WHERE id = '33333333-cccc-cccc-cccc-cccccccccccc' $$,
    'P0001', 'branch_id cannot be modified after creation', '23. Dual-branch Admin CANNOT reassign class_subject branch_id'
);

-- Prove regular UPDATE still works if branch_id is NOT changed
SELECT lives_ok(
    $$ UPDATE public.academic_years SET status = 'COMPLETED' WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' $$,
    '24. Dual-branch Admin CAN update other fields (status) on academic_year'
);

-- ==========================================


-- More Indirect Tenancy / FK Mismatch Tests (INSERT)
-- Switch to dual-branch user so RLS doesn't block the INSERT, allowing the FK to fail
SELECT set_config('request.jwt.claims', '{"sub":"99999999-9999-9999-9999-999999999999"}', true);

SELECT throws_ok(
    $$ INSERT INTO public.class_subjects (branch_id, class_id, subject_id) VALUES ('55555555-5555-5555-5555-555555555555', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb') $$,
    '23503', NULL, '31. Dual-branch Admin CANNOT INSERT class_subject mixing Class A1 and Branch B1 due to composite FK'
);

SELECT throws_ok(
    $$ INSERT INTO public.class_subjects (branch_id, class_id, subject_id) VALUES ('55555555-5555-5555-5555-555555555555', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa') $$,
    '23503', NULL, '32. Dual-branch Admin CANNOT INSERT class_subject mixing Class B1 and Subject A1 due to composite FK'
);

-- More Reassignment attacks
SELECT throws_ok(
    $$ UPDATE public.classes SET academic_year_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' WHERE id = 'cccccccc-cccc-cccc-cccc-cccccccccccc' $$,
    '23503', NULL, '33. Dual-branch Admin CANNOT change class from A1 to academic_year B1 due to composite FK'
);

SELECT throws_ok(
    $$ UPDATE public.sections SET class_id = 'dddddddd-dddd-dddd-dddd-dddddddddddd' WHERE id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee' $$,
    '23503', NULL, '34. Dual-branch Admin CANNOT change section from A1 to class B1 due to composite FK'
);

SELECT throws_ok(
    $$ UPDATE public.class_subjects SET class_id = 'dddddddd-dddd-dddd-dddd-dddddddddddd' WHERE id = '33333333-cccc-cccc-cccc-cccccccccccc' $$,
    '23503', NULL, '35. Dual-branch Admin CANNOT change class_subject from A1 to class B1 due to composite FK'
);

SELECT throws_ok(
    $$ UPDATE public.class_subjects SET subject_id = '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb' WHERE id = '33333333-cccc-cccc-cccc-cccccccccccc' $$,
    '23503', NULL, '36. Dual-branch Admin CANNOT change class_subject from A1 to subject B1 due to composite FK'
);

-- Real UPDATE check (does the WITH CHECK enforce branch ownership if somehow we insert?)
SELECT set_config('request.jwt.claims', '{"sub":"77777777-7777-7777-7777-777777777777"}', true);

SELECT throws_ok(
    $$ INSERT INTO public.academic_years (branch_id, name, start_date, end_date) VALUES ('55555555-5555-5555-5555-555555555555', 'Hacked 2', '2026-01-01', '2026-12-31') $$,
    '42501', 'new row violates row-level security policy for table "academic_years"', '37. User A1 CANNOT INSERT into B1 directly'
);

SELECT throws_ok(
    $$ UPDATE public.academic_years SET branch_id = '55555555-5555-5555-5555-555555555555' WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' $$,
    'P0001', 'branch_id cannot be modified after creation', '38. User A1 CANNOT UPDATE B1 branch_id due to WITH CHECK (reassignment)'
);

-- 7. CROSS-BRANCH DELETE TESTS
-- ==========================================
-- Auth back as Branch A1 User
SELECT set_config('request.jwt.claims', '{"sub":"77777777-7777-7777-7777-777777777777"}', true);

SELECT is_empty(
    $$ DELETE FROM public.academic_years WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' RETURNING id $$,
    '25. User A1 DELETE academic_year in Branch B1 affects 0 rows'
);

SELECT is_empty(
    $$ DELETE FROM public.classes WHERE id = 'dddddddd-dddd-dddd-dddd-dddddddddddd' RETURNING id $$,
    '26. User A1 DELETE class in Branch B1 affects 0 rows'
);

SELECT is_empty(
    $$ DELETE FROM public.sections WHERE id = 'ffffffff-ffff-ffff-ffff-ffffffffffff' RETURNING id $$,
    '27. User A1 DELETE section in Branch B1 affects 0 rows'
);

-- Confirm Valid Delete Works
SELECT results_eq(
    $$ DELETE FROM public.sections WHERE id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee' RETURNING id $$,
    ARRAY['eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid],
    '28. User A1 CAN DELETE section in their own Branch A1'
);

-- More Cross-Branch Delete Tests
SELECT is_empty(
    $$ DELETE FROM public.subjects WHERE id = '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb' RETURNING id $$,
    '29. User A1 DELETE subject in Branch B1 affects 0 rows'
);

SELECT is_empty(
    $$ DELETE FROM public.class_subjects WHERE id = '44444444-dddd-dddd-dddd-dddddddddddd' RETURNING id $$,
    '30. User A1 DELETE class_subject in Branch B1 affects 0 rows'
);
SELECT set_config('request.jwt.claims', '{"sub":"77777777-7777-7777-7777-777777777777"}', true);

SELECT throws_ok(
    $$ INSERT INTO public.academic_years (branch_id, name, start_date, end_date) VALUES ('55555555-5555-5555-5555-555555555555', 'Hacked 2', '2026-01-01', '2026-12-31') $$,
    '42501', 'new row violates row-level security policy for table "academic_years"', '37. User A1 CANNOT INSERT into B1 directly'
);

SELECT is_empty(
    $$ UPDATE public.sections SET name = 'Hacked Section' WHERE id = 'ffffffff-ffff-ffff-ffff-ffffffffffff' RETURNING id $$,
    '38. User A1 UPDATE section in Branch B1 affects 0 rows'
);

SELECT * FROM finish();
ROLLBACK;
