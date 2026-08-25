import re

with open("supabase/tests/db/19_phase_5_attendance_security.test.sql", "r") as f:
    sql = f.read()

sql = sql.replace(
    "'%Date is outside academic year%|%Cannot record attendance on a non-instructional day%'",
    "'%Cannot record attendance on a non-instructional day%'"
)

with open("supabase/tests/db/19_phase_5_attendance_security.test.sql", "w") as f:
    f.write(sql)
