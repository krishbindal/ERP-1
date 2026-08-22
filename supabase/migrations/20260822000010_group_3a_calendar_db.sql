-- ==============================================================================
-- PHASE 3A: DATABASE CALENDAR FOUNDATION
-- ==============================================================================

-- ==========================================
-- 1. OPERATING DAYS (ACADEMIC YEARS)
-- ==========================================

-- Add the column with a default safely
ALTER TABLE public.academic_years ADD COLUMN operating_days INTEGER[] NOT NULL DEFAULT '{1,2,3,4,5}';

-- Create an immutable function to check operating_days validity (1-7, unique, non-empty)
CREATE OR REPLACE FUNCTION public.check_operating_days(arr int[])
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT COALESCE(array_length(arr, 1), 0) > 0 
    AND arr <@ ARRAY[1,2,3,4,5,6,7] 
    AND (SELECT count(DISTINCT v) FROM unnest(arr) AS v) = array_length(arr, 1);
$$;

ALTER TABLE public.academic_years 
ADD CONSTRAINT chk_academic_years_operating_days 
CHECK (public.check_operating_days(operating_days));


-- ==========================================
-- 2. CALENDAR EVENTS TABLE
-- ==========================================

CREATE TABLE public.calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    type TEXT NOT NULL,
    is_instructional BOOLEAN NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Composite FK guarantees branch_id matches the academic_year.branch_id
    CONSTRAINT fk_calendar_events_academic_year 
        FOREIGN KEY (academic_year_id, branch_id) 
        REFERENCES public.academic_years(id, branch_id) 
        ON DELETE CASCADE,
        
    CONSTRAINT chk_calendar_events_dates 
        CHECK (start_date <= end_date),
        
    CONSTRAINT chk_calendar_events_status 
        CHECK (status IN ('ACTIVE', 'ARCHIVED')),
        
    CONSTRAINT chk_calendar_events_type 
        CHECK (type IN ('HOLIDAY', 'CLOSURE', 'MAKEUP_DAY', 'OTHER')),
        
    CONSTRAINT chk_calendar_events_semantics
        CHECK (
            (type = 'HOLIDAY' AND is_instructional = false) OR
            (type = 'CLOSURE' AND is_instructional = false) OR
            (type = 'MAKEUP_DAY' AND is_instructional = true) OR
            (type = 'OTHER')
        )
);


-- ==========================================
-- 3. ACADEMIC YEAR BOUNDS (INCLUSIVE) TRIGGER
-- ==========================================

CREATE OR REPLACE FUNCTION public.check_calendar_event_bounds()
RETURNS TRIGGER AS $$
DECLARE
    v_start DATE;
    v_end DATE;
BEGIN
    SELECT start_date, end_date INTO v_start, v_end 
    FROM public.academic_years 
    WHERE id = NEW.academic_year_id AND branch_id = NEW.branch_id;
    
    IF NEW.start_date < v_start OR NEW.end_date > v_end THEN
        RAISE EXCEPTION 'Calendar event dates must be within the inclusive bounds of the academic year';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_calendar_event_bounds
    BEFORE INSERT OR UPDATE ON public.calendar_events
    FOR EACH ROW EXECUTE FUNCTION public.check_calendar_event_bounds();


-- ==========================================
-- 4. IMMUTABILITY RULES
-- ==========================================

CREATE TRIGGER prevent_calendar_events_branch_id_update
    BEFORE UPDATE ON public.calendar_events
    FOR EACH ROW EXECUTE FUNCTION public.prevent_branch_id_update();


-- ==========================================
-- 5. UPDATED_AT & AUDIT
-- ==========================================

CREATE TRIGGER set_calendar_events_updated_at
    BEFORE UPDATE ON public.calendar_events
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER audit_calendar_events 
    AFTER INSERT OR UPDATE OR DELETE ON public.calendar_events 
    FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();


-- ==========================================
-- 6. INDEXES
-- ==========================================

CREATE INDEX idx_calendar_events_active 
    ON public.calendar_events(academic_year_id, branch_id, start_date, end_date) 
    WHERE status = 'ACTIVE';


-- ==========================================
-- 7. RLS
-- ==========================================

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Calendar events are viewable by branch members" 
    ON public.calendar_events FOR SELECT TO authenticated 
    USING (branch_id = ANY(public.auth_user_branches()));

CREATE POLICY "Branch Admins can insert calendar_events" 
    ON public.calendar_events FOR INSERT TO authenticated 
    WITH CHECK (public.auth_user_has_branch_role(branch_id, 'branchadmin'));

CREATE POLICY "Branch Admins can update calendar_events" 
    ON public.calendar_events FOR UPDATE TO authenticated 
    USING (public.auth_user_has_branch_role(branch_id, 'branchadmin')) 
    WITH CHECK (public.auth_user_has_branch_role(branch_id, 'branchadmin'));

CREATE POLICY "Branch Admins can delete calendar_events" 
    ON public.calendar_events FOR DELETE TO authenticated 
    USING (public.auth_user_has_branch_role(branch_id, 'branchadmin'));

CREATE POLICY "Super Admins manage calendar_events" 
    ON public.calendar_events TO authenticated 
    USING (branch_id IN (SELECT id FROM public.branches WHERE organization_id = ANY(auth_user_organizations())) AND auth_is_super_admin()) 
    WITH CHECK (branch_id IN (SELECT id FROM public.branches WHERE organization_id = ANY(auth_user_organizations())) AND auth_is_super_admin());


-- ==========================================
-- 8. GRANTS
-- ==========================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_events TO authenticated;

