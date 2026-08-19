BEGIN;

INSERT INTO public.organizations (id, name) VALUES ('00000000-0000-0000-0000-000000000001'::uuid, 'Org 1');
INSERT INTO public.branches (id, organization_id, name) VALUES ('00000000-0000-0000-0000-000000000011'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Branch A');
INSERT INTO public.branches (id, organization_id, name) VALUES ('00000000-0000-0000-0000-000000000012'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Branch B');
INSERT INTO public.academic_years (id, branch_id, name, start_date, end_date) VALUES ('00000000-0000-0000-0000-000000000101'::uuid, '00000000-0000-0000-0000-000000000011'::uuid, '2026-A', '2026-01-01'::date, '2026-12-31'::date);
INSERT INTO public.academic_years (id, branch_id, name, start_date, end_date) VALUES ('00000000-0000-0000-0000-000000000102'::uuid, '00000000-0000-0000-0000-000000000012'::uuid, '2026-B', '2026-01-01'::date, '2026-12-31'::date);
INSERT INTO public.classes (id, academic_year_id, branch_id, name, level) VALUES ('00000000-0000-0000-0000-000000001001'::uuid, '00000000-0000-0000-0000-000000000101'::uuid, '00000000-0000-0000-0000-000000000011'::uuid, 'Class 1-A', 1);
INSERT INTO public.classes (id, academic_year_id, branch_id, name, level) VALUES ('00000000-0000-0000-0000-000000001002'::uuid, '00000000-0000-0000-0000-000000000102'::uuid, '00000000-0000-0000-0000-000000000012'::uuid, 'Class 1-B', 1);
INSERT INTO public.sections (id, class_id, academic_year_id, branch_id, name) VALUES ('00000000-0000-0000-0000-000000002001'::uuid, '00000000-0000-0000-0000-000000001001'::uuid, '00000000-0000-0000-0000-000000000101'::uuid, '00000000-0000-0000-0000-000000000011'::uuid, 'Sec A-1');
INSERT INTO public.sections (id, class_id, academic_year_id, branch_id, name) VALUES ('00000000-0000-0000-0000-000000002002'::uuid, '00000000-0000-0000-0000-000000001002'::uuid, '00000000-0000-0000-0000-000000000102'::uuid, '00000000-0000-0000-0000-000000000012'::uuid, 'Sec B-1');

INSERT INTO public.students (id, organization_id, first_name, last_name, status) VALUES ('00000000-0000-0000-0000-000000005001'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Student', 'One', 'ACTIVE');
INSERT INTO public.student_branch_profiles (id, student_id, branch_id, admission_number, status) VALUES ('00000000-0000-0000-0000-000000006001'::uuid, '00000000-0000-0000-0000-000000005001'::uuid, '00000000-0000-0000-0000-000000000011'::uuid, 'ADM-001', 'ACTIVE');
INSERT INTO public.enrollments (id, organization_id, branch_id, student_id, student_branch_profile_id, academic_year_id, class_id, section_id, status, effective_from) VALUES ('00000000-0000-0000-0000-000000007001'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000011'::uuid, '00000000-0000-0000-0000-000000005001'::uuid, '00000000-0000-0000-0000-000000006001'::uuid, '00000000-0000-0000-0000-000000000101'::uuid, '00000000-0000-0000-0000-000000001001'::uuid, '00000000-0000-0000-0000-000000002001'::uuid, 'ACTIVE', '2026-01-01');

SELECT auth.uid();
SELECT public.auth_is_super_admin();

SELECT public.rpc_transfer_student(
    '00000000-0000-0000-0000-000000005001'::uuid,
    '00000000-0000-0000-0000-000000000011'::uuid,
    '00000000-0000-0000-0000-000000002002'::uuid,
    '2026-02-01'::date,
    'ADM-002'
);

ROLLBACK;
