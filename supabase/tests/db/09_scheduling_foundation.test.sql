BEGIN;
SELECT plan(18);

-- Seed basic data needed for scheduling
DO $$
DECLARE
    v_org_id UUID;
    v_branch_id UUID;
    v_branch_b_id UUID;
    v_year_id UUID;
    v_class_id UUID;
    v_section_id UUID;
    v_subject_id UUID;
    v_staff_id UUID;
    v_staff_id_2 UUID;
    v_room_id UUID;
    v_room_id_2 UUID;
    v_bell_id UUID;
    v_period_id UUID;
    v_period_id_2 UUID;
    v_timetable_entry_id UUID;
BEGIN
    v_org_id := gen_random_uuid();
    INSERT INTO public.organizations (id, name) VALUES (v_org_id, 'Test Org');

    v_branch_id := gen_random_uuid();
    INSERT INTO public.branches (id, organization_id, name) VALUES (v_branch_id, v_org_id, 'Test Branch');
    
    v_branch_b_id := gen_random_uuid();
    INSERT INTO public.branches (id, organization_id, name) VALUES (v_branch_b_id, v_org_id, 'Test Branch B');

    v_year_id := gen_random_uuid();
    INSERT INTO public.academic_years (id, branch_id, name, start_date, end_date) 
    VALUES (v_year_id, v_branch_id, '2026', '2026-01-01', '2026-12-31');

    v_class_id := gen_random_uuid();
    INSERT INTO public.classes (id, branch_id, academic_year_id, name, level) 
    VALUES (v_class_id, v_branch_id, v_year_id, 'Class 1', 1);

    v_section_id := gen_random_uuid();
    INSERT INTO public.sections (id, branch_id, class_id, academic_year_id, name) 
    VALUES (v_section_id, v_branch_id, v_class_id, v_year_id, 'Section A');

    v_subject_id := gen_random_uuid();
    INSERT INTO public.subjects (id, branch_id, name, code) 
    VALUES (v_subject_id, v_branch_id, 'Math', 'MTH');

    v_staff_id := gen_random_uuid();
    INSERT INTO public.staff (id, first_name, last_name, organization_id) VALUES (v_staff_id, 'Test', 'Teacher1', v_org_id);
    INSERT INTO public.staff_branch_profiles (id, staff_id, branch_id) VALUES (v_staff_id, v_staff_id, v_branch_id);
    
    v_staff_id_2 := gen_random_uuid();
    INSERT INTO public.staff (id, first_name, last_name, organization_id) VALUES (v_staff_id_2, 'Test', 'Teacher2', v_org_id);
    INSERT INTO public.staff_branch_profiles (id, staff_id, branch_id) VALUES (v_staff_id_2, v_staff_id_2, v_branch_id);

    v_room_id := gen_random_uuid();
    INSERT INTO public.rooms (id, branch_id, name) VALUES (v_room_id, v_branch_id, 'Room 101');
    
    v_room_id_2 := gen_random_uuid();
    INSERT INTO public.rooms (id, branch_id, name) VALUES (v_room_id_2, v_branch_id, 'Room 102');

    v_bell_id := gen_random_uuid();
    INSERT INTO public.bell_schedules (id, branch_id, name) VALUES (v_bell_id, v_branch_id, 'Standard');

    v_period_id := gen_random_uuid();
    INSERT INTO public.periods (id, bell_schedule_id, branch_id, name, start_time, end_time) 
    VALUES (v_period_id, v_bell_id, v_branch_id, 'P1', '08:00', '09:00');
    
    v_period_id_2 := gen_random_uuid();
    INSERT INTO public.periods (id, bell_schedule_id, branch_id, name, start_time, end_time) 
    VALUES (v_period_id_2, v_bell_id, v_branch_id, 'P2', '09:00', '10:00');

    -- Store for tests
    PERFORM set_config('test.org_id', v_org_id::text, true);
    PERFORM set_config('test.branch_id', v_branch_id::text, true);
    PERFORM set_config('test.branch_b_id', v_branch_b_id::text, true);
    PERFORM set_config('test.year_id', v_year_id::text, true);
    PERFORM set_config('test.class_id', v_class_id::text, true);
    PERFORM set_config('test.section_id', v_section_id::text, true);
    PERFORM set_config('test.subject_id', v_subject_id::text, true);
    PERFORM set_config('test.staff_id', v_staff_id::text, true);
    PERFORM set_config('test.staff_id_2', v_staff_id_2::text, true);
    PERFORM set_config('test.room_id', v_room_id::text, true);
    PERFORM set_config('test.room_id_2', v_room_id_2::text, true);
    PERFORM set_config('test.period_id', v_period_id::text, true);
    PERFORM set_config('test.period_id_2', v_period_id_2::text, true);
END $$;

