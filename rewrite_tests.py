import re

with open('supabase/tests/db/11_student_transfer.sql', 'r') as f:
    content = f.read()

# We will increase the plan count
content = re.sub(r'SELECT plan\(\d+\);', 'SELECT plan(38);', content)

# We need to add more setup data
setup_addition = """
    ('00000000-0000-0000-0000-000000000005'::uuid, 'branch_admin_dest@test.com', false),
    ('00000000-0000-0000-0000-000000000006'::uuid, 'teacher@test.com', false),
    ('00000000-0000-0000-0000-000000000008'::uuid, 'superadmin2@test.com', true),
    ('00000000-0000-0000-0000-000000000009'::uuid, 'inactive_admin@test.com', false)
"""
content = content.replace("('00000000-0000-0000-0000-000000000007'::uuid, 'superadmin@test.com', true)", 
                          "('00000000-0000-0000-0000-000000000007'::uuid, 'superadmin@test.com', true)," + setup_addition)

profs_addition = """
    ('00000000-0000-0000-0000-000000000005'::uuid, 'Admin', 'Dest'),
    ('00000000-0000-0000-0000-000000000006'::uuid, 'Teacher', 'One'),
    ('00000000-0000-0000-0000-000000000008'::uuid, 'Super', 'Admin2'),
    ('00000000-0000-0000-0000-000000000009'::uuid, 'Inactive', 'Admin')
"""
content = content.replace("('00000000-0000-0000-0000-000000000007'::uuid, 'Super', 'Admin')",
                          "('00000000-0000-0000-0000-000000000007'::uuid, 'Super', 'Admin')," + profs_addition)

omems_addition = """
    ('00000000-0000-0000-0000-000000000005'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000005'::uuid),
    ('00000000-0000-0000-0000-000000000006'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000006'::uuid),
    ('00000000-0000-0000-0000-000000000008'::uuid, '00000000-0000-0000-0000-000000000002'::uuid, '00000000-0000-0000-0000-000000000008'::uuid),
    ('00000000-0000-0000-0000-000000000009'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000009'::uuid)
"""
content = content.replace("('00000000-0000-0000-0000-000000000007'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000007'::uuid)",
                          "('00000000-0000-0000-0000-000000000007'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000007'::uuid)," + omems_addition)

bmems_addition = """
    ,('00000000-0000-0000-0000-000000000004'::uuid, '00000000-0000-0000-0000-000000000012'::uuid, '00000000-0000-0000-0000-000000000005'::uuid),
    ('00000000-0000-0000-0000-000000000005'::uuid, '00000000-0000-0000-0000-000000000011'::uuid, '00000000-0000-0000-0000-000000000006'::uuid),
    ('00000000-0000-0000-0000-000000000006'::uuid, '00000000-0000-0000-0000-000000000011'::uuid, '00000000-0000-0000-0000-000000000009'::uuid),
    ('00000000-0000-0000-0000-000000000007'::uuid, '00000000-0000-0000-0000-000000000012'::uuid, '00000000-0000-0000-0000-000000000009'::uuid)
"""
content = content.replace("('00000000-0000-0000-0000-000000000003'::uuid, '00000000-0000-0000-0000-000000000011'::uuid, '00000000-0000-0000-0000-000000000004'::uuid)",
                          "('00000000-0000-0000-0000-000000000003'::uuid, '00000000-0000-0000-0000-000000000011'::uuid, '00000000-0000-0000-0000-000000000004'::uuid)" + bmems_addition)

rls_def_addition = """
    ,('00000000-0000-0000-0000-000000000002'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Teacher')
"""
content = content.replace("('00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Branch Admin')",
                          "('00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Branch Admin')" + rls_def_addition)

