import re

with open("supabase/tests/db/19_phase_5_attendance_security.test.sql", "r") as f:
    sql = f.read()

# Insert dummy academic year for the test
setup = """
-- MOCK PERMISSION FOR THE REST OF THE TESTS
CREATE OR REPLACE FUNCTION public.auth_user_has_branch_permission(target_branch_id uuid, target_permission text) RETURNS BOOLEAN AS $$ BEGIN RETURN TRUE; END; $$ LANGUAGE plpgsql;

INSERT INTO public.academic_years (id, branch_id, name, start_date, end_date, operating_days)
VALUES ('00000000-0000-0000-0000-000000000005'::uuid, '00000000-0000-0000-0000-000000000002'::uuid, 'Test AY', '2026-08-01', '2027-06-30', '{1,2,3,4,5}');
"""

sql = sql.replace(
    "CREATE OR REPLACE FUNCTION public.auth_user_has_branch_permission(target_branch_id uuid, target_permission text) RETURNS BOOLEAN AS $$ BEGIN RETURN TRUE; END; $$ LANGUAGE plpgsql;",
    setup
)

# And fix the tests to use this AY ID
sql = sql.replace(
    "(SELECT id FROM public.academic_years WHERE name = '2026-2027')",
    "'00000000-0000-0000-0000-000000000005'::uuid"
)
sql = sql.replace(
    "(SELECT id FROM public.branches WHERE name = 'Main Branch')",
    "'00000000-0000-0000-0000-000000000002'::uuid"
)

# Fix back the expectations
sql = sql.replace(
    "'%Academic year not found in branch%|%Date is outside academic year%|%Cannot record attendance on a non-instructional day%'",
    "'%Date is outside academic year%|%Cannot record attendance on a non-instructional day%'"
)
sql = sql.replace(
    "'%Academic year not found in branch%|%One or more students are not enrolled in the specified section and branch%'",
    "'%One or more students are not enrolled in the specified section and branch%'"
)

with open("supabase/tests/db/19_phase_5_attendance_security.test.sql", "w") as f:
    f.write(sql)
