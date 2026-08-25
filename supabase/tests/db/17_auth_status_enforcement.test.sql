BEGIN;

SELECT plan(15);

DO $$
DECLARE
    v_org_id UUID;
    v_branch_id UUID;
    v_user_id UUID := '11111111-1111-1111-1111-111111111111';
    v_super_admin_id UUID := '22222222-2222-2222-2222-222222222222';
    v_other_branch_id UUID;
    v_role_id UUID;
    v_bm_id UUID;
    v_om_id UUID;
    v_room_id UUID;
BEGIN
    v_org_id := gen_random_uuid();
    INSERT INTO public.organizations (id, name, status) VALUES (v_org_id, 'Test Org', 'ACTIVE');
    
    v_branch_id := gen_random_uuid();
    INSERT INTO public.branches (id, organization_id, name, status) VALUES (v_branch_id, v_org_id, 'Test Branch', 'ACTIVE');

    DECLARE v_other_org_id UUID := gen_random_uuid();
    BEGIN
        INSERT INTO public.organizations (id, name, status) VALUES (v_other_org_id, 'Other Org', 'ACTIVE');
        v_other_branch_id := gen_random_uuid();
        INSERT INTO public.branches (id, organization_id, name, status) VALUES (v_other_branch_id, v_other_org_id, 'Other Branch', 'ACTIVE');
    END;

    -- Create role if not exists
    SELECT id INTO v_role_id FROM public.roles WHERE name = 'Branch Admin';
    IF v_role_id IS NULL THEN
        v_role_id := gen_random_uuid();
        INSERT INTO public.roles (id, name) VALUES (v_role_id, 'Branch Admin');
    END IF;

    -- Create users
    INSERT INTO auth.users (id, email) VALUES (v_user_id, 'testadmin@example.com');
    INSERT INTO public.profiles (id, first_name, last_name) VALUES (v_user_id, 'Test', 'Admin');
    
    INSERT INTO auth.users (id, email) VALUES (v_super_admin_id, 'superadmin@example.com');
    INSERT INTO public.profiles (id, first_name, last_name) VALUES (v_super_admin_id, 'Super', 'Admin');

    -- Organization membership
    v_om_id := gen_random_uuid();
    INSERT INTO public.organization_memberships (id, organization_id, user_id, status) VALUES (v_om_id, v_org_id, v_user_id, 'ACTIVE');

    -- Branch membership
    v_bm_id := gen_random_uuid();
    INSERT INTO public.branch_memberships (id, branch_id, user_id, status) VALUES (v_bm_id, v_branch_id, v_user_id, 'ACTIVE');
    
    -- Role assignment
    INSERT INTO public.user_role_assignments (branch_membership_id, role_id) VALUES (v_bm_id, v_role_id);

    -- Super Admin memberships
    INSERT INTO public.organization_memberships (organization_id, user_id, status) VALUES (v_org_id, v_super_admin_id, 'ACTIVE');
    -- NOTE: Super admin does NOT have a branch membership with a role, to test that they still get access if authorized in org/branch? Wait, no. The prompt says: "Super Admin: authorized organization/branch allowed, unauthorized organization/branch denied".
    -- Super Admins are typically granted access via auth_is_super_admin(). We must verify they can mutate if authorized.
    INSERT INTO public.branch_memberships (branch_id, user_id, status) VALUES (v_branch_id, v_super_admin_id, 'ACTIVE');

    PERFORM set_config('test.user_id', v_user_id::text, true);
    PERFORM set_config('test.super_admin_id', v_super_admin_id::text, true);
    PERFORM set_config('test.branch_id', v_branch_id::text, true);
    PERFORM set_config('test.other_branch_id', v_other_branch_id::text, true);
    PERFORM set_config('test.org_id', v_org_id::text, true);
END $$;

-- 1. ACTIVE Branch Admin
SET ROLE authenticated;
SELECT set_config('request.jwt.claims', format('{"sub":"%s"}', current_setting('test.user_id')), true);

PREPARE insert_room AS INSERT INTO public.rooms (id, branch_id, name) VALUES ('00000000-0000-0000-0000-000000000001'::uuid, current_setting('test.branch_id')::uuid, 'Room 1');
SELECT lives_ok('insert_room', 'ACTIVE Branch Admin: insert allowed');

PREPARE update_room AS UPDATE public.rooms SET name = 'Room 1 Updated' WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;
SELECT lives_ok('update_room', 'ACTIVE Branch Admin: update allowed');

PREPARE delete_room AS DELETE FROM public.rooms WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;
SELECT lives_ok('delete_room', 'ACTIVE Branch Admin: delete allowed');

-- Cross-branch
PREPARE insert_cross_branch AS INSERT INTO public.rooms (id, branch_id, name) VALUES ('00000000-0000-0000-0000-000000000002'::uuid, current_setting('test.other_branch_id')::uuid, 'Room 2');
SELECT throws_ok('insert_cross_branch', '42501', 'new row violates row-level security policy for table "rooms"', 'Cross-branch: insert denied');

-- 2. SUSPENDED Branch Admin
SET ROLE postgres;
UPDATE public.branch_memberships SET status = 'SUSPENDED' WHERE user_id = current_setting('test.user_id')::uuid AND branch_id = current_setting('test.branch_id')::uuid;
INSERT INTO public.rooms (id, branch_id, name) VALUES ('00000000-0000-0000-0000-000000000004'::uuid, current_setting('test.branch_id')::uuid, 'Room 4');
SET ROLE authenticated;
SELECT set_config('request.jwt.claims', format('{"sub":"%s"}', current_setting('test.user_id')), true);

