-- ==========================================
-- SCHOOLOS GROUP 2A: SCHEDULING FOUNDATION
-- ==========================================

-- 1. EXTENSIONS & TYPES
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE TYPE public.timerange AS RANGE (subtype = time);

-- ==========================================
-- 2. BASE ENTITIES
-- ==========================================

-- Rooms
CREATE TABLE public.rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL,
    name TEXT NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 30,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT fk_rooms_branch FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE RESTRICT,
    CONSTRAINT uq_rooms_name_branch UNIQUE (branch_id, name),
    CONSTRAINT rooms_id_branch_id_key UNIQUE (id, branch_id)
);

-- Bell Schedules
CREATE TABLE public.bell_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT fk_bell_schedules_branch FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE RESTRICT,
    CONSTRAINT uq_bell_schedules_name_branch UNIQUE (branch_id, name),
    CONSTRAINT bell_schedules_id_branch_id_key UNIQUE (id, branch_id)
);

-- Periods
CREATE TABLE public.periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bell_schedule_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    name TEXT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT fk_periods_bell_schedule FOREIGN KEY (bell_schedule_id, branch_id) REFERENCES public.bell_schedules(id, branch_id) ON DELETE RESTRICT,
    CONSTRAINT fk_periods_branch FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE RESTRICT,
    CONSTRAINT chk_period_time_order CHECK (start_time < end_time),
    CONSTRAINT uq_periods_name_schedule UNIQUE (bell_schedule_id, name),
    CONSTRAINT periods_id_branch_id_key UNIQUE (id, branch_id)
);

-- ==========================================
-- 3. CORE SCHEDULING (WEEKLY TIMETABLE)
-- ==========================================

CREATE TABLE public.timetable_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    class_id UUID NOT NULL,
    section_id UUID NOT NULL,
    subject_id UUID NOT NULL,
    period_id UUID NOT NULL,
    room_id UUID NOT NULL,
    staff_branch_profile_id UUID NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1=Monday
    time_range public.timerange NOT NULL, -- Materialized
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Composite isolation
    CONSTRAINT fk_timetable_branch FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE RESTRICT,
    CONSTRAINT fk_timetable_section FOREIGN KEY (section_id, class_id, academic_year_id, branch_id) REFERENCES public.sections(id, class_id, academic_year_id, branch_id) ON DELETE RESTRICT,
    CONSTRAINT fk_timetable_subject FOREIGN KEY (subject_id, branch_id) REFERENCES public.subjects(id, branch_id) ON DELETE RESTRICT,
    CONSTRAINT fk_timetable_period FOREIGN KEY (period_id, branch_id) REFERENCES public.periods(id, branch_id) ON DELETE RESTRICT,
    CONSTRAINT fk_timetable_room FOREIGN KEY (room_id, branch_id) REFERENCES public.rooms(id, branch_id) ON DELETE RESTRICT,
    CONSTRAINT fk_timetable_teacher FOREIGN KEY (staff_branch_profile_id, branch_id) REFERENCES public.staff_branch_profiles(id, branch_id) ON DELETE RESTRICT,
    
    -- Absolute Physical Conflicts (ACTIVE only using partial indexes)
    -- Actually, partial exclude constraints are valid in Postgres!
    CONSTRAINT ex_timetable_room EXCLUDE USING gist (
        room_id WITH =,
        academic_year_id WITH =,
        day_of_week WITH =,
        time_range WITH &&
    ) WHERE (status = 'ACTIVE'),

    CONSTRAINT ex_timetable_teacher EXCLUDE USING gist (
        staff_branch_profile_id WITH =,
        academic_year_id WITH =,
        day_of_week WITH =,
        time_range WITH &&
    ) WHERE (status = 'ACTIVE'),

    CONSTRAINT ex_timetable_section EXCLUDE USING gist (
        section_id WITH =,
        academic_year_id WITH =,
        day_of_week WITH =,
        time_range WITH &&
    ) WHERE (status = 'ACTIVE')
);

-- ==========================================
-- 4. SUBSTITUTIONS
-- ==========================================

