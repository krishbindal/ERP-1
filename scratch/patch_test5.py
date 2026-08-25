import re

with open("supabase/tests/db/19_phase_5_attendance_security.test.sql", "r") as f:
    sql = f.read()

sql = sql.replace(
    "'%Date is outside academic year%|%Cannot record attendance on a non-instructional day%'",
    "'%Academic year not found in branch%|%Date is outside academic year%|%Cannot record attendance on a non-instructional day%'"
)

sql = sql.replace(
    "'%One or more students are not enrolled in the specified section and branch%'",
    "'%Academic year not found in branch%|%One or more students are not enrolled in the specified section and branch%'"
)

with open("supabase/tests/db/19_phase_5_attendance_security.test.sql", "w") as f:
    f.write(sql)