ura_addition = """
    ,('00000000-0000-0000-0000-000000000004'::uuid, '00000000-0000-0000-0000-000000000004'::uuid, '00000000-0000-0000-0000-000000000001'::uuid),
    ('00000000-0000-0000-0000-000000000005'::uuid, '00000000-0000-0000-0000-000000000005'::uuid, '00000000-0000-0000-0000-000000000002'::uuid),
    ('00000000-0000-0000-0000-000000000006'::uuid, '00000000-0000-0000-0000-000000000006'::uuid, '00000000-0000-0000-0000-000000000001'::uuid),
    ('00000000-0000-0000-0000-000000000007'::uuid, '00000000-0000-0000-0000-000000000007'::uuid, '00000000-0000-0000-0000-000000000001'::uuid)
"""
content = content.replace("('00000000-0000-0000-0000-000000000003'::uuid, '00000000-0000-0000-0000-000000000003'::uuid, '00000000-0000-0000-0000-000000000001'::uuid)",
                          "('00000000-0000-0000-0000-000000000003'::uuid, '00000000-0000-0000-0000-000000000003'::uuid, '00000000-0000-0000-0000-000000000001'::uuid)" + ura_addition)

# Add inactive student
content = content.replace("-- Create Student", """-- Create Inactive Student
INSERT INTO public.students (id, organization_id, first_name, last_name, status)
VALUES ('00000000-0000-0000-0000-000000005002'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Inactive', 'Student', 'ARCHIVED');

-- Create Student""")

tests_to_insert = """
-- Test destination-only admin denied
SELECT set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-000000000005", "app_metadata": {"is_super_admin": false}}', true);
SELECT throws_ok(
    $$ SELECT public.rpc_transfer_student('00000000-0000-0000-0000-000000005001'::uuid, '00000000-0000-0000-0000-000000000011'::uuid, '00000000-0000-0000-0000-000000002002'::uuid, '2026-02-01'::date, 'ADM-002') $$,
    'P0001', 'Not authorized: Must be Super Admin or Branch Admin for both branches', 'Destination-only Branch Admin denied'
);

-- Test teacher denied
SELECT set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-000000000006", "app_metadata": {"is_super_admin": false}}', true);
SELECT throws_ok(
    $$ SELECT public.rpc_transfer_student('00000000-0000-0000-0000-000000005001'::uuid, '00000000-0000-0000-0000-000000000011'::uuid, '00000000-0000-0000-0000-000000002002'::uuid, '2026-02-01'::date, 'ADM-002') $$,
    'P0001', 'Not authorized: Must be Super Admin or Branch Admin for both branches', 'Teacher denied'
);

-- Make admin's source membership inactive
UPDATE public.branch_memberships SET status = 'SUSPENDED' WHERE user_id = '00000000-0000-0000-0000-000000000009' AND branch_id = '00000000-0000-0000-0000-000000000011';
SELECT set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-000000000009", "app_metadata": {"is_super_admin": false}}', true);
SELECT throws_ok(
    $$ SELECT public.rpc_transfer_student('00000000-0000-0000-0000-000000005001'::uuid, '00000000-0000-0000-0000-000000000011'::uuid, '00000000-0000-0000-0000-000000002002'::uuid, '2026-02-01'::date, 'ADM-002') $$,
    'P0001', 'Not authorized: Must be Super Admin or Branch Admin for both branches', 'Inactive source membership denied'
);

-- Make admin's dest membership inactive (after restoring source)
UPDATE public.branch_memberships SET status = 'ACTIVE' WHERE user_id = '00000000-0000-0000-0000-000000000009' AND branch_id = '00000000-0000-0000-0000-000000000011';
UPDATE public.branch_memberships SET status = 'SUSPENDED' WHERE user_id = '00000000-0000-0000-0000-000000000009' AND branch_id = '00000000-0000-0000-0000-000000000012';
SELECT throws_ok(
    $$ SELECT public.rpc_transfer_student('00000000-0000-0000-0000-000000005001'::uuid, '00000000-0000-0000-0000-000000000011'::uuid, '00000000-0000-0000-0000-000000002002'::uuid, '2026-02-01'::date, 'ADM-002') $$,
    'P0001', 'Not authorized: Must be Super Admin or Branch Admin for both branches', 'Inactive dest membership denied'
);

-- Super admin other org
SELECT set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-000000000008", "app_metadata": {"is_super_admin": true}}', true);
SELECT throws_ok(
    $$ SELECT public.rpc_transfer_student('00000000-0000-0000-0000-000000005001'::uuid, '00000000-0000-0000-0000-000000000011'::uuid, '00000000-0000-0000-0000-000000002002'::uuid, '2026-02-01'::date, 'ADM-002') $$,
    'P0001', 'Not authorized: Must be Super Admin or Branch Admin for both branches', 'Super admin from unrelated org denied'
);

-- Super admin inactive membership
UPDATE public.organization_memberships SET status = 'SUSPENDED' WHERE user_id = '00000000-0000-0000-0000-000000000007';
SELECT set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-000000000007", "app_metadata": {"is_super_admin": true}}', true);
SELECT throws_ok(
    $$ SELECT public.rpc_transfer_student('00000000-0000-0000-0000-000000005001'::uuid, '00000000-0000-0000-0000-000000000011'::uuid, '00000000-0000-0000-0000-000000002002'::uuid, '2026-02-01'::date, 'ADM-002') $$,
    'P0001', 'Not authorized: Must be Super Admin or Branch Admin for both branches', 'Inactive super admin membership denied'
);
UPDATE public.organization_memberships SET status = 'ACTIVE' WHERE user_id = '00000000-0000-0000-0000-000000000007';

-- Switch to active super admin for remaining error cases
SELECT set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-000000000007", "app_metadata": {"is_super_admin": true}}', true);

-- Inactive student
SELECT throws_ok(
    $$ SELECT public.rpc_transfer_student('00000000-0000-0000-0000-000000005002'::uuid, '00000000-0000-0000-0000-000000000011'::uuid, '00000000-0000-0000-0000-000000002002'::uuid, '2026-02-01'::date, 'ADM-002') $$,
    'P0001', 'Student is not active or does not exist', 'Inactive student denied'
);

-- Inactive destination branch
UPDATE public.branches SET status = 'ARCHIVED' WHERE id = '00000000-0000-0000-0000-000000000012';
SELECT throws_ok(
    $$ SELECT public.rpc_transfer_student('00000000-0000-0000-0000-000000005001'::uuid, '00000000-0000-0000-0000-000000000011'::uuid, '00000000-0000-0000-0000-000000002002'::uuid, '2026-02-01'::date, 'ADM-002') $$,
    'P0001', 'Destination branch is not active', 'Inactive destination branch denied'
);
UPDATE public.branches SET status = 'ACTIVE' WHERE id = '00000000-0000-0000-0000-000000000012';

-- Inactive academic year
UPDATE public.academic_years SET status = 'ARCHIVED' WHERE id = '00000000-0000-0000-0000-000000000102';
SELECT throws_ok(
    $$ SELECT public.rpc_transfer_student('00000000-0000-0000-0000-000000005001'::uuid, '00000000-0000-0000-0000-000000000011'::uuid, '00000000-0000-0000-0000-000000002002'::uuid, '2026-02-01'::date, 'ADM-002') $$,
    'P0001', 'Destination academic year is not active or planned', 'Inactive academic year denied'
);
UPDATE public.academic_years SET status = 'ACTIVE' WHERE id = '00000000-0000-0000-0000-000000000102';
"""

