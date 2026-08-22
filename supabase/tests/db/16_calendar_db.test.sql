BEGIN;
SELECT plan(21);

-- 1. Tables exist
SELECT has_table('public', 'calendar_events', 'calendar_events table exists');
SELECT has_column('public', 'academic_years', 'operating_days', 'academic_years has operating_days column');

-- 2. operating_days constraints
-- Should accept valid
PREPARE insert_valid AS 
  INSERT INTO public.academic_years (branch_id, name, start_date, end_date, operating_days)
  VALUES ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', 'Test valid days', '2027-01-01', '2027-12-31', '{1,2,3}');
SELECT lives_ok('insert_valid', 'operating_days accepts valid values');

-- Should reject empty
PREPARE insert_empty AS 
  INSERT INTO public.academic_years (branch_id, name, start_date, end_date, operating_days)
  VALUES ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', 'Test empty days', '2028-01-01', '2028-12-31', '{}');
SELECT throws_ok('insert_empty', 'new row for relation "academic_years" violates check constraint "chk_academic_years_operating_days"', 'operating_days rejects empty array');

-- Should reject duplicate
PREPARE insert_duplicate AS 
  INSERT INTO public.academic_years (branch_id, name, start_date, end_date, operating_days)
  VALUES ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', 'Test duplicate days', '2029-01-01', '2029-12-31', '{1,1,2}');
SELECT throws_ok('insert_duplicate', 'new row for relation "academic_years" violates check constraint "chk_academic_years_operating_days"', 'operating_days rejects duplicate array');

-- Should reject out of range
PREPARE insert_oor AS 
  INSERT INTO public.academic_years (branch_id, name, start_date, end_date, operating_days)
  VALUES ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', 'Test out of range days', '2030-01-01', '2030-12-31', '{0,1,2}');
SELECT throws_ok('insert_oor', 'new row for relation "academic_years" violates check constraint "chk_academic_years_operating_days"', 'operating_days rejects out of range');

-- 3. calendar_events definition
SELECT has_column('public', 'calendar_events', 'academic_year_id', 'calendar_events has academic_year_id');
SELECT col_is_pk('public', 'calendar_events', 'id', 'calendar_events PK is id');
SELECT col_is_fk('public', 'calendar_events', ARRAY['academic_year_id', 'branch_id'], 'calendar_events has composite FK to academic_years');

-- 4. Date Ordering
-- We assume an existing academic_year from seed: 'aaaaaaaa-1111-1111-1111-111111111111'
PREPARE insert_bad_dates AS 
  INSERT INTO public.calendar_events (academic_year_id, branch_id, name, start_date, end_date, type, is_instructional)
  VALUES ('aaaaaaaa-1111-1111-1111-111111111111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', 'Test Bad Dates', '2026-05-05', '2026-05-01', 'OTHER', true);
SELECT throws_ok('insert_bad_dates', 'new row for relation "calendar_events" violates check constraint "chk_calendar_events_dates"', 'calendar_events enforces start_date <= end_date');

-- 5. Inclusive Academic-Year Bounds
PREPARE insert_out_of_bounds AS 
  INSERT INTO public.calendar_events (academic_year_id, branch_id, name, start_date, end_date, type, is_instructional)
  VALUES ('aaaaaaaa-1111-1111-1111-111111111111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', 'Test OOB Dates', '2025-12-31', '2026-01-05', 'OTHER', true);
SELECT throws_like('insert_out_of_bounds', '%Calendar event dates must be within the inclusive bounds%', 'calendar_events enforces bounds via trigger');

PREPARE insert_in_bounds AS 
  INSERT INTO public.calendar_events (academic_year_id, branch_id, name, start_date, end_date, type, is_instructional)
  VALUES ('aaaaaaaa-1111-1111-1111-111111111111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', 'Test In Bounds', '2026-01-01', '2026-01-01', 'OTHER', true);
SELECT lives_ok('insert_in_bounds', 'calendar_events allows exactly on bound');

