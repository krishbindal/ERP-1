import re

with open("supabase/tests/db/19_phase_5_attendance_security.test.sql", "r") as f:
    sql = f.read()

# Replace:
# CREATE OR REPLACE FUNCTION public.auth_user_has_branch_permission(branch_id UUID, permission_name TEXT) RETURNS BOOLEAN AS $$ BEGIN RETURN TRUE; END; $$ LANGUAGE plpgsql;
# with:
# DROP FUNCTION IF EXISTS public.auth_user_has_branch_permission(UUID, TEXT);
# CREATE OR REPLACE FUNCTION public.auth_user_has_branch_permission(target_branch_id UUID, permission_name TEXT) RETURNS BOOLEAN AS $$ BEGIN RETURN TRUE; END; $$ LANGUAGE plpgsql;

new_sql = sql.replace(
    "CREATE OR REPLACE FUNCTION public.auth_user_has_branch_permission(branch_id UUID, permission_name TEXT) RETURNS BOOLEAN AS $$ BEGIN RETURN TRUE; END; $$ LANGUAGE plpgsql;",
    """DROP FUNCTION IF EXISTS public.auth_user_has_branch_permission(UUID, TEXT);
CREATE OR REPLACE FUNCTION public.auth_user_has_branch_permission(target_branch_id UUID, permission_name TEXT) RETURNS BOOLEAN AS $$ BEGIN RETURN TRUE; END; $$ LANGUAGE plpgsql;"""
)

with open("supabase/tests/db/19_phase_5_attendance_security.test.sql", "w") as f:
    f.write(new_sql)
