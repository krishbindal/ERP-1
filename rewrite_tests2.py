import re

with open('supabase/tests/db/11_student_transfer_new.sql', 'r') as f:
    content = f.read()

# We need to increase plan size again because we are adding 4 tests
# Previous was 38? Wait, original was 15. We added:
# 1. dest-only branch admin
# 2. teacher
# 3. inactive source membership
# 4. inactive dest membership
# 5. super admin other org
# 6. inactive super admin
# 7. inactive student
# 8. inactive destination branch
# 9. inactive academic year
# 10. audit log actor
# 11. parent delete test
# Total added = 11. So 15 + 11 = 26.
# Now I am adding 4 function checks, total = 30.
content = re.sub(r'SELECT plan\(\d+\);', 'SELECT plan(30);', content)

function_checks = """
-- Verify function properties
SELECT is_definer('public', 'rpc_transfer_student', ARRAY['uuid', 'uuid', 'uuid', 'date', 'text'], 'Function should be SECURITY DEFINER');
SELECT function_returns('public', 'rpc_transfer_student', ARRAY['uuid', 'uuid', 'uuid', 'date', 'text'], 'uuid', 'Function should return UUID');
SELECT function_owner_is('public', 'rpc_transfer_student', ARRAY['uuid', 'uuid', 'uuid', 'date', 'text'], 'postgres', 'Function should be owned by postgres');

-- Check that EXECUTE is revoked from PUBLIC
SELECT results_eq(
    $$ SELECT has_function_privilege('public', 'public.rpc_transfer_student(uuid, uuid, uuid, date, text)', 'EXECUTE') $$,
    $$ VALUES (false) $$,
    'PUBLIC should not have EXECUTE privilege'
);

-- Check that EXECUTE is granted to authenticated
SELECT results_eq(
    $$ SELECT has_function_privilege('authenticated', 'public.rpc_transfer_student(uuid, uuid, uuid, date, text)', 'EXECUTE') $$,
    $$ VALUES (true) $$,
    'authenticated role should have EXECUTE privilege'
);
"""
# I am actually adding 5 tests (definer, returns, owner, revoke, grant). Wait, I don't know if `function_owner_is` exists. Yes it does.
# But `is_definer` and `has_function_privilege` are standard pgTAP. Actually, I can just use `has_function_privilege('public', ...)` to mean the role PUBLIC.
# Let me recount: I have 26 tests + 5 = 31 tests. Let me set the plan to 31.
content = re.sub(r'SELECT plan\(\d+\);', 'SELECT plan(31);', content)

idx = content.find("-- Test destination-only admin denied")
content = content[:idx] + function_checks + "\n" + content[idx:]

with open('supabase/tests/db/11_student_transfer_new.sql', 'w') as f:
    f.write(content)
