BEGIN;
SELECT plan(10);

-- Setup
DO $$
DECLARE
    v_org_id UUID;
    v_branch_id UUID;
    v_other_branch_id UUID;
    v_year_id UUID;
    v_other_year_id UUID;
    v_te_id UUID;
    v_te_id_other UUID;
    v_staff_id UUID;
    v_staff_id_2 UUID;
    v_subject_id UUID;
    v_period_id UUID;
    v_bell_id UUID;
    v_class_id UUID;
    v_section_id UUID;
    v_room_id UUID;
BEGIN
    v_org_id := gen_random_uuid();
    INSERT INTO public.organizations (id, name) VALUES (v_org_id, 'Test Org');
    
    v_branch_id := gen_random_uuid();
    INSERT INTO public.branches (id, organization_id, name) VALUES (v_branch_id, v_org_id, 'Test Branch');
    
    v_other_branch_id := gen_random_uuid();
    INSERT INTO public.branches (id, organization_id, name) VALUES (v_other_branch_id, v_org_id, 'Other Branch');

    v_year_id := gen_random_uuid();
    INSERT INTO public.academic_years (id, branch_id, name, start_date, end_date, status) 
    VALUES (v_year_id, v_branch_id, '2026', '2026-01-01', '2026-12-31', 'ACTIVE');
    
    v_other_year_id := gen_random_uuid();
    INSERT INTO public.academic_years (id, branch_id, name, start_date, end_date, status) 
    VALUES (v_other_year_id, v_branch_id, '2027', '2027-01-01', '2027-12-31', 'PLANNED');

    DECLARE v_wrong_active_year_id UUID := gen_random_uuid();
    BEGIN
        INSERT INTO public.academic_years (id, branch_id, name, start_date, end_date, status) 
        VALUES (v_wrong_active_year_id, v_branch_id, '2028', '2028-01-01', '2028-12-31', 'ACTIVE');
        PERFORM set_config('test.wrong_active_year_id', v_wrong_active_year_id::text, true);
    END;

    v_class_id := gen_random_uuid();
    INSERT INTO public.classes (id, academic_year_id, branch_id, name, level) VALUES (v_class_id, v_year_id, v_branch_id, 'Class 1', 10);
    v_section_id := gen_random_uuid();
    INSERT INTO public.sections (id, class_id, academic_year_id, branch_id, name) VALUES (v_section_id, v_class_id, v_year_id, v_branch_id, 'A');
    
    DECLARE
        v_other_class_id UUID := gen_random_uuid();
        v_other_section_id UUID := gen_random_uuid();
    BEGIN
        INSERT INTO public.classes (id, academic_year_id, branch_id, name, level) VALUES (v_other_class_id, v_other_year_id, v_branch_id, 'Class 1 Other', 10);
        INSERT INTO public.sections (id, class_id, academic_year_id, branch_id, name) VALUES (v_other_section_id, v_other_class_id, v_other_year_id, v_branch_id, 'A');

        v_subject_id := gen_random_uuid();
        INSERT INTO public.subjects (id, branch_id, name, code) VALUES (v_subject_id, v_branch_id, 'Math', 'MAT');

        v_staff_id := gen_random_uuid();
        INSERT INTO public.staff (id, organization_id, first_name, last_name) VALUES (v_staff_id, v_org_id, 'Teacher', 'A');
        INSERT INTO public.staff_branch_profiles (id, staff_id, branch_id) VALUES (v_staff_id, v_staff_id, v_branch_id);
        
        v_staff_id_2 := gen_random_uuid();
        INSERT INTO public.staff (id, organization_id, first_name, last_name) VALUES (v_staff_id_2, v_org_id, 'Teacher', 'B');
        INSERT INTO public.staff_branch_profiles (id, staff_id, branch_id) VALUES (v_staff_id_2, v_staff_id_2, v_branch_id);
        
        v_room_id := gen_random_uuid();
        INSERT INTO public.rooms (id, branch_id, name) VALUES (v_room_id, v_branch_id, 'Room A');
        
        DECLARE v_room_id_2 UUID := gen_random_uuid();
        BEGIN
            INSERT INTO public.rooms (id, branch_id, name) VALUES (v_room_id_2, v_branch_id, 'Room B');
            
            v_bell_id := gen_random_uuid();
            INSERT INTO public.bell_schedules (id, branch_id, name) VALUES (v_bell_id, v_branch_id, 'Standard');
            v_period_id := gen_random_uuid();
            INSERT INTO public.periods (id, bell_schedule_id, branch_id, name, start_time, end_time) 
            VALUES (v_period_id, v_bell_id, v_branch_id, 'Period 1', '09:00:00', '09:45:00');

            v_te_id := gen_random_uuid();
            INSERT INTO public.timetable_entries (id, academic_year_id, branch_id, class_id, section_id, subject_id, period_id, room_id, staff_branch_profile_id, day_of_week) 
            VALUES (v_te_id, v_year_id, v_branch_id, v_class_id, v_section_id, v_subject_id, v_period_id, v_room_id, v_staff_id, 1);
            
            v_te_id_other := gen_random_uuid();
            -- A timetable entry in another year just for reference
            INSERT INTO public.timetable_entries (id, academic_year_id, branch_id, class_id, section_id, subject_id, period_id, room_id, staff_branch_profile_id, day_of_week) 
            VALUES (v_te_id_other, v_other_year_id, v_branch_id, v_other_class_id, v_other_section_id, v_subject_id, v_period_id, v_room_id_2, v_staff_id, 1);
        END;
    END;

    PERFORM set_config('test.branch_id', v_branch_id::text, true);
    PERFORM set_config('test.other_branch_id', v_other_branch_id::text, true);
    PERFORM set_config('test.year_id', v_year_id::text, true);
    PERFORM set_config('test.other_year_id', v_other_year_id::text, true);
    PERFORM set_config('test.te_id', v_te_id::text, true);
    PERFORM set_config('test.te_id_other', v_te_id_other::text, true);
    PERFORM set_config('test.staff_id', v_staff_id::text, true);
    PERFORM set_config('test.staff_id_2', v_staff_id_2::text, true);
