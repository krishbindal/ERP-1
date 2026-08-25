import re

with open("supabase/migrations/20260826000000_phase_5_homework.sql", "r") as f:
    sql = f.read()

# Fix Teacher check in RPCs and RLS
sql = sql.replace(
    "WHERE sbp.user_id = auth.uid()",
    "JOIN public.staff s_auth ON sbp.staff_id = s_auth.id WHERE s_auth.profile_id = auth.uid()"
)

# Fix student check in RPCs and RLS
sql = sql.replace(
    "WHERE user_id = auth.uid()",
    "WHERE profile_id = auth.uid()"
)
sql = sql.replace(
    "WHERE s.user_id = auth.uid()",
    "WHERE s.profile_id = auth.uid()"
)

# Fix guardian check in RPCs and RLS
sql = sql.replace(
    "WHERE g.user_id = auth.uid()",
    "WHERE g.profile_id = auth.uid()"
)

with open("supabase/migrations/20260826000000_phase_5_homework.sql", "w") as f:
    f.write(sql)
