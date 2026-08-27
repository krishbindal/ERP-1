-- ==========================================
-- SCHOOLOS GROUP 2C: DATABASE HARDENING
-- ==========================================

-- 1. PERIOD IMMUTABILITY
-- ==========================================

CREATE OR REPLACE FUNCTION public.check_period_immutability()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.start_time != NEW.start_time OR OLD.end_time != NEW.end_time THEN
        IF EXISTS (
            SELECT 1 FROM public.timetable_entries 
            WHERE period_id = OLD.id 
        ) THEN
            RAISE EXCEPTION 'Cannot modify time bounds of a period that is referenced by a timetable entry';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_period_immutability
    BEFORE UPDATE ON public.periods
    FOR EACH ROW EXECUTE FUNCTION public.check_period_immutability();

-- 2. ACADEMIC YEAR BOUNDS VALIDATION
-- ==========================================

CREATE OR REPLACE FUNCTION public.check_substitution_date_bounds()
RETURNS TRIGGER AS $$
DECLARE
    v_start DATE;
    v_end DATE;
BEGIN
    SELECT start_date, end_date INTO v_start, v_end 
    FROM public.academic_years 
    WHERE id = NEW.academic_year_id;
    
    IF NEW.substitution_date < v_start OR NEW.substitution_date > v_end THEN
        RAISE EXCEPTION 'Substitution date % is outside the academic year bounds (% to %)', NEW.substitution_date, v_start, v_end;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_substitution_date_bounds
    BEFORE INSERT OR UPDATE ON public.timetable_substitutions
    FOR EACH ROW EXECUTE FUNCTION public.check_substitution_date_bounds();

-- 3. FIX SUBSTITUTION ROOM CONFLICT BUG
-- ==========================================

CREATE OR REPLACE FUNCTION public.check_substitution_conflict()
RETURNS TRIGGER AS $$
DECLARE
    v_day_of_week INTEGER;
    v_time_range public.timerange;
    v_canonical_room_id UUID;
    v_conflict_id UUID;
    v_resources text[];
    v_res text;
BEGIN
    -- Only check if ACTIVE
    IF NEW.status != 'ACTIVE' THEN
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
    SELECT array_agg(val) INTO v_resources
    FROM (SELECT unnest(v_resources) AS val ORDER BY val) s;

    -- Acquire transaction-scoped advisory locks
    FOREACH v_res IN ARRAY v_resources
    LOOP
        PERFORM pg_advisory_xact_lock(
            hashtext('timetable_substitution'),
            hashtext(v_res || '_' || NEW.substitution_date::text)
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
      AND ts.status = 'ACTIVE'
      AND ts.id != NEW.id
      AND te.time_range && v_time_range
      AND (
          ts.substitute_staff_id = NEW.substitute_staff_id 
          OR COALESCE(ts.substitute_room_id, te.room_id) = COALESCE(NEW.substitute_room_id, v_canonical_room_id)
          OR ts.timetable_entry_id = NEW.timetable_entry_id
      );

    IF FOUND THEN
        RAISE EXCEPTION 'Physical conflict: Substitute resource is double-booked on this date via another substitution';
    END IF;

    -- 2. Check conflicts against CANONICAL entries on that day_of_week
    SELECT te.id INTO v_conflict_id
    FROM public.timetable_entries te
    WHERE te.academic_year_id = NEW.academic_year_id
      AND te.day_of_week = v_day_of_week
      AND te.status = 'ACTIVE'
      AND te.time_range && v_time_range
      AND te.id != NEW.timetable_entry_id -- Skip the one being substituted
      AND (
          (
              te.staff_branch_profile_id = NEW.substitute_staff_id
              AND NOT EXISTS (
                  SELECT 1 FROM public.timetable_substitutions ts
                  WHERE ts.timetable_entry_id = te.id
                    AND ts.substitution_date = NEW.substitution_date
                    AND ts.status = 'ACTIVE'
              )
          )
          OR
          (
              te.room_id = COALESCE(NEW.substitute_room_id, v_canonical_room_id)
              AND NOT EXISTS (
                  SELECT 1 FROM public.timetable_substitutions ts
                  WHERE ts.timetable_entry_id = te.id
                    AND ts.substitution_date = NEW.substitution_date
                    AND ts.status = 'ACTIVE'
                    AND ts.substitute_room_id IS NOT NULL
              )
          )
      );

    IF FOUND THEN
        RAISE EXCEPTION 'Physical conflict: Substitute resource is double-booked on this date via a canonical timetable entry';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- 4. FIX POSTGREST JOINS FOR TIMETABLE_ENTRIES
-- ==========================================
ALTER TABLE public.timetable_entries
  ADD CONSTRAINT fk_timetable_class
  FOREIGN KEY (class_id, academic_year_id, branch_id)
  REFERENCES public.classes(id, academic_year_id, branch_id)
  ON DELETE RESTRICT;