-- 1. Valid timetable insertion
SELECT lives_ok(
    $$
    INSERT INTO public.timetable_entries (
        academic_year_id, branch_id, class_id, section_id, subject_id, 
        period_id, room_id, staff_branch_profile_id, day_of_week
    ) VALUES (
        current_setting('test.year_id')::uuid, current_setting('test.branch_id')::uuid, current_setting('test.class_id')::uuid, 
        current_setting('test.section_id')::uuid, current_setting('test.subject_id')::uuid, current_setting('test.period_id')::uuid, 
        current_setting('test.room_id')::uuid, current_setting('test.staff_id')::uuid, 1
    );
    $$,
    '1. Valid timetable insertion succeeds'
);

-- 2. Cross-branch reference rejected
SELECT throws_ok(
    $$
    INSERT INTO public.timetable_entries (
        academic_year_id, branch_id, class_id, section_id, subject_id, 
        period_id, room_id, staff_branch_profile_id, day_of_week
    ) VALUES (
        current_setting('test.year_id')::uuid, current_setting('test.branch_b_id')::uuid, current_setting('test.class_id')::uuid, 
        current_setting('test.section_id')::uuid, current_setting('test.subject_id')::uuid, current_setting('test.period_id')::uuid, 
        current_setting('test.room_id')::uuid, current_setting('test.staff_id')::uuid, 2
    );
    $$,
    '23503',
    NULL,
    '2. Cross-branch reference rejected by composite FK'
);

-- 3. Teacher double-booking rejected
SELECT throws_ok(
    $$
    INSERT INTO public.timetable_entries (
        academic_year_id, branch_id, class_id, section_id, subject_id, 
        period_id, room_id, staff_branch_profile_id, day_of_week
    ) VALUES (
        current_setting('test.year_id')::uuid, current_setting('test.branch_id')::uuid, current_setting('test.class_id')::uuid, 
        current_setting('test.section_id')::uuid, current_setting('test.subject_id')::uuid, current_setting('test.period_id')::uuid, 
        current_setting('test.room_id_2')::uuid, current_setting('test.staff_id')::uuid, 1
    );
    $$,
    '23P01',
    NULL,
    '3. Teacher double-booking rejected by EXCLUDE constraint'
);

-- 4. Room double-booking rejected
SELECT throws_ok(
    $$
    INSERT INTO public.timetable_entries (
        academic_year_id, branch_id, class_id, section_id, subject_id, 
        period_id, room_id, staff_branch_profile_id, day_of_week
    ) VALUES (
        current_setting('test.year_id')::uuid, current_setting('test.branch_id')::uuid, current_setting('test.class_id')::uuid, 
        current_setting('test.section_id')::uuid, current_setting('test.subject_id')::uuid, current_setting('test.period_id')::uuid, 
        current_setting('test.room_id')::uuid, current_setting('test.staff_id_2')::uuid, 1
    );
    $$,
    '23P01',
    NULL,
    '4. Room double-booking rejected by EXCLUDE constraint'
);

-- 5. Section double-booking rejected
SELECT throws_ok(
    $$
    INSERT INTO public.timetable_entries (
        academic_year_id, branch_id, class_id, section_id, subject_id, 
        period_id, room_id, staff_branch_profile_id, day_of_week
    ) VALUES (
        current_setting('test.year_id')::uuid, current_setting('test.branch_id')::uuid, current_setting('test.class_id')::uuid, 
        current_setting('test.section_id')::uuid, current_setting('test.subject_id')::uuid, current_setting('test.period_id')::uuid, 
        current_setting('test.room_id_2')::uuid, current_setting('test.staff_id_2')::uuid, 1
    );
    $$,
    '23P01',
    NULL,
    '5. Section double-booking rejected by EXCLUDE constraint'
);

-- 6. Non-overlapping time range accepted
SELECT lives_ok(
    $$
    INSERT INTO public.timetable_entries (
        academic_year_id, branch_id, class_id, section_id, subject_id, 
        period_id, room_id, staff_branch_profile_id, day_of_week
    ) VALUES (
        current_setting('test.year_id')::uuid, current_setting('test.branch_id')::uuid, current_setting('test.class_id')::uuid, 
        current_setting('test.section_id')::uuid, current_setting('test.subject_id')::uuid, current_setting('test.period_id_2')::uuid, 
        current_setting('test.room_id')::uuid, current_setting('test.staff_id')::uuid, 1
    );
    $$,
    '6. Non-overlapping time range (different period) accepted for same teacher/room'
);

-- Store a timetable_entry_id for substitution tests
DO $$
DECLARE
    v_id UUID;
BEGIN
    SELECT id INTO v_id FROM public.timetable_entries WHERE period_id = current_setting('test.period_id')::uuid LIMIT 1;
    PERFORM set_config('test.te_id', v_id::text, true);
    
    SELECT id INTO v_id FROM public.timetable_entries WHERE period_id = current_setting('test.period_id_2')::uuid LIMIT 1;
    PERFORM set_config('test.te_id_2', v_id::text, true);
