BEGIN;

SELECT plan(10);

DO $$
DECLARE
    v_org_id UUID;
    v_branch_id UUID;
    v_year_id UUID;
    v_class_id UUID;
    v_section_id UUID;
    v_section_id_2 UUID;
    v_subject_id UUID;
    v_staff_id UUID;
    v_staff_id_2 UUID;
    v_staff_id_3 UUID;
    v_room_id UUID;
    v_room_id_2 UUID;
    v_room_id_3 UUID;
    v_bell_id UUID;
    v_period_id UUID;
    v_te_id UUID;
    v_te_id_2 UUID;
BEGIN
    v_org_id := gen_random_uuid();
    INSERT INTO public.organizations (id, name) VALUES (v_org_id, 'Test Org');

    v_branch_id := gen_random_uuid();
    INSERT INTO public.branches (id, organization_id, name) VALUES (v_branch_id, v_org_id, 'Test Branch');

    v_year_id := gen_random_uuid();
    INSERT INTO public.academic_years (id, branch_id, name, start_date, end_date) 
    VALUES (v_year_id, v_branch_id, '2026', '2026-01-01', '2026-12-31');

    v_class_id := gen_random_uuid();
    INSERT INTO public.classes (id, branch_id, academic_year_id, name, level) 
    VALUES (v_class_id, v_branch_id, v_year_id, 'Class 1', 1);

    v_section_id := gen_random_uuid();
    INSERT INTO public.sections (id, class_id, academic_year_id, branch_id, name) 
    VALUES (v_section_id, v_class_id, v_year_id, v_branch_id, 'Section A');

    v_section_id_2 := gen_random_uuid();
    INSERT INTO public.sections (id, class_id, academic_year_id, branch_id, name) 
    VALUES (v_section_id_2, v_class_id, v_year_id, v_branch_id, 'Section B');

    v_subject_id := gen_random_uuid();
    INSERT INTO public.subjects (id, branch_id, name, code) 
    VALUES (v_subject_id, v_branch_id, 'Math', 'MAT');

    v_staff_id := gen_random_uuid();
    INSERT INTO public.staff (id, organization_id, first_name, last_name) VALUES (v_staff_id, v_org_id, 'Teacher', 'A');
    INSERT INTO public.staff_branch_profiles (id, staff_id, branch_id) 
    VALUES (v_staff_id, v_staff_id, v_branch_id);
    v_staff_id_2 := gen_random_uuid();
    INSERT INTO public.staff (id, organization_id, first_name, last_name) VALUES (v_staff_id_2, v_org_id, 'Teacher', 'B');
    INSERT INTO public.staff_branch_profiles (id, staff_id, branch_id) 
    VALUES (v_staff_id_2, v_staff_id_2, v_branch_id);
    v_staff_id_3 := gen_random_uuid();
    INSERT INTO public.staff (id, organization_id, first_name, last_name) VALUES (v_staff_id_3, v_org_id, 'Teacher', 'C');
    INSERT INTO public.staff_branch_profiles (id, staff_id, branch_id) 
    VALUES (v_staff_id_3, v_staff_id_3, v_branch_id);

    v_room_id := gen_random_uuid();
    INSERT INTO public.rooms (id, branch_id, name) VALUES (v_room_id, v_branch_id, 'Room A');
    v_room_id_2 := gen_random_uuid();
    INSERT INTO public.rooms (id, branch_id, name) VALUES (v_room_id_2, v_branch_id, 'Room B');
    v_room_id_3 := gen_random_uuid();
    INSERT INTO public.rooms (id, branch_id, name) VALUES (v_room_id_3, v_branch_id, 'Room C');

    v_bell_id := gen_random_uuid();
    INSERT INTO public.bell_schedules (id, branch_id, name) VALUES (v_bell_id, v_branch_id, 'Standard');
    
    v_period_id := gen_random_uuid();
    INSERT INTO public.periods (id, bell_schedule_id, branch_id, name, start_time, end_time) 
    VALUES (v_period_id, v_bell_id, v_branch_id, 'Period 1', '09:00:00', '09:45:00');

    v_te_id := gen_random_uuid();
    INSERT INTO public.timetable_entries (id, academic_year_id, branch_id, class_id, section_id, subject_id, period_id, room_id, staff_branch_profile_id, day_of_week) 
    VALUES (v_te_id, v_year_id, v_branch_id, v_class_id, v_section_id, v_subject_id, v_period_id, v_room_id, v_staff_id, 1);

    v_te_id_2 := gen_random_uuid();
    INSERT INTO public.timetable_entries (id, academic_year_id, branch_id, class_id, section_id, subject_id, period_id, room_id, staff_branch_profile_id, day_of_week) 
    VALUES (v_te_id_2, v_year_id, v_branch_id, v_class_id, v_section_id_2, v_subject_id, v_period_id, v_room_id_2, v_staff_id_2, 1);

    PERFORM set_config('test.branch_id', v_branch_id::text, true);
    PERFORM set_config('test.year_id', v_year_id::text, true);
    PERFORM set_config('test.period_id', v_period_id::text, true);
    PERFORM set_config('test.te_id', v_te_id::text, true);
    PERFORM set_config('test.te_id_2', v_te_id_2::text, true);
    PERFORM set_config('test.staff_id', v_staff_id::text, true);
    PERFORM set_config('test.staff_id_2', v_staff_id_2::text, true);
    PERFORM set_config('test.staff_id_3', v_staff_id_3::text, true);
    PERFORM set_config('test.room_id', v_room_id::text, true);
    PERFORM set_config('test.room_id_2', v_room_id_2::text, true);
    PERFORM set_config('test.room_id_3', v_room_id_3::text, true);
