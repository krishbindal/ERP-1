import re

with open('supabase/tests/db/11_student_transfer.sql', 'r') as f:
    content = f.read()

# Fix the audit_logs actor_id
content = content.replace("SELECT user_id FROM public.audit_logs", "SELECT actor_id FROM public.audit_logs")

# Fix the actor switch at the end of new tests
# Find the Inactive academic year test
idx = content.find("UPDATE public.academic_years SET status = 'ACTIVE' WHERE id = '00000000-0000-0000-0000-000000000102';")
if idx != -1:
    idx_end = content.find("\n", idx)
    
    # We need to insert the switch back to branch_admin_one
    switch_back = """
-- Switch back to branch_admin_one (who only has Branch A access) for the original test
SELECT set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-000000000004", "app_metadata": {"is_super_admin": false}}', true);
"""
    content = content[:idx_end+1] + switch_back + content[idx_end+1:]

# Make sure there is no double switch back
# Actually, the original file has:
# SELECT set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-000000000004", ...
# right above where I inserted my tests.
# Let's remove the original set_config so we don't have confusion, or just leave it since it's before my tests and gets overwritten anyway.

with open('supabase/tests/db/11_student_transfer.sql', 'w') as f:
    f.write(content)