CREATE TABLE public.timetable_substitutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timetable_entry_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    academic_year_id UUID NOT NULL,
    substitution_date DATE NOT NULL,
    substitute_staff_id UUID NOT NULL,
    substitute_room_id UUID, -- Optional room change
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CANCELLED', 'ARCHIVED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT fk_substitution_entry FOREIGN KEY (timetable_entry_id) REFERENCES public.timetable_entries(id) ON DELETE RESTRICT,
    CONSTRAINT fk_substitution_teacher FOREIGN KEY (substitute_staff_id, branch_id) REFERENCES public.staff_branch_profiles(id, branch_id) ON DELETE RESTRICT,
    CONSTRAINT fk_substitution_room FOREIGN KEY (substitute_room_id, branch_id) REFERENCES public.rooms(id, branch_id) ON DELETE RESTRICT
);

-- ==========================================
-- 5. MATERIALIZATION TRIGGER
-- ==========================================

CREATE OR REPLACE FUNCTION public.materialize_timetable_time_range()
RETURNS TRIGGER AS $$
DECLARE
    v_start TIME;
    v_end TIME;
BEGIN
    SELECT start_time, end_time INTO v_start, v_end 
    FROM public.periods 
    WHERE id = NEW.period_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid period_id';
    END IF;
    
    NEW.time_range := timerange(v_start, v_end, '()');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_materialize_time_range
    BEFORE INSERT OR UPDATE OF period_id ON public.timetable_entries
    FOR EACH ROW EXECUTE FUNCTION public.materialize_timetable_time_range();

-- ==========================================
-- 6. SUBSTITUTION CONFLICT TRIGGER
-- ==========================================

CREATE OR REPLACE FUNCTION public.check_substitution_conflict()
RETURNS TRIGGER AS $$
DECLARE
    v_day_of_week INTEGER;
    v_time_range public.timerange;
    v_conflict_id UUID;
    v_resources text[];
    v_res text;
BEGIN
    -- Only check if ACTIVE
    IF NEW.status != 'ACTIVE' THEN
        RETURN NEW;
    END IF;

    -- Gather resources to lock for concurrency safety
    -- We lock the substitute staff, substitute room (if any), and the canonical entry
    -- being substituted, specific to this date.
    v_resources := ARRAY[
        NEW.timetable_entry_id::text,
        NEW.substitute_staff_id::text
    ];
    IF NEW.substitute_room_id IS NOT NULL THEN
        v_resources := array_append(v_resources, NEW.substitute_room_id::text);
    END IF;

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

    -- Extract bounds from canonical entry to avoid needing it in substitution table
    SELECT day_of_week, time_range INTO v_day_of_week, v_time_range
    FROM public.timetable_entries
    WHERE id = NEW.timetable_entry_id;

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
          OR (NEW.substitute_room_id IS NOT NULL AND ts.substitute_room_id = NEW.substitute_room_id)
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
          te.staff_branch_profile_id = NEW.substitute_staff_id
          OR (NEW.substitute_room_id IS NOT NULL AND te.room_id = NEW.substitute_room_id)
      )
      -- Ensure they aren't being substituted OUT of this conflicting entry
      AND NOT EXISTS (
          SELECT 1 FROM public.timetable_substitutions ts
          WHERE ts.timetable_entry_id = te.id
            AND ts.substitution_date = NEW.substitution_date
            AND ts.status = 'ACTIVE'
      );

    IF FOUND THEN
        RAISE EXCEPTION 'Physical conflict: Substitute resource is double-booked on this date via a canonical timetable entry';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_substitution_conflict
    BEFORE INSERT OR UPDATE ON public.timetable_substitutions
    FOR EACH ROW EXECUTE FUNCTION public.check_substitution_conflict();

-- ==========================================
-- 7. AUDIT TRIGGERS
-- ==========================================

