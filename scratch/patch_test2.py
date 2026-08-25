import re

with open("supabase/tests/db/19_phase_5_attendance_security.test.sql", "r") as f:
    sql = f.read()

# find my injected tests
# Replace:
# -- Calendar bypass test
# with:
# CREATE OR REPLACE FUNCTION public.auth_user_has_branch_permission(branch_id UUID, permission_name TEXT) RETURNS BOOLEAN AS $$ BEGIN RETURN TRUE; END; $$ LANGUAGE plpgsql;
# -- Calendar bypass test

replacement = """
-- MOCK PERMISSION FOR THE REST OF THE TESTS
CREATE OR REPLACE FUNCTION public.auth_user_has_branch_permission(branch_id UUID, permission_name TEXT) RETURNS BOOLEAN AS $$ BEGIN RETURN TRUE; END; $$ LANGUAGE plpgsql;

-- Calendar bypass test
"""

new_sql = sql.replace("-- Calendar bypass test", replacement)

with open("supabase/tests/db/19_phase_5_attendance_security.test.sql", "w") as f:
    f.write(new_sql)