END $$;

-- 1. Period Immutability Tests
PREPARE update_period_unreferenced AS UPDATE public.periods SET start_time = '09:15:00' WHERE id != current_setting('test.period_id')::uuid;
SELECT lives_ok('update_period_unreferenced', 'Unreferenced period can be modified');

PREPARE update_period_referenced AS UPDATE public.periods SET start_time = '09:15:00' WHERE id = current_setting('test.period_id')::uuid;
SELECT throws_ok('update_period_referenced', 'Cannot modify time bounds of a period that is referenced by a timetable entry', 'Referenced period cannot modify time bounds');

-- 2. Academic Year Bounds Tests
PREPARE insert_sub_out_of_bounds AS INSERT INTO public.timetable_substitutions (timetable_entry_id, branch_id, academic_year_id, substitution_date, substitute_staff_id)
VALUES (current_setting('test.te_id')::uuid, current_setting('test.branch_id')::uuid, current_setting('test.year_id')::uuid, '2025-12-29', current_setting('test.staff_id_3')::uuid);
SELECT throws_ok('insert_sub_out_of_bounds', 'Substitution date 2025-12-29 is outside the academic year bounds (2026-01-01 to 2026-12-31)', 'Substitution date must fall within academic year bounds');

PREPARE insert_sub_wrong_dow AS INSERT INTO public.timetable_substitutions (timetable_entry_id, branch_id, academic_year_id, substitution_date, substitute_staff_id)
VALUES (current_setting('test.te_id')::uuid, current_setting('test.branch_id')::uuid, current_setting('test.year_id')::uuid, '2026-01-06', current_setting('test.staff_id_3')::uuid);
SELECT throws_ok('insert_sub_wrong_dow', 'Substitution date 2026-01-06 does not match timetable day of week 1', 'Substitution date must match day of week');

-- 3. Room Conflict Fix Tests
-- Sub 1: For Entry 1 (Room A). Changes teacher to C, room remains NULL (Room A).
PREPARE insert_sub_null_room AS INSERT INTO public.timetable_substitutions (timetable_entry_id, branch_id, academic_year_id, substitution_date, substitute_staff_id, substitute_room_id)
       VALUES (current_setting('test.te_id')::uuid, current_setting('test.branch_id')::uuid, current_setting('test.year_id')::uuid, '2026-01-05', current_setting('test.staff_id_3')::uuid, NULL); 
SELECT lives_ok('insert_sub_null_room', 'Sub 1 (NULL room) succeeds');

-- Sub 2: For Entry 2 (Room B). Attempt to move to Room A. Should fail because Room A is occupied by Sub 1.
PREPARE insert_sub_room_conflict AS INSERT INTO public.timetable_substitutions (timetable_entry_id, branch_id, academic_year_id, substitution_date, substitute_staff_id, substitute_room_id)
VALUES (current_setting('test.te_id_2')::uuid, current_setting('test.branch_id')::uuid, current_setting('test.year_id')::uuid, '2026-01-05', current_setting('test.staff_id_2')::uuid, current_setting('test.room_id')::uuid);
SELECT throws_ok('insert_sub_room_conflict', 'Physical conflict: Substitute resource is double-booked on this date via another substitution', 'Sub 2 fails because Room A is still occupied by Sub 1');

-- Cancel Sub 1
UPDATE public.timetable_substitutions SET status = 'CANCELLED' WHERE timetable_entry_id = current_setting('test.te_id')::uuid;

-- Sub 2 should STILL fail because Room A is occupied by CANONICAL Entry 1
SELECT throws_ok('insert_sub_room_conflict', 'Physical conflict: Substitute resource is double-booked on this date via a canonical timetable entry', 'Sub 2 fails because Room A is occupied by Canonical Entry 1');

-- Sub 3: For Entry 1 (Room A). Changes teacher to C AND moves to Room B. Should fail because Room B is occupied by Canonical Entry 2.
PREPARE insert_sub_room_conflict_2 AS INSERT INTO public.timetable_substitutions (timetable_entry_id, branch_id, academic_year_id, substitution_date, substitute_staff_id, substitute_room_id)
VALUES (current_setting('test.te_id')::uuid, current_setting('test.branch_id')::uuid, current_setting('test.year_id')::uuid, '2026-01-05', current_setting('test.staff_id_3')::uuid, current_setting('test.room_id_2')::uuid);
SELECT throws_ok('insert_sub_room_conflict_2', 'Physical conflict: Substitute resource is double-booked on this date via a canonical timetable entry', 'Sub 3 fails because Room B is occupied by Canonical Entry 2');

-- Sub 4: For Entry 2 (Room B). Moves to Room C.
PREPARE insert_sub_4 AS INSERT INTO public.timetable_substitutions (timetable_entry_id, branch_id, academic_year_id, substitution_date, substitute_staff_id, substitute_room_id)
       VALUES (current_setting('test.te_id_2')::uuid, current_setting('test.branch_id')::uuid, current_setting('test.year_id')::uuid, '2026-01-05', current_setting('test.staff_id_2')::uuid, current_setting('test.room_id_3')::uuid); 
SELECT lives_ok('insert_sub_4', 'Sub 4 succeeds in moving Entry 2 to Room C (vacates Room B)');

-- Now Sub 3 (Entry 1 moves to Room B) should SUCCEED because Room B is vacated by Sub 4!
SELECT lives_ok('insert_sub_room_conflict_2', 'Sub 3 succeeds because Room B was vacated by Sub 4');

SELECT * FROM finish();
ROLLBACK;