CREATE TRIGGER audit_rooms AFTER INSERT OR UPDATE OR DELETE ON public.rooms FOR EACH ROW EXECUTE FUNCTION log_audit_event();
CREATE TRIGGER audit_bell_schedules AFTER INSERT OR UPDATE OR DELETE ON public.bell_schedules FOR EACH ROW EXECUTE FUNCTION log_audit_event();
CREATE TRIGGER audit_periods AFTER INSERT OR UPDATE OR DELETE ON public.periods FOR EACH ROW EXECUTE FUNCTION log_audit_event();
CREATE TRIGGER audit_timetable_entries AFTER INSERT OR UPDATE OR DELETE ON public.timetable_entries FOR EACH ROW EXECUTE FUNCTION log_audit_event();
CREATE TRIGGER audit_timetable_substitutions AFTER INSERT OR UPDATE OR DELETE ON public.timetable_substitutions FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- ==========================================
-- 8. RLS
-- ==========================================

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bell_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_substitutions ENABLE ROW LEVEL SECURITY;

-- Rooms
CREATE POLICY "Rooms are viewable by branch members" ON public.rooms FOR SELECT TO authenticated USING (branch_id = ANY(public.auth_user_branches()));
CREATE POLICY "Branch Admins can insert rooms" ON public.rooms FOR INSERT TO authenticated WITH CHECK (public.auth_user_has_branch_role(branch_id, 'branchadmin'));
CREATE POLICY "Branch Admins can update rooms" ON public.rooms FOR UPDATE TO authenticated USING (public.auth_user_has_branch_role(branch_id, 'branchadmin')) WITH CHECK (public.auth_user_has_branch_role(branch_id, 'branchadmin'));
CREATE POLICY "Branch Admins can delete rooms" ON public.rooms FOR DELETE TO authenticated USING (public.auth_user_has_branch_role(branch_id, 'branchadmin'));
CREATE POLICY "Super Admins manage rooms" ON public.rooms TO authenticated USING (branch_id IN (SELECT id FROM public.branches WHERE organization_id = ANY(auth_user_organizations())) AND auth_is_super_admin()) WITH CHECK (branch_id IN (SELECT id FROM public.branches WHERE organization_id = ANY(auth_user_organizations())) AND auth_is_super_admin());

-- Bell Schedules
CREATE POLICY "Schedules are viewable by branch members" ON public.bell_schedules FOR SELECT TO authenticated USING (branch_id = ANY(public.auth_user_branches()));
CREATE POLICY "Branch Admins can insert bell_schedules" ON public.bell_schedules FOR INSERT TO authenticated WITH CHECK (public.auth_user_has_branch_role(branch_id, 'branchadmin'));
CREATE POLICY "Branch Admins can update bell_schedules" ON public.bell_schedules FOR UPDATE TO authenticated USING (public.auth_user_has_branch_role(branch_id, 'branchadmin')) WITH CHECK (public.auth_user_has_branch_role(branch_id, 'branchadmin'));
CREATE POLICY "Branch Admins can delete bell_schedules" ON public.bell_schedules FOR DELETE TO authenticated USING (public.auth_user_has_branch_role(branch_id, 'branchadmin'));
CREATE POLICY "Super Admins manage bell_schedules" ON public.bell_schedules TO authenticated USING (branch_id IN (SELECT id FROM public.branches WHERE organization_id = ANY(auth_user_organizations())) AND auth_is_super_admin()) WITH CHECK (branch_id IN (SELECT id FROM public.branches WHERE organization_id = ANY(auth_user_organizations())) AND auth_is_super_admin());

-- Periods
CREATE POLICY "Periods are viewable by branch members" ON public.periods FOR SELECT TO authenticated USING (branch_id = ANY(public.auth_user_branches()));
CREATE POLICY "Branch Admins can insert periods" ON public.periods FOR INSERT TO authenticated WITH CHECK (public.auth_user_has_branch_role(branch_id, 'branchadmin'));
CREATE POLICY "Branch Admins can update periods" ON public.periods FOR UPDATE TO authenticated USING (public.auth_user_has_branch_role(branch_id, 'branchadmin')) WITH CHECK (public.auth_user_has_branch_role(branch_id, 'branchadmin'));
CREATE POLICY "Branch Admins can delete periods" ON public.periods FOR DELETE TO authenticated USING (public.auth_user_has_branch_role(branch_id, 'branchadmin'));
CREATE POLICY "Super Admins manage periods" ON public.periods TO authenticated USING (branch_id IN (SELECT id FROM public.branches WHERE organization_id = ANY(auth_user_organizations())) AND auth_is_super_admin()) WITH CHECK (branch_id IN (SELECT id FROM public.branches WHERE organization_id = ANY(auth_user_organizations())) AND auth_is_super_admin());