END $$;

-- 7. Valid substitution insertion
SELECT lives_ok(
    $$
    INSERT INTO public.timetable_substitutions (
        timetable_entry_id, branch_id, academic_year_id, substitution_date, substitute_staff_id
    ) VALUES (
        current_setting('test.te_id')::uuid, current_setting('test.branch_id')::uuid, current_setting('test.year_id')::uuid,
        '2026-09-07', current_setting('test.staff_id_2')::uuid
    );
    $$,
    '7. Valid substitution insertion succeeds'
);

-- 8. Substitute teacher conflict against canonical entry
DO $$
DECLARE
    v_new_staff UUID := gen_random_uuid();
    v_new_room UUID := gen_random_uuid();
    v_new_sec UUID := gen_random_uuid();
    v_te_id UUID;
BEGIN
    INSERT INTO public.staff (id, first_name, last_name, organization_id) VALUES (v_new_staff, 'Test', 'Teacher_Mid', current_setting('test.org_id')::uuid);
    INSERT INTO public.staff_branch_profiles (id, staff_id, branch_id) VALUES (v_new_staff, v_new_staff, current_setting('test.branch_id')::uuid);
    INSERT INTO public.rooms (id, branch_id, name) VALUES (v_new_room, current_setting('test.branch_id')::uuid, 'Room 103');
    INSERT INTO public.sections (id, branch_id, class_id, academic_year_id, name) VALUES (v_new_sec, current_setting('test.branch_id')::uuid, current_setting('test.class_id')::uuid, current_setting('test.year_id')::uuid, 'Section C');
    
    INSERT INTO public.timetable_entries (
        academic_year_id, branch_id, class_id, section_id, subject_id, 
        period_id, room_id, staff_branch_profile_id, day_of_week
    ) VALUES (
        current_setting('test.year_id')::uuid, current_setting('test.branch_id')::uuid, current_setting('test.class_id')::uuid, 
        v_new_sec, current_setting('test.subject_id')::uuid, current_setting('test.period_id_2')::uuid, 
        v_new_room, v_new_staff, 1
    ) RETURNING id INTO v_te_id;
    
    PERFORM set_config('test.te_id_3', v_te_id::text, true);
END $$;

SELECT throws_ok(
    $$
    INSERT INTO public.timetable_substitutions (
        timetable_entry_id, branch_id, academic_year_id, substitution_date, substitute_staff_id
    ) VALUES (
        current_setting('test.te_id_3')::uuid, current_setting('test.branch_id')::uuid, current_setting('test.year_id')::uuid,
        '2026-09-07', current_setting('test.staff_id')::uuid -- staff_id is already busy with P2 canonical!
    );
    $$,
    'P0001',
    'Physical conflict: Substitute resource is double-booked on this date via a canonical timetable entry',
    '8. Substitute teacher conflict against canonical entry rejected'
);

-- 9. Valid substitution for staff 3
DO $$
DECLARE v_staff UUID := gen_random_uuid();
BEGIN
    INSERT INTO public.staff (id, first_name, last_name, organization_id) VALUES (v_staff, 'Test', 'Teacher3', current_setting('test.org_id')::uuid);
    INSERT INTO public.staff_branch_profiles (id, staff_id, branch_id) VALUES (v_staff, v_staff, current_setting('test.branch_id')::uuid);
    PERFORM set_config('test.staff_id_3', v_staff::text, true);
END $$;

SELECT lives_ok(
    $$
    INSERT INTO public.timetable_substitutions (
        timetable_entry_id, branch_id, academic_year_id, substitution_date, substitute_staff_id
    ) VALUES (
        current_setting('test.te_id_3')::uuid, current_setting('test.branch_id')::uuid, current_setting('test.year_id')::uuid,
        '2026-09-07', current_setting('test.staff_id_3')::uuid
    );
    $$,
    '9. Valid substitution insertion for staff 3'
);

-- 10. Substitute teacher conflict against another substitution
SELECT throws_ok(
    $$
    INSERT INTO public.timetable_substitutions (
        timetable_entry_id, branch_id, academic_year_id, substitution_date, substitute_staff_id
    ) VALUES (
        current_setting('test.te_id_2')::uuid, current_setting('test.branch_id')::uuid, current_setting('test.year_id')::uuid,
        '2026-09-07', current_setting('test.staff_id_3')::uuid
    );
    $$,
    'P0001',
    'Physical conflict: Substitute resource is double-booked on this date via another substitution',
    '10. Substitute teacher conflict against another substitution rejected'
);

