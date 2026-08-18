BEGIN;

SELECT plan(9);

CREATE FUNCTION get_org_id() RETURNS uuid LANGUAGE sql AS $$ SELECT '11111111-1111-1111-1111-111111111111'::uuid $$;
CREATE FUNCTION get_branch_1() RETURNS uuid LANGUAGE sql AS $$ SELECT '33333333-3333-3333-3333-333333333333'::uuid $$;
CREATE FUNCTION get_branch_2() RETURNS uuid LANGUAGE sql AS $$ SELECT '44444444-4444-4444-4444-444444444444'::uuid $$;
CREATE FUNCTION get_admin_a1() RETURNS uuid LANGUAGE sql AS $$ SELECT '99999999-9999-9999-9999-999999999999'::uuid $$;
CREATE FUNCTION get_admin_a2() RETURNS uuid LANGUAGE sql AS $$ SELECT 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid $$;
CREATE FUNCTION get_staff_a() RETURNS uuid LANGUAGE sql AS $$ SELECT 'dddddddd-0000-0000-0000-000000000000'::uuid $$;
CREATE FUNCTION get_staff_b() RETURNS uuid LANGUAGE sql AS $$ SELECT 'eeeeeeee-0000-0000-0000-000000000000'::uuid $$;

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

-- Act as admin_a1 (Branch 1 Admin)
SELECT set_config('role', 'authenticated', true);
SELECT set_config('request.jwt.claims', format('{"sub": "%s"}', get_admin_a1()), true);

-- Test 1: Branch Admin can insert staff in their org
SELECT lives_ok(
    $$ INSERT INTO public.staff (id, organization_id, first_name, last_name) VALUES ('dddddddd-0000-0000-0000-000000000000', get_org_id(), 'John', 'Doe') $$,
    'Branch Admin can insert staff in their org'
);

-- Test 2: Branch Admin can insert staff branch profile in their branch
SELECT lives_ok(
    $$ INSERT INTO public.staff_branch_profiles (id, staff_id, branch_id, employee_id_local) VALUES ('dddddddd-1111-0000-0000-000000000000', 'dddddddd-0000-0000-0000-000000000000', get_branch_1(), 'EMP-001') $$,
    'Branch Admin can insert staff profile in their branch'
);

-- Test 3: Branch Admin cannot insert staff profile in another branch
SELECT throws_ok(
    $$ INSERT INTO public.staff_branch_profiles (staff_id, branch_id, employee_id_local) VALUES ('dddddddd-0000-0000-0000-000000000000', get_branch_2(), 'EMP-002') $$,
    'new row violates row-level security policy for table "staff_branch_profiles"',
    'Branch Admin cannot insert staff profile in another branch'
);

-- Test 4: Branch Admin can view staff in their branch
SELECT results_eq(
    $$ SELECT COUNT(*)::int FROM public.staff $$,
    $$ VALUES (1::int) $$,
    'Branch Admin can view staff in their branch'
);

-- Act as admin_a2 (Branch 2 Admin)
SELECT set_config('request.jwt.claims', format('{"sub": "%s"}', get_admin_a2()), true);

-- Test 5: Branch Admin cannot view staff in another branch
SELECT results_eq(
    $$ SELECT COUNT(*)::int FROM public.staff $$,
    $$ VALUES (0::int) $$,
    'Branch Admin cannot view staff in another branch'
);

-- Test 6: Branch Admin 2 inserts their own staff
SELECT lives_ok(
    $$ INSERT INTO public.staff (id, organization_id, first_name, last_name) VALUES ('eeeeeeee-0000-0000-0000-000000000000', get_org_id(), 'Jane', 'Smith') $$,
    'Branch Admin 2 can insert staff in their org'
);

SELECT lives_ok(
    $$ INSERT INTO public.staff_branch_profiles (id, staff_id, branch_id, employee_id_local) VALUES ('eeeeeeee-1111-0000-0000-000000000000', 'eeeeeeee-0000-0000-0000-000000000000', get_branch_2(), 'EMP-002') $$,
    'Branch Admin 2 can insert staff profile in their branch'
);

-- Test 7: Branch Admin 2 tries to view Branch 1 staff profile (Negative)
SELECT results_eq(
    $$ SELECT COUNT(*)::int FROM public.staff_branch_profiles WHERE staff_id = 'dddddddd-0000-0000-0000-000000000000' $$,
    $$ VALUES (0::int) $$,
    'Branch Admin 2 cannot view staff profile from Branch 1'
);

-- Test 8: Branch Admin 2 tries to update Branch 1 staff (Negative)
SELECT results_eq(
    $$ UPDATE public.staff SET first_name = 'Hacked' WHERE id = 'dddddddd-0000-0000-0000-000000000000' RETURNING id $$,
    $$ SELECT id FROM public.staff WHERE false $$,
    'Branch Admin 2 cannot update staff from Branch 1'
);

SELECT * FROM finish();
ROLLBACK;
