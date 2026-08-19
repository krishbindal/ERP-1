BEGIN;

SELECT plan(20);

-- Helper function to reduce duplication
CREATE OR REPLACE FUNCTION create_test_enrollment(
    p_org_id UUID, p_branch_id UUID, p_student_id UUID, p_profile_id UUID,
    p_year_id UUID, p_class_id UUID, p_section_id UUID, p_roll_number INT, p_status TEXT
) RETURNS VOID AS $$
BEGIN
    INSERT INTO public.enrollments (
        organization_id, branch_id, student_id, student_branch_profile_id,
        academic_year_id, class_id, section_id, roll_number, status
    ) VALUES (
        p_org_id, p_branch_id, p_student_id, p_profile_id,
        p_year_id, p_class_id, p_section_id, p_roll_number, p_status
    );
END;
$$ LANGUAGE plpgsql;


-- ==========================================
-- 1. Setup & Context
-- ==========================================
-- Create organization
INSERT INTO public.organizations (id, name) VALUES ('00000000-0000-0000-0000-000000000001', 'Test Org 1');

-- Create branches
INSERT INTO public.branches (id, organization_id, name) VALUES 
('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Branch A'),
('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'Branch B');

-- Create academic years
INSERT INTO public.academic_years (id, branch_id, name, start_date, end_date) VALUES 
('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000011', '2026-A', '2026-01-01', '2026-12-31'),
('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000012', '2026-B', '2026-01-01', '2026-12-31');

-- Create classes
INSERT INTO public.classes (id, academic_year_id, branch_id, name, level) VALUES 
('00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000011', 'Class 1-A', 1),
('00000000-0000-0000-0000-000000001002', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000012', 'Class 1-B', 1);

-- Create sections
INSERT INTO public.sections (id, class_id, academic_year_id, branch_id, name) VALUES 
('00000000-0000-0000-0000-000000002001', '00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000011', 'Sec A-1'),
('00000000-0000-0000-0000-000000002002', '00000000-0000-0000-0000-000000001002', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000012', 'Sec B-1');

-- Create users, students, and student branch profiles
INSERT INTO auth.users (id, email) VALUES 
('00000000-0000-0000-0000-000000000003', 'admin.a@test.com'),
('00000000-0000-0000-0000-000000000004', 'admin.b@test.com');

INSERT INTO public.profiles (id, first_name, last_name) VALUES 
('00000000-0000-0000-0000-000000000003', 'Admin', 'A'),
('00000000-0000-0000-0000-000000000004', 'Admin', 'B');

INSERT INTO public.organization_memberships (id, organization_id, user_id) VALUES 
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003'),
('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004');

INSERT INTO public.branch_memberships (id, branch_id, user_id) VALUES 
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000003'),
('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000004');

INSERT INTO public.roles (id, organization_id, name) VALUES 
('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Branch Admin');

INSERT INTO public.user_role_assignments (branch_membership_id, role_id) VALUES 
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000005'),
('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000005');

-- Students
INSERT INTO public.students (id, organization_id, first_name, last_name) VALUES 
('00000000-0000-0000-0000-000000003001', '00000000-0000-0000-0000-000000000001', 'Student', 'A1'),
('00000000-0000-0000-0000-000000003002', '00000000-0000-0000-0000-000000000001', 'Student', 'A2'),
('00000000-0000-0000-0000-000000003003', '00000000-0000-0000-0000-000000000001', 'Student', 'B1');

-- Student branch profiles
INSERT INTO public.student_branch_profiles (id, student_id, branch_id) VALUES 
('00000000-0000-0000-0000-000000004001', '00000000-0000-0000-0000-000000003001', '00000000-0000-0000-0000-000000000011'),
('00000000-0000-0000-0000-000000004002', '00000000-0000-0000-0000-000000003002', '00000000-0000-0000-0000-000000000011'),
('00000000-0000-0000-0000-000000004003', '00000000-0000-0000-0000-000000003003', '00000000-0000-0000-0000-000000000012');

-- Authenticate as Branch A admin
SELECT set_config('role', 'authenticated', true);
SELECT set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-000000000003"}', true);


-- ==========================================
-- 2. Constraints & Triggers
-- ==========================================

-- Test: Valid enrollment creation
SELECT lives_ok(
    $$ SELECT create_test_enrollment('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000003001', '00000000-0000-0000-0000-000000004001', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000002001', 1, 'ACTIVE') $$,
    'Valid enrollment creation should succeed'
);

-- Test: Invalid section/class mismatch
SELECT throws_ok(
    $$ SELECT create_test_enrollment('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000003002', '00000000-0000-0000-0000-000000004002', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-999999999999', 2, 'ACTIVE') $$,
    '23503',
    NULL,
    'Enrollment with mismatched class_id and section_id should fail composite FK'
);

-- Test: Profile branch vs Enrollment branch mismatch
SELECT throws_ok(
    $$ SELECT create_test_enrollment('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000003001', '00000000-0000-0000-0000-000000004001', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000001002', '00000000-0000-0000-0000-000000002002', 3, 'ACTIVE') $$,
    'P0001',
    'enrollment branch_id contradicts the profile branch_id',
    'Enrollment branch_id must match student_branch_profile branch_id'
);

-- Test: Profile student vs Enrollment student mismatch
SELECT throws_ok(
    $$ SELECT create_test_enrollment('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000003002', '00000000-0000-0000-0000-000000004001', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000002001', 4, 'ACTIVE') $$,
    'P0001',
    'enrollment student_id contradicts the profile student_id',
    'Enrollment student_id must match student_branch_profile student_id'
);


-- ==========================================
-- 3. Uniqueness
-- ==========================================

-- Test: Duplicate ACTIVE enrollment
SELECT throws_ok(
    $$ SELECT create_test_enrollment('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000003001', '00000000-0000-0000-0000-000000004001', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000002001', 5, 'ACTIVE') $$,
    '23505',
    NULL,
    'Duplicate ACTIVE enrollment in the same year should fail'
);

-- Test: Duplicate ACTIVE roll number
SELECT lives_ok(
    $$ SELECT create_test_enrollment('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000003002', '00000000-0000-0000-0000-000000004002', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000002001', 2, 'ACTIVE') $$,
    'Second enrollment created'
);

SELECT throws_ok(
    $$ UPDATE public.enrollments SET roll_number = 1 WHERE student_branch_profile_id = '00000000-0000-0000-0000-000000004002' $$,
    '23505',
    NULL,
    'Duplicate active roll number in the same section should fail'
);

-- Test: NULL roll number allows duplicates
SELECT lives_ok(
    $$ UPDATE public.enrollments SET roll_number = NULL WHERE student_branch_profile_id = '00000000-0000-0000-0000-000000004001' $$,
    'Set first enrollment roll number to NULL'
);
SELECT lives_ok(
    $$ UPDATE public.enrollments SET roll_number = NULL WHERE student_branch_profile_id = '00000000-0000-0000-0000-000000004002' $$,
    'Set second enrollment roll number to NULL (both NULL now, should succeed)'
);


-- ==========================================
-- 4. Lifecycle Transitions & Historical Safety
-- ==========================================

-- Switch first student to TRANSFERRED
SELECT lives_ok(
    $$ UPDATE public.enrollments SET status = 'TRANSFERRED' WHERE student_branch_profile_id = '00000000-0000-0000-0000-000000004001' $$,
    'Transitioning ACTIVE to TRANSFERRED is allowed'
);

-- Test: Reverting terminal status to ACTIVE is blocked
SELECT throws_ok(
    $$ UPDATE public.enrollments SET status = 'ACTIVE' WHERE student_branch_profile_id = '00000000-0000-0000-0000-000000004001' $$,
    'P0001',
    'Cannot transition from TRANSFERRED to ACTIVE',
    'Terminal status cannot revert to ACTIVE'
);

-- Test: Historical enrollment same year allowed
SELECT lives_ok(
    $$ SELECT create_test_enrollment('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000003001', '00000000-0000-0000-0000-000000004001', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000002001', 5, 'ACTIVE') $$,
    'Can insert new ACTIVE enrollment if old is TRANSFERRED in same year'
);

-- Test: RESTRICT delete safety
-- Try to delete the section, it should fail because of RESTRICT
SELECT throws_ok(
    $$ 
    SELECT set_config('role', 'postgres', true);
    DELETE FROM public.sections WHERE id = '00000000-0000-0000-0000-000000002001'; 
    $$,
    '23503',
    NULL,
    'Deleting section with enrollments should fail due to RESTRICT'
);

-- Try to delete the profile, it should fail because of RESTRICT (now P0001 from trigger)
SELECT throws_ok(
    $$ 
    SELECT set_config('role', 'postgres', true);
    DELETE FROM public.student_branch_profiles WHERE id = '00000000-0000-0000-0000-000000004001'; 
    $$,
    'P0001',
    'Hard deletion of student_branch_profiles is not allowed',
    'Deleting profile with enrollments should fail due to RESTRICT'
);

SELECT set_config('role', 'authenticated', true);
SELECT set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-000000000003"}', true);

-- ==========================================
-- 5. Row Level Security
-- ==========================================

-- As Branch A Admin:
-- Can see Branch A enrollments
SELECT results_eq(
    $$ SELECT COUNT(*)::INTEGER FROM public.enrollments WHERE branch_id = '00000000-0000-0000-0000-000000000011' $$,
    $$ VALUES (3::INTEGER) $$,
    'Branch A admin can see Branch A enrollments'
);

-- Cannot see Branch B enrollments
-- (We haven't inserted any yet, so let's insert one as postgres/admin B)
SELECT set_config('role', 'postgres', true);
INSERT INTO public.enrollments (id, organization_id, branch_id, student_id, student_branch_profile_id, academic_year_id, class_id, section_id, status) 
VALUES ('00000000-0000-0000-0000-000000005001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000003003', '00000000-0000-0000-0000-000000004003', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000001002', '00000000-0000-0000-0000-000000002002', 'ACTIVE');

SELECT set_config('role', 'authenticated', true);
SELECT set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-000000000003"}', true);

SELECT results_eq(
    $$ SELECT COUNT(*)::INTEGER FROM public.enrollments WHERE branch_id = '00000000-0000-0000-0000-000000000012' $$,
    $$ VALUES (0::INTEGER) $$,
    'Branch A admin cannot see Branch B enrollments (RLS filters out)'
);

-- Try to delete Branch A enrollment (should fail due to missing DELETE privilege)
SELECT throws_ok(
    $$ DELETE FROM public.enrollments WHERE branch_id = '00000000-0000-0000-0000-000000000011' $$,
    '42501',
    NULL,
    'Branch A admin cannot delete Branch A enrollment (lacks DELETE privilege)'
);

-- Try to update Branch B enrollment
SELECT results_eq(
    $$ UPDATE public.enrollments SET status = 'WITHDRAWN' WHERE id = '00000000-0000-0000-0000-000000005001' RETURNING 1; $$,
    $$ SELECT 1 WHERE false; $$,
    'Branch A admin cannot update Branch B enrollment (filters 0 rows)'
);

-- Cannot INSERT into Branch B
SELECT throws_ok(
    $$ INSERT INTO public.enrollments (id, organization_id, branch_id, student_id, student_branch_profile_id, academic_year_id, class_id, section_id, status) 
       VALUES ('00000000-0000-0000-0000-000000005002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000003003', '00000000-0000-0000-0000-000000004003', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000001002', '00000000-0000-0000-0000-000000002002', 'ACTIVE') $$,
    '42501',
    NULL,
    'Branch A admin cannot insert Branch B enrollment'
);

-- ==========================================
-- 6. Audit & History Validations
-- ==========================================
-- Verify the last few operations created audit logs
SELECT set_config('role', 'postgres', true);
SELECT results_eq(
    $$ SELECT COUNT(*)>0 FROM public.audit_logs WHERE table_name = 'enrollments' $$,
    $$ VALUES (true) $$,
    'Enrollment mutations produced audit logs'
);


-- Cleanup
SELECT set_config('role', 'postgres', true);
-- Cleanup handled by transaction rollback

SELECT * FROM finish();
ROLLBACK;
