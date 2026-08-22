-- ==========================================
-- R2.2: Substitution Integrity Hardening
-- ==========================================

-- 1. Composite Timetable Ownership (Finding 3)
-- Verify uniqueness on timetable_entries to support composite FK
ALTER TABLE public.timetable_entries 
  ADD CONSTRAINT uq_timetable_entries_composite UNIQUE (id, branch_id, academic_year_id);

-- Replace the weak FK with a strong composite FK
ALTER TABLE public.timetable_substitutions 
  DROP CONSTRAINT fk_substitution_entry;

ALTER TABLE public.timetable_substitutions
  ADD CONSTRAINT fk_substitution_entry 
  FOREIGN KEY (timetable_entry_id, branch_id, academic_year_id) 
  REFERENCES public.timetable_entries(id, branch_id, academic_year_id) 
  ON DELETE RESTRICT;

-- 2. Academic-Year bounds must fail closed (Finding 2)
CREATE OR REPLACE FUNCTION public.check_substitution_date_bounds()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = '' -- hardening
AS $$
DECLARE
    v_ay_rec RECORD;
BEGIN
    SELECT start_date, end_date, status INTO v_ay_rec 
    FROM public.academic_years 
    WHERE id = NEW.academic_year_id;
    
    -- Fail closed if unknown or inaccessible
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Academic year % not found or inaccessible', NEW.academic_year_id USING ERRCODE = '23503';
    END IF;

    -- Fail closed if not active
    -- "if substitutions are only valid for ACTIVE years, reject"
    IF v_ay_rec.status != 'ACTIVE' THEN
        RAISE EXCEPTION 'Substitutions can only be created in ACTIVE academic years' USING ERRCODE = 'P0001';
    END IF;
    
    IF NEW.substitution_date < v_ay_rec.start_date OR NEW.substitution_date > v_ay_rec.end_date THEN
        RAISE EXCEPTION 'Substitution date % is outside the academic year bounds (% to %)', NEW.substitution_date, v_ay_rec.start_date, v_ay_rec.end_date USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
END;
$$;

-- 3. Hardening check_substitution_conflict (Finding 5)
CREATE OR REPLACE FUNCTION public.check_substitution_conflict()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = '' -- hardening
AS $$
DECLARE
    v_day_of_week INTEGER;
    v_time_range public.timerange;
    v_canonical_room_id UUID;
    v_conflict_id UUID;
    v_resources text[];
    v_res text;
    v_active_status text := 'ACTIVE';
BEGIN
    -- Only check if ACTIVE
    IF NEW.status != v_active_status THEN
        RETURN NEW;
    END IF;

    -- Extract bounds and canonical room from canonical entry
    SELECT day_of_week, time_range, room_id INTO v_day_of_week, v_time_range, v_canonical_room_id
    FROM public.timetable_entries
    WHERE id = NEW.timetable_entry_id;

    -- Gather resources to lock for concurrency safety
    v_resources := ARRAY[
        NEW.timetable_entry_id::text,
        NEW.substitute_staff_id::text,
        COALESCE(NEW.substitute_room_id, v_canonical_room_id)::text
    ];

    -- Sort resources to guarantee deterministic lock acquisition order and prevent deadlocks
    SELECT pg_catalog.array_agg(val) INTO v_resources
    FROM (SELECT pg_catalog.unnest(v_resources) AS val ORDER BY val) s;

    -- Acquire transaction-scoped advisory locks
    FOREACH v_res IN ARRAY v_resources
    LOOP
        PERFORM pg_catalog.pg_advisory_xact_lock(
            pg_catalog.hashtext('timetable_substitution'),
            pg_catalog.hashtext(v_res || '_' || NEW.substitution_date::text)
        );
    END LOOP;

    -- Ensure substitution date matches the day of the week
    IF EXTRACT(ISODOW FROM NEW.substitution_date) != v_day_of_week THEN
        RAISE EXCEPTION 'Substitution date % does not match timetable day of week %', NEW.substitution_date, v_day_of_week;
    END IF;

    -- 1. Check conflicts against OTHER substitutions on the SAME date
    SELECT ts.id INTO v_conflict_id
    FROM public.timetable_substitutions ts
    JOIN public.timetable_entries te ON te.id = ts.timetable_entry_id
    WHERE ts.substitution_date = NEW.substitution_date
      AND ts.status = v_active_status
      AND ts.id != NEW.id
      AND te.time_range && v_time_range
      AND (
          ts.substitute_staff_id = NEW.substitute_staff_id 
          OR COALESCE(ts.substitute_room_id, te.room_id) = COALESCE(NEW.substitute_room_id, v_canonical_room_id)
          OR ts.timetable_entry_id = NEW.timetable_entry_id
      );

    IF FOUND THEN
        RAISE EXCEPTION 'Physical conflict: Substitute resource is double-booked on this date via another substitution' USING ERRCODE = '23P01';
    END IF;

    -- 2. Check conflicts against CANONICAL entries on that day_of_week
    SELECT te.id INTO v_conflict_id
    FROM public.timetable_entries te
    WHERE te.academic_year_id = NEW.academic_year_id
      AND te.day_of_week = v_day_of_week
      AND te.status = v_active_status
      AND te.time_range && v_time_range
      AND te.id != NEW.timetable_entry_id -- Skip the one being substituted
      AND (
          te.staff_branch_profile_id = NEW.substitute_staff_id 
          OR te.room_id = COALESCE(NEW.substitute_room_id, v_canonical_room_id)
      )
      -- Exclude canonical entries that are themselves substituted on this date
      AND NOT EXISTS (
          SELECT 1 FROM public.timetable_substitutions ts2
          WHERE ts2.timetable_entry_id = te.id
            AND ts2.substitution_date = NEW.substitution_date
            AND ts2.status = v_active_status
      );

    IF FOUND THEN
        RAISE EXCEPTION 'Physical conflict: Substitute resource is double-booked on this date via a canonical timetable entry' USING ERRCODE = '23P01';
    END IF;

    RETURN NEW;
END;
$$;