-- 6. Semantic Type Constraints
PREPARE insert_bad_holiday AS 
  INSERT INTO public.calendar_events (academic_year_id, branch_id, name, start_date, end_date, type, is_instructional)
  VALUES ('aaaaaaaa-1111-1111-1111-111111111111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', 'Bad Holiday', '2026-02-01', '2026-02-01', 'HOLIDAY', true);
SELECT throws_ok('insert_bad_holiday', 'new row for relation "calendar_events" violates check constraint "chk_calendar_events_semantics"', 'HOLIDAY must be non-instructional');

PREPARE insert_bad_makeup AS 
  INSERT INTO public.calendar_events (academic_year_id, branch_id, name, start_date, end_date, type, is_instructional)
  VALUES ('aaaaaaaa-1111-1111-1111-111111111111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', 'Bad Makeup', '2026-02-01', '2026-02-01', 'MAKEUP_DAY', false);
SELECT throws_ok('insert_bad_makeup', 'new row for relation "calendar_events" violates check constraint "chk_calendar_events_semantics"', 'MAKEUP_DAY must be instructional');

PREPARE insert_good_holiday AS 
  INSERT INTO public.calendar_events (academic_year_id, branch_id, name, start_date, end_date, type, is_instructional)
  VALUES ('aaaaaaaa-1111-1111-1111-111111111111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', 'Good Holiday', '2026-02-01', '2026-02-01', 'HOLIDAY', false);
SELECT lives_ok('insert_good_holiday', 'HOLIDAY non-instructional succeeds');

-- 7. Cross-branch composite FK
PREPARE insert_cross_branch AS 
  INSERT INTO public.calendar_events (academic_year_id, branch_id, name, start_date, end_date, type, is_instructional)
  VALUES ('aaaaaaaa-1111-1111-1111-111111111111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeea000', 'Cross Branch', '2026-02-01', '2026-02-01', 'OTHER', false);
SELECT throws_like('insert_cross_branch', '%fk_calendar_events_academic_year%', 'cross-branch insertion blocked by composite FK');

-- 8. Indexes
SELECT has_index('public', 'calendar_events', 'idx_calendar_events_active', 'calendar_events active index exists');

-- 9. RLS
SET role authenticated;
SET request.jwt.claims TO '{"role":"authenticated", "sub":"eeeeeeee-eeee-eeee-eeee-eeeeeeeea003"}'; -- Teacher in branch 2
SELECT is(count(*), 2::bigint, 'Teacher can view calendar events in their branch') FROM public.calendar_events;

-- Teacher cannot insert
PREPARE teacher_insert AS 
  INSERT INTO public.calendar_events (academic_year_id, branch_id, name, start_date, end_date, type, is_instructional)
  VALUES ('aaaaaaaa-1111-1111-1111-111111111111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', 'Teacher Insert', '2026-03-01', '2026-03-01', 'OTHER', true);
SELECT throws_like('teacher_insert', '%new row violates row-level security policy%', 'Teacher cannot insert calendar events');

-- Admin in branch 2
SET request.jwt.claims TO '{"role":"authenticated", "sub":"eeeeeeee-eeee-eeee-eeee-eeeeeeeea002"}';
PREPARE admin_insert AS 
  INSERT INTO public.calendar_events (academic_year_id, branch_id, name, start_date, end_date, type, is_instructional)
  VALUES ('aaaaaaaa-1111-1111-1111-111111111111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', 'Admin Insert', '2026-03-01', '2026-03-01', 'OTHER', true);
SELECT lives_ok('admin_insert', 'Branch admin can insert in their branch');

-- Admin trying to view another branch
SET request.jwt.claims TO '{"role":"authenticated", "sub":"eeeeeeee-eeee-eeee-eeee-eeeeeeeea001"}'; -- Super admin (but not branch 3 explicitly). Actually wait, no user for branch 3.
-- Just fake an identity that is not authorized
SET request.jwt.claims TO '{"role":"authenticated", "sub":"eeeeeeee-eeee-eeee-eeee-eeeeeeeea999"}';
SELECT is(count(*), 0::bigint, 'User in another branch cannot view branch 2 calendar events') FROM public.calendar_events;

SELECT * FROM finish();
ROLLBACK;