-- RLS TESTS
-- Simulate being a Branch Admin for branch_id
CREATE OR REPLACE FUNCTION public.auth_user_has_branch_role(target_branch_id uuid, target_role_name text) RETURNS boolean AS $$ SELECT target_branch_id = current_setting('test.branch_id')::uuid; $$ LANGUAGE sql;
CREATE OR REPLACE FUNCTION public.auth_user_branches() RETURNS uuid[] AS $$ SELECT ARRAY[current_setting('test.branch_id')::uuid]; $$ LANGUAGE sql;
CREATE OR REPLACE FUNCTION public.auth_is_super_admin() RETURNS boolean AS $$ SELECT false; $$ LANGUAGE sql;

SET role authenticated;
SET request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

-- 11. Branch Admin can view own branch entries
SELECT results_eq(
    $$ SELECT count(*)::int FROM public.timetable_entries WHERE branch_id = current_setting('test.branch_id')::uuid $$,
    ARRAY[3],
    '11. Branch admin can view timetable entries in their branch'
);

-- 12. Branch Admin cannot view other branch entries
SELECT results_eq(
    $$ SELECT count(*)::int FROM public.timetable_entries WHERE branch_id = current_setting('test.branch_b_id')::uuid $$,
    ARRAY[0],
    '12. Branch admin cannot view timetable entries in other branch'
);

-- 13. Branch Admin cannot insert into other branch
SELECT throws_ok(
    $$
    INSERT INTO public.timetable_entries (
        academic_year_id, branch_id, class_id, section_id, subject_id, 
        period_id, room_id, staff_branch_profile_id, day_of_week
    ) VALUES (
        current_setting('test.year_id')::uuid, current_setting('test.branch_b_id')::uuid, current_setting('test.class_id')::uuid, 
        current_setting('test.section_id')::uuid, current_setting('test.subject_id')::uuid, current_setting('test.period_id')::uuid, 
        current_setting('test.room_id')::uuid, current_setting('test.staff_id')::uuid, 1
    );
    $$,
    '42501',
    NULL,
    '13. Branch admin cannot insert into another branch (RLS WITH CHECK)'
);

-- 14. Unauthorized role cannot insert (Simulate teacher)
RESET ROLE;
CREATE OR REPLACE FUNCTION public.auth_user_has_branch_role(target_branch_id uuid, target_role_name text) RETURNS boolean AS $$ SELECT false; $$ LANGUAGE sql;
SET role authenticated;
SELECT throws_ok(
    $$
    INSERT INTO public.timetable_entries (
        academic_year_id, branch_id, class_id, section_id, subject_id, 
        period_id, room_id, staff_branch_profile_id, day_of_week
    ) VALUES (
        current_setting('test.year_id')::uuid, current_setting('test.branch_id')::uuid, current_setting('test.class_id')::uuid, 
        current_setting('test.section_id')::uuid, current_setting('test.subject_id')::uuid, current_setting('test.period_id')::uuid, 
        current_setting('test.room_id')::uuid, current_setting('test.staff_id')::uuid, 2
    );
    $$,
    '42501',
    NULL,
    '14. Unauthorized role cannot insert (RLS WITH CHECK)'
);

-- 15. Historical queryability verification (Status check)
RESET ROLE;
SELECT set_config('request.jwt.claim.sub', '', true);
SELECT lives_ok(
    $$
    UPDATE public.timetable_entries SET status = 'ARCHIVED' WHERE id = current_setting('test.te_id_3')::uuid;
    $$,
    '15. Can archive a timetable entry'
);

SELECT results_eq(
    $$ SELECT count(*)::int FROM public.timetable_entries WHERE status = 'ARCHIVED' $$,
    ARRAY[1],
    '16. Archived records remain queryable'
);

-- 17. Substitution against archived canonical doesn't conflict
SELECT lives_ok(
    $$
    UPDATE public.timetable_entries SET status = 'ARCHIVED' WHERE id = current_setting('test.te_id')::uuid;
    INSERT INTO public.timetable_entries (
        academic_year_id, branch_id, class_id, section_id, subject_id, 
        period_id, room_id, staff_branch_profile_id, day_of_week
    ) VALUES (
        current_setting('test.year_id')::uuid, current_setting('test.branch_id')::uuid, current_setting('test.class_id')::uuid, 
        current_setting('test.section_id')::uuid, current_setting('test.subject_id')::uuid, current_setting('test.period_id')::uuid, 
        current_setting('test.room_id')::uuid, current_setting('test.staff_id')::uuid, 1
    );
    $$,
    '17. Creating entry that overlaps with ARCHIVED entry succeeds'
);

-- 18. Audit event generation
SELECT results_eq(
    $$ SELECT count(*)::int > 0 FROM audit_logs WHERE table_name = 'timetable_entries' $$,
    ARRAY[true],
    '18. Audit logs generated for timetable operations'
);


ROLLBACK;