PREPARE insert_room_sus AS INSERT INTO public.rooms (id, branch_id, name) VALUES ('00000000-0000-0000-0000-000000000003'::uuid, current_setting('test.branch_id')::uuid, 'Room 3');
SELECT throws_ok('insert_room_sus', '42501', 'new row violates row-level security policy for table "rooms"', 'SUSPENDED Branch Admin: insert denied');

UPDATE public.rooms SET name = 'Room 4 Updated' WHERE id = '00000000-0000-0000-0000-000000000004'::uuid;
SET ROLE postgres;
SELECT results_eq('SELECT name FROM public.rooms WHERE id = ''00000000-0000-0000-0000-000000000004''::uuid', ARRAY['Room 4'::text], 'SUSPENDED Branch Admin: update denied (0 rows affected)');
SET ROLE authenticated;
DELETE FROM public.rooms WHERE id = '00000000-0000-0000-0000-000000000004'::uuid;
SET ROLE postgres;
SELECT results_eq('SELECT name FROM public.rooms WHERE id = ''00000000-0000-0000-0000-000000000004''::uuid', ARRAY['Room 4'::text], 'SUSPENDED Branch Admin: delete denied (0 rows affected)');

-- 3. REVOKED/INACTIVE organization membership
SET ROLE postgres;
UPDATE public.branch_memberships SET status = 'ACTIVE' WHERE user_id = current_setting('test.user_id')::uuid AND branch_id = current_setting('test.branch_id')::uuid;
UPDATE public.organization_memberships SET status = 'ARCHIVED' WHERE user_id = current_setting('test.user_id')::uuid AND organization_id = current_setting('test.org_id')::uuid;
SET ROLE authenticated;

PREPARE insert_room_revoked AS INSERT INTO public.rooms (id, branch_id, name) VALUES ('00000000-0000-0000-0000-000000000003'::uuid, current_setting('test.branch_id')::uuid, 'Room 3');
SELECT throws_ok('insert_room_revoked', '42501', 'new row violates row-level security policy for table "rooms"', 'REVOKED Org Membership: insert denied');
UPDATE public.rooms SET name = 'Room 4 Updated' WHERE id = '00000000-0000-0000-0000-000000000004'::uuid;
SET ROLE postgres;
SELECT results_eq('SELECT name FROM public.rooms WHERE id = ''00000000-0000-0000-0000-000000000004''::uuid', ARRAY['Room 4'::text], 'REVOKED Org Membership: update denied');
SET ROLE authenticated;
DELETE FROM public.rooms WHERE id = '00000000-0000-0000-0000-000000000004'::uuid;
SET ROLE postgres;
SELECT results_eq('SELECT name FROM public.rooms WHERE id = ''00000000-0000-0000-0000-000000000004''::uuid', ARRAY['Room 4'::text], 'REVOKED Org Membership: delete denied');

-- 4. ARCHIVED/INACTIVE branch
SET ROLE postgres;
UPDATE public.organization_memberships SET status = 'ACTIVE' WHERE user_id = current_setting('test.user_id')::uuid AND organization_id = current_setting('test.org_id')::uuid;
UPDATE public.branches SET status = 'ARCHIVED' WHERE id = current_setting('test.branch_id')::uuid;
SET ROLE authenticated;

PREPARE insert_room_archived AS INSERT INTO public.rooms (id, branch_id, name) VALUES ('00000000-0000-0000-0000-000000000003'::uuid, current_setting('test.branch_id')::uuid, 'Room 3');
SELECT throws_ok('insert_room_archived', '42501', 'new row violates row-level security policy for table "rooms"', 'ARCHIVED Branch: insert denied');
UPDATE public.rooms SET name = 'Room 4 Updated' WHERE id = '00000000-0000-0000-0000-000000000004'::uuid;
SET ROLE postgres;
SELECT results_eq('SELECT name FROM public.rooms WHERE id = ''00000000-0000-0000-0000-000000000004''::uuid', ARRAY['Room 4'::text], 'ARCHIVED Branch: update denied');
SET ROLE authenticated;
DELETE FROM public.rooms WHERE id = '00000000-0000-0000-0000-000000000004'::uuid;
SET ROLE postgres;
SELECT results_eq('SELECT name FROM public.rooms WHERE id = ''00000000-0000-0000-0000-000000000004''::uuid', ARRAY['Room 4'::text], 'ARCHIVED Branch: delete denied');

-- 5. Super Admin
SET ROLE postgres;
UPDATE public.branches SET status = 'ACTIVE' WHERE id = current_setting('test.branch_id')::uuid;
SET ROLE authenticated;
SELECT set_config('request.jwt.claims', format('{"sub":"%s", "app_metadata": {"is_super_admin": true}}', current_setting('test.super_admin_id')), true);

PREPARE insert_room_sa AS INSERT INTO public.rooms (id, branch_id, name) VALUES ('00000000-0000-0000-0000-000000000005'::uuid, current_setting('test.branch_id')::uuid, 'Room 5');
SELECT lives_ok('insert_room_sa', 'Super Admin: authorized branch allowed');

PREPARE insert_room_sa_unauth AS INSERT INTO public.rooms (id, branch_id, name) VALUES ('00000000-0000-0000-0000-000000000006'::uuid, current_setting('test.other_branch_id')::uuid, 'Room 6');
SELECT throws_ok('insert_room_sa_unauth', '42501', 'new row violates row-level security policy for table "rooms"', 'Super Admin: unauthorized branch denied');

SELECT * FROM finish();
ROLLBACK;