END $$;

-- 1. Wrong branch timetable entry composite FK rejected
PREPARE insert_wrong_branch AS INSERT INTO public.timetable_substitutions (timetable_entry_id, branch_id, academic_year_id, substitution_date, substitute_staff_id)
VALUES (current_setting('test.te_id')::uuid, current_setting('test.other_branch_id')::uuid, current_setting('test.year_id')::uuid, '2026-01-05', current_setting('test.staff_id_2')::uuid);
SELECT throws_ok('insert_wrong_branch', '23503', NULL, 'wrong branch timetable entry rejected');

-- 2. Wrong academic-year timetable entry composite FK rejected
PREPARE insert_wrong_year AS INSERT INTO public.timetable_substitutions (timetable_entry_id, branch_id, academic_year_id, substitution_date, substitute_staff_id)
VALUES (current_setting('test.te_id')::uuid, current_setting('test.branch_id')::uuid, current_setting('test.wrong_active_year_id')::uuid, '2028-01-03', current_setting('test.staff_id_2')::uuid);
SELECT throws_ok('insert_wrong_year', '23503', NULL, 'wrong academic-year timetable entry rejected');

-- 3. Inactive academic year behavior follows business rule
PREPARE insert_inactive_year AS INSERT INTO public.timetable_substitutions (timetable_entry_id, branch_id, academic_year_id, substitution_date, substitute_staff_id)
VALUES (current_setting('test.te_id_other')::uuid, current_setting('test.branch_id')::uuid, current_setting('test.other_year_id')::uuid, '2027-01-04', current_setting('test.staff_id')::uuid);
SELECT throws_ok('insert_inactive_year', 'P0001', 'Substitutions can only be created in ACTIVE academic years', 'inactive academic year behavior follows business rule');

-- 4. Date before academic-year start rejected
PREPARE insert_before_start AS INSERT INTO public.timetable_substitutions (timetable_entry_id, branch_id, academic_year_id, substitution_date, substitute_staff_id)
VALUES (current_setting('test.te_id')::uuid, current_setting('test.branch_id')::uuid, current_setting('test.year_id')::uuid, '2025-12-29', current_setting('test.staff_id')::uuid);
SELECT throws_ok('insert_before_start', '23514', NULL, 'date before academic-year start rejected');

-- 5. Date after academic-year end rejected
PREPARE insert_after_end AS INSERT INTO public.timetable_substitutions (timetable_entry_id, branch_id, academic_year_id, substitution_date, substitute_staff_id)
VALUES (current_setting('test.te_id')::uuid, current_setting('test.branch_id')::uuid, current_setting('test.year_id')::uuid, '2027-01-04', current_setting('test.staff_id')::uuid);
SELECT throws_ok('insert_after_end', '23514', NULL, 'date after academic-year end rejected');

-- 6. Same branch + same academic year composite FK allowed (ACTIVE valid)
PREPARE insert_valid AS INSERT INTO public.timetable_substitutions (id, timetable_entry_id, branch_id, academic_year_id, substitution_date, substitute_staff_id)
VALUES ('00000000-0000-0000-0000-000000000001'::uuid, current_setting('test.te_id')::uuid, current_setting('test.branch_id')::uuid, current_setting('test.year_id')::uuid, '2026-01-05', current_setting('test.staff_id_2')::uuid);
SELECT lives_ok('insert_valid', 'same branch + same academic year composite FK allowed (ACTIVE substitution valid)');

-- 7. Existing active substitution conflict still rejected
PREPARE insert_conflict AS INSERT INTO public.timetable_substitutions (timetable_entry_id, branch_id, academic_year_id, substitution_date, substitute_staff_id)
VALUES (current_setting('test.te_id')::uuid, current_setting('test.branch_id')::uuid, current_setting('test.year_id')::uuid, '2026-01-05', current_setting('test.staff_id')::uuid);
SELECT throws_ok('insert_conflict', '23P01', NULL, 'existing active substitution conflict still rejected');

-- 8. Valid cancellation still works
PREPARE cancel_valid AS UPDATE public.timetable_substitutions SET status = 'CANCELLED' WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;
SELECT lives_ok('cancel_valid', 'valid cancellation still works');

-- 9. Unknown academic year rejected
PREPARE insert_unknown_year AS INSERT INTO public.timetable_substitutions (timetable_entry_id, branch_id, academic_year_id, substitution_date, substitute_staff_id)
VALUES (current_setting('test.te_id')::uuid, current_setting('test.branch_id')::uuid, '00000000-0000-0000-0000-000000000002'::uuid, '2026-01-05', current_setting('test.staff_id')::uuid);
SELECT throws_ok('insert_unknown_year', '23503', NULL, 'unknown academic year rejected');

-- 10. Nonexistent timetable entry rejected
PREPARE insert_unknown_te AS INSERT INTO public.timetable_substitutions (timetable_entry_id, branch_id, academic_year_id, substitution_date, substitute_staff_id)
VALUES ('00000000-0000-0000-0000-000000000003'::uuid, current_setting('test.branch_id')::uuid, current_setting('test.year_id')::uuid, '2026-01-05', current_setting('test.staff_id')::uuid);
SELECT throws_ok('insert_unknown_te', '23503', NULL, 'nonexistent timetable entry rejected');

SELECT * FROM finish();
ROLLBACK;
