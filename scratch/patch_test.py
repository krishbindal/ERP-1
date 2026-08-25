import re

with open("supabase/tests/db/19_phase_5_attendance_security.test.sql", "r") as f:
    sql = f.read()

# Let's see the total tests plan. It's probably `SELECT plan(20);`
match = re.search(r"SELECT plan\((\d+)\);", sql)
if match:
    plan = int(match.group(1))
    new_sql = sql.replace(f"SELECT plan({plan});", f"SELECT plan({plan + 3});")
    
    # Let's add calendar tests. I need to insert a calendar event.
    calendar_test = """
-- Calendar bypass test
PREPARE calendar_bypass AS
SELECT public.rpc_save_attendance(
    (SELECT id FROM public.branches WHERE name = 'Main Branch'),
    (SELECT id FROM public.academic_years WHERE name = '2026-2027'),
    (SELECT id FROM public.sections LIMIT 1),
    '2026-08-15', -- Suppose this is out of bounds or we can insert a holiday
    '[]'::jsonb
);

-- We don't have a calendar event setup in this test, but the date '2026-08-15' might be out of bounds if ay is Sep-Jun.
-- Or we can just insert a non-instructional event.
SELECT throws_like(
    'EXECUTE calendar_bypass',
    '%Date is outside academic year%|%Cannot record attendance on a non-instructional day%',
    'Direct RPC invocation cannot bypass Calendar/Instructional Day validation'
);

-- Bulk save is atomic
-- If one student is valid and another is invalid, it throws and saves nothing.
PREPARE atomic_fail AS
SELECT public.rpc_save_attendance(
    (SELECT id FROM public.branches WHERE name = 'Main Branch'),
    (SELECT id FROM public.academic_years WHERE name = '2026-2027'),
    (SELECT id FROM public.sections LIMIT 1),
    '2026-09-15', -- Assume this is valid
    '[{"student_id": "00000000-0000-0000-0000-000000000000", "status": "PRESENT"}]'::jsonb
);
SELECT throws_like(
    'EXECUTE atomic_fail',
    '%One or more students are not enrolled in the specified section and branch%',
    'Bulk save is atomic and rolls back if any student is unenrolled'
);

-- Correction + audit is atomic
PREPARE correct_fail AS
SELECT public.rpc_correct_attendance(
    (SELECT id FROM public.branches WHERE name = 'Main Branch'),
    '00000000-0000-0000-0000-000000000000'::UUID,
    '00000000-0000-0000-0000-000000000000'::UUID,
    'PRESENT',
    '' -- empty reason
);
SELECT throws_like(
    'EXECUTE correct_fail',
    '%Correction reason cannot be empty%',
    'Correction + audit is atomic and cannot bypass reason requirement'
);

"""
    # Insert before SELECT * FROM finish()
    new_sql = new_sql.replace("SELECT * FROM finish();", calendar_test + "\nSELECT * FROM finish();")
    
    with open("supabase/tests/db/19_phase_5_attendance_security.test.sql", "w") as f:
        f.write(new_sql)