# Insert the tests before the first SELECT throws_ok
idx = content.find("SELECT throws_ok(")
content = content[:idx] + tests_to_insert + "\n" + content[idx:]

# Ensure audit actor test is present
audit_test = """
-- Verify audit log actor
SELECT results_eq(
    $$ SELECT user_id FROM public.audit_logs WHERE action = 'INSERT' AND table_name = 'enrollments' AND new_data->>'branch_id' = '00000000-0000-0000-0000-000000000012' LIMIT 1 $$,
    $$ VALUES ('00000000-0000-0000-0000-000000000003'::uuid) $$,
    'Audit log is created with correct actor'
);
"""
content = content.replace("-- Verify unique constraints by trying to add a second ACTIVE profile", audit_test + "\n-- Verify unique constraints by trying to add a second ACTIVE profile")

# Parent deletion test
parent_delete_test = """
-- Verify parent deletion triggers RESTRICT or trigger exception
SELECT throws_ok(
    $$ DELETE FROM public.students WHERE id = '00000000-0000-0000-0000-000000005001'::uuid $$,
    'P0001',
    NULL,
    'Deletion of parent records with dependents protected'
);
"""
content = content.replace("SELECT * FROM finish();", parent_delete_test + "\nSELECT * FROM finish();")

# Write out the content
with open('supabase/tests/db/11_student_transfer_new.sql', 'w') as f:
    f.write(content)

print("done")