-- Timetable Entries
CREATE POLICY "Timetable Entries are viewable by branch members" ON public.timetable_entries FOR SELECT TO authenticated USING (branch_id = ANY(public.auth_user_branches()));
CREATE POLICY "Branch Admins can insert timetable_entries" ON public.timetable_entries FOR INSERT TO authenticated WITH CHECK (public.auth_user_has_branch_role(branch_id, 'branchadmin'));
CREATE POLICY "Branch Admins can update timetable_entries" ON public.timetable_entries FOR UPDATE TO authenticated USING (public.auth_user_has_branch_role(branch_id, 'branchadmin')) WITH CHECK (public.auth_user_has_branch_role(branch_id, 'branchadmin'));
CREATE POLICY "Branch Admins can delete timetable_entries" ON public.timetable_entries FOR DELETE TO authenticated USING (public.auth_user_has_branch_role(branch_id, 'branchadmin'));
CREATE POLICY "Super Admins manage timetable_entries" ON public.timetable_entries TO authenticated USING (branch_id IN (SELECT id FROM public.branches WHERE organization_id = ANY(auth_user_organizations())) AND auth_is_super_admin()) WITH CHECK (branch_id IN (SELECT id FROM public.branches WHERE organization_id = ANY(auth_user_organizations())) AND auth_is_super_admin());

-- Timetable Substitutions
CREATE POLICY "Substitutions are viewable by branch members" ON public.timetable_substitutions FOR SELECT TO authenticated USING (branch_id = ANY(public.auth_user_branches()));
CREATE POLICY "Branch Admins can insert timetable_substitutions" ON public.timetable_substitutions FOR INSERT TO authenticated WITH CHECK (public.auth_user_has_branch_role(branch_id, 'branchadmin'));
CREATE POLICY "Branch Admins can update timetable_substitutions" ON public.timetable_substitutions FOR UPDATE TO authenticated USING (public.auth_user_has_branch_role(branch_id, 'branchadmin')) WITH CHECK (public.auth_user_has_branch_role(branch_id, 'branchadmin'));
CREATE POLICY "Branch Admins can delete timetable_substitutions" ON public.timetable_substitutions FOR DELETE TO authenticated USING (public.auth_user_has_branch_role(branch_id, 'branchadmin'));
CREATE POLICY "Super Admins manage timetable_substitutions" ON public.timetable_substitutions TO authenticated USING (branch_id IN (SELECT id FROM public.branches WHERE organization_id = ANY(auth_user_organizations())) AND auth_is_super_admin()) WITH CHECK (branch_id IN (SELECT id FROM public.branches WHERE organization_id = ANY(auth_user_organizations())) AND auth_is_super_admin());

-- ==========================================
-- 9. INDEXES
-- ==========================================

CREATE INDEX idx_timetable_branch_year ON public.timetable_entries(branch_id, academic_year_id);
CREATE INDEX idx_timetable_teacher ON public.timetable_entries(staff_branch_profile_id, academic_year_id);
CREATE INDEX idx_timetable_section ON public.timetable_entries(section_id, academic_year_id);
CREATE INDEX idx_timetable_room ON public.timetable_entries(room_id, academic_year_id);
CREATE INDEX idx_substitutions_date ON public.timetable_substitutions(substitution_date, branch_id);


-- ==========================================
-- 10. GRANTS
-- ==========================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.rooms TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bell_schedules TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.periods TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.timetable_entries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.timetable_substitutions TO authenticated;

