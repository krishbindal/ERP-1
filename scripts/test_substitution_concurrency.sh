#!/bin/bash
set -e

echo "Setting up concurrency test data..."

docker exec -i supabase_db_ERP_1 psql -U postgres -v ON_ERROR_STOP=1 << 'SQL'
BEGIN;
CREATE SCHEMA IF NOT EXISTS concurrency_test;
SET search_path TO concurrency_test, public;

TRUNCATE TABLE organizations CASCADE;
TRUNCATE TABLE staff CASCADE;
TRUNCATE TABLE subjects CASCADE;

INSERT INTO organizations (id, name) VALUES ('44444444-4444-4444-4444-444444444444', 'Org');
INSERT INTO branches (id, organization_id, name) VALUES ('55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', 'Branch');

INSERT INTO academic_years (id, branch_id, start_date, end_date, name) VALUES ('66666666-6666-6666-6666-666666666666', '55555555-5555-5555-5555-555555555555', '2026-01-01', '2026-12-31', '2026');

INSERT INTO classes (id, branch_id, academic_year_id, name, level) VALUES ('cccccccc-cccc-cccc-cccc-cccccccccccc', '55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666', 'Class 1', 1);
INSERT INTO sections (id, branch_id, class_id, academic_year_id, name) VALUES ('dddddddd-dddd-dddd-dddd-dddddddddddd', '55555555-5555-5555-5555-555555555555', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '66666666-6666-6666-6666-666666666666', 'A');

INSERT INTO subjects (id, branch_id, name, code) VALUES ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '55555555-5555-5555-5555-555555555555', 'Math', 'MAT');
INSERT INTO rooms (id, branch_id, name) VALUES ('ffffffff-ffff-ffff-ffff-ffffffffffff', '55555555-5555-5555-5555-555555555555', 'Room A');

INSERT INTO staff (id, first_name, last_name, organization_id) VALUES ('11111111-1111-1111-1111-111111111111', 'T1', 'L1', '44444444-4444-4444-4444-444444444444');
INSERT INTO staff (id, first_name, last_name, organization_id) VALUES ('22222222-2222-2222-2222-222222222222', 'T2', 'L2', '44444444-4444-4444-4444-444444444444');
INSERT INTO staff (id, first_name, last_name, organization_id) VALUES ('33333333-3333-3333-3333-333333333333', 'T3', 'L3', '44444444-4444-4444-4444-444444444444');

INSERT INTO staff_branch_profiles (id, staff_id, branch_id) VALUES ('77777777-7777-7777-7777-777777777771', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555');
INSERT INTO staff_branch_profiles (id, staff_id, branch_id) VALUES ('77777777-7777-7777-7777-777777777772', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555');
INSERT INTO staff_branch_profiles (id, staff_id, branch_id) VALUES ('77777777-7777-7777-7777-777777777773', '33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555');

INSERT INTO bell_schedules (id, branch_id, name) VALUES ('88888888-8888-8888-8888-888888888888', '55555555-5555-5555-5555-555555555555', 'Bell');
INSERT INTO periods (id, bell_schedule_id, branch_id, name, start_time, end_time) VALUES ('99999999-9999-9999-9999-999999999999', '88888888-8888-8888-8888-888888888888', '55555555-5555-5555-5555-555555555555', 'P1', '08:00', '09:00');

INSERT INTO timetable_entries (id, academic_year_id, branch_id, class_id, section_id, subject_id, room_id, period_id, day_of_week, staff_branch_profile_id, status)
VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '66666666-6666-6666-6666-666666666666', '55555555-5555-5555-5555-555555555555', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '99999999-9999-9999-9999-999999999999', 1, '77777777-7777-7777-7777-777777777771', 'ACTIVE');
COMMIT;
SQL

echo "Starting concurrent transactions..."

docker exec -i supabase_db_ERP_1 psql -U postgres -v ON_ERROR_STOP=1 << 'SQL' &
BEGIN;
INSERT INTO timetable_substitutions (
    id, academic_year_id, branch_id, timetable_entry_id, substitute_staff_id, substitution_date, status
) VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', '66666666-6666-6666-6666-666666666666', '55555555-5555-5555-5555-555555555555',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '77777777-7777-7777-7777-777777777772', '2026-08-24', 'ACTIVE'
);
SELECT pg_sleep(1.5);
COMMIT;
SQL
PID1=$!

sleep 0.5

docker exec -i supabase_db_ERP_1 psql -U postgres -v ON_ERROR_STOP=0 << 'SQL' > scripts/tx2_output.txt 2>&1 &
BEGIN;
INSERT INTO timetable_substitutions (
    id, academic_year_id, branch_id, timetable_entry_id, substitute_staff_id, substitution_date, status
) VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', '66666666-6666-6666-6666-666666666666', '55555555-5555-5555-5555-555555555555',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '77777777-7777-7777-7777-777777777773', '2026-08-24', 'ACTIVE'
);
COMMIT;
SQL
PID2=$!

wait $PID1
wait $PID2

echo "Transaction 2 Output:"
cat scripts/tx2_output.txt

if grep -q "Physical conflict" scripts/tx2_output.txt; then
    echo "SUCCESS: Concurrency safety verified! Transaction 2 was blocked and then rejected."
    rm scripts/tx2_output.txt
    exit 0
else
    echo "FAIL: Transaction 2 succeeded or failed with a different error!"
    rm scripts/tx2_output.txt
    exit 1
fi
