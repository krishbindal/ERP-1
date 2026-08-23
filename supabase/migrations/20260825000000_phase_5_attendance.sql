-- Phase 5: Attendance Module

-- 1. ENUMS
CREATE TYPE public.attendance_status AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');
CREATE TYPE public.attendance_action AS ENUM ('CREATE', 'UPDATE', 'CORRECT', 'LOCK', 'PUBLISH');

-- 1.5 PERMISSIONS
INSERT INTO public.permissions (name, description) VALUES
  ('attendance.session.read', 'Read attendance sessions'),
  ('attendance.session.manage', 'Create/edit draft attendance sessions'),
  ('attendance.session.publish', 'Publish and lock attendance sessions'),
  ('attendance.session.correct', 'Correct locked/published attendance sessions')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to roles (Assume 'teacher', 'branchadmin', 'principal' roles exist from foundation)
DO $$
DECLARE
    v_teacher_role_id UUID;
    v_admin_role_id UUID;
    v_principal_role_id UUID;
BEGIN
    SELECT id INTO v_teacher_role_id FROM public.roles WHERE name = 'teacher';
    SELECT id INTO v_admin_role_id FROM public.roles WHERE name = 'branchadmin';
    SELECT id INTO v_principal_role_id FROM public.roles WHERE name = 'principal';

    -- Teacher gets read, manage
    IF v_teacher_role_id IS NOT NULL THEN
        INSERT INTO public.role_permissions (role_id, permission_id)
        SELECT v_teacher_role_id, id FROM public.permissions WHERE name IN ('attendance.session.read', 'attendance.session.manage')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Branch Admin gets all
    IF v_admin_role_id IS NOT NULL THEN
        INSERT INTO public.role_permissions (role_id, permission_id)
        SELECT v_admin_role_id, id FROM public.permissions WHERE name IN ('attendance.session.read', 'attendance.session.manage', 'attendance.session.publish', 'attendance.session.correct')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Principal gets all
    IF v_principal_role_id IS NOT NULL THEN
        INSERT INTO public.role_permissions (role_id, permission_id)
        SELECT v_principal_role_id, id FROM public.permissions WHERE name IN ('attendance.session.read', 'attendance.session.manage', 'attendance.session.publish', 'attendance.session.correct')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Helper function for permissions
CREATE OR REPLACE FUNCTION public.auth_user_has_branch_permission(target_branch_id uuid, target_permission text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.branch_memberships bm
        JOIN public.user_role_assignments ura ON ura.branch_membership_id = bm.id
        JOIN public.role_permissions rp ON rp.role_id = ura.role_id
        JOIN public.permissions p ON p.id = rp.permission_id
        WHERE bm.user_id = auth.uid()
          AND bm.branch_id = target_branch_id
          AND p.name = target_permission
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. TABLES

CREATE TABLE public.attendance_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE RESTRICT,
    section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE RESTRICT,
    date DATE NOT NULL,
    locked_at TIMESTAMPTZ,
    locked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ,
    published_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT uk_attendance_session_section_date UNIQUE (section_id, date)
);

CREATE TABLE public.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
    status public.attendance_status NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT uk_attendance_record_student_session UNIQUE (session_id, student_id)
);

CREATE TABLE public.attendance_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- FKs removed to prevent CASCADE deletion destroying audit history
    session_id UUID NOT NULL,
    record_id UUID,
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action public.attendance_action NOT NULL,
    reason TEXT,
    before_state JSONB,
    after_state JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. TRIGGERS

-- Auto-update updated_at
CREATE TRIGGER set_attendance_sessions_updated_at
    BEFORE UPDATE ON public.attendance_sessions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_attendance_records_updated_at
    BEFORE UPDATE ON public.attendance_records
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Prevent ownership tampering
CREATE TRIGGER prevent_attendance_session_branch_id_update
    BEFORE UPDATE ON public.attendance_sessions
    FOR EACH ROW EXECUTE FUNCTION public.prevent_branch_id_update();

-- 4. INDEXES
CREATE INDEX idx_attendance_sessions_branch_id ON public.attendance_sessions(branch_id);
CREATE INDEX idx_attendance_sessions_section_id ON public.attendance_sessions(section_id);
CREATE INDEX idx_attendance_sessions_date ON public.attendance_sessions(date);
CREATE INDEX idx_attendance_records_session_id ON public.attendance_records(session_id);
CREATE INDEX idx_attendance_records_student_id ON public.attendance_records(student_id);
CREATE INDEX idx_attendance_audit_logs_session_id ON public.attendance_audit_logs(session_id);

-- 5. RLS ENABLE
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_audit_logs ENABLE ROW LEVEL SECURITY;

-- 6. POLICIES: SESSIONS
-- Staff read
CREATE POLICY "Staff can view branch attendance_sessions"
    ON public.attendance_sessions FOR SELECT TO authenticated
    USING (public.auth_user_has_branch_permission(branch_id, 'attendance.session.read'));

-- Parent read
CREATE POLICY "Parents can view published child attendance_sessions"
    ON public.attendance_sessions FOR SELECT TO authenticated
    USING (published_at IS NOT NULL AND id IN (
        SELECT session_id FROM public.attendance_records WHERE student_id IN (
            SELECT student_id FROM public.student_guardians WHERE guardian_id IN (
                SELECT id FROM public.get_auth_linked_guardian_ids()
            )
        )
    ));

-- Student read
CREATE POLICY "Students can view published own attendance_sessions"
    ON public.attendance_sessions FOR SELECT TO authenticated
    USING (published_at IS NOT NULL AND id IN (
        SELECT session_id FROM public.attendance_records WHERE student_id IN (
            SELECT id FROM public.get_auth_linked_student_ids()
        )
    ));

-- Staff insert (Note: usually done via RPC now, but keeping for direct access if permitted)
CREATE POLICY "Staff can insert attendance_sessions"
    ON public.attendance_sessions FOR INSERT TO authenticated
    WITH CHECK (public.auth_user_has_branch_permission(branch_id, 'attendance.session.manage'));

-- Staff update
CREATE POLICY "Staff can update attendance_sessions"
    ON public.attendance_sessions FOR UPDATE TO authenticated
    USING (
        public.auth_user_has_branch_permission(branch_id, 'attendance.session.manage') AND
        (locked_at IS NULL OR public.auth_user_has_branch_permission(branch_id, 'attendance.session.publish') OR public.auth_user_has_branch_permission(branch_id, 'attendance.session.correct'))
    )
    WITH CHECK (
        public.auth_user_has_branch_permission(branch_id, 'attendance.session.manage') AND
        (locked_at IS NULL OR public.auth_user_has_branch_permission(branch_id, 'attendance.session.publish') OR public.auth_user_has_branch_permission(branch_id, 'attendance.session.correct'))
    );

-- Super Admin
CREATE POLICY "Super Admins manage attendance_sessions" 
    ON public.attendance_sessions TO authenticated 
    USING (branch_id IN (SELECT id FROM public.branches WHERE organization_id = ANY(public.auth_user_organizations())) AND public.auth_is_super_admin()) 
    WITH CHECK (branch_id IN (SELECT id FROM public.branches WHERE organization_id = ANY(public.auth_user_organizations())) AND public.auth_is_super_admin());


-- 7. POLICIES: RECORDS
-- Staff read
CREATE POLICY "Staff can view branch attendance_records"
    ON public.attendance_records FOR SELECT TO authenticated
    USING (session_id IN (
        SELECT id FROM public.attendance_sessions WHERE public.auth_user_has_branch_permission(branch_id, 'attendance.session.read')
    ));

-- Parent read
CREATE POLICY "Parents can view published child attendance_records"
    ON public.attendance_records FOR SELECT TO authenticated
    USING (
        student_id IN (
            SELECT student_id FROM public.student_guardians WHERE guardian_id IN (
                SELECT id FROM public.get_auth_linked_guardian_ids()
            )
        ) AND
        session_id IN (
            SELECT id FROM public.attendance_sessions WHERE published_at IS NOT NULL
        )
    );

-- Student read
CREATE POLICY "Students can view published own attendance_records"
    ON public.attendance_records FOR SELECT TO authenticated
    USING (
        student_id IN (SELECT id FROM public.get_auth_linked_student_ids()) AND
        session_id IN (SELECT id FROM public.attendance_sessions WHERE published_at IS NOT NULL)
    );

-- Staff insert
CREATE POLICY "Staff can insert attendance_records"
    ON public.attendance_records FOR INSERT TO authenticated
    WITH CHECK (session_id IN (
        SELECT id FROM public.attendance_sessions WHERE public.auth_user_has_branch_permission(branch_id, 'attendance.session.manage')
    ));

-- Staff update
CREATE POLICY "Staff can update attendance_records"
    ON public.attendance_records FOR UPDATE TO authenticated
    USING (session_id IN (
        SELECT id FROM public.attendance_sessions WHERE public.auth_user_has_branch_permission(branch_id, 'attendance.session.manage') AND (locked_at IS NULL OR public.auth_user_has_branch_permission(branch_id, 'attendance.session.correct'))
    ))
    WITH CHECK (session_id IN (
        SELECT id FROM public.attendance_sessions WHERE public.auth_user_has_branch_permission(branch_id, 'attendance.session.manage') AND (locked_at IS NULL OR public.auth_user_has_branch_permission(branch_id, 'attendance.session.correct'))
    ));

-- Super Admin
CREATE POLICY "Super Admins manage attendance_records" 
    ON public.attendance_records TO authenticated 
    USING (session_id IN (SELECT id FROM public.attendance_sessions WHERE branch_id IN (SELECT id FROM public.branches WHERE organization_id = ANY(public.auth_user_organizations()))) AND public.auth_is_super_admin()) 
    WITH CHECK (session_id IN (SELECT id FROM public.attendance_sessions WHERE branch_id IN (SELECT id FROM public.branches WHERE organization_id = ANY(public.auth_user_organizations()))) AND public.auth_is_super_admin());


-- 8. POLICIES: AUDIT LOGS
-- Staff read (Admins)
CREATE POLICY "Admins can view audit logs"
    ON public.attendance_audit_logs FOR SELECT TO authenticated
    USING (session_id IN (
        SELECT id FROM public.attendance_sessions WHERE public.auth_user_has_branch_permission(branch_id, 'attendance.session.correct')
    ));

-- (Removed insert policy for ordinary users. Only RPCs can insert)
-- Super Admin
CREATE POLICY "Super Admins manage attendance_audit_logs" 
    ON public.attendance_audit_logs TO authenticated 
    USING (session_id IN (SELECT id FROM public.attendance_sessions WHERE branch_id IN (SELECT id FROM public.branches WHERE organization_id = ANY(public.auth_user_organizations()))) AND public.auth_is_super_admin()) 
    WITH CHECK (session_id IN (SELECT id FROM public.attendance_sessions WHERE branch_id IN (SELECT id FROM public.branches WHERE organization_id = ANY(public.auth_user_organizations()))) AND public.auth_is_super_admin());

-- 9. RPC FOR EOD AUTO-LOCK
CREATE OR REPLACE FUNCTION public.rpc_auto_lock_attendance()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    locked_count INTEGER := 0;
BEGIN
    WITH to_lock AS (
        SELECT s.id 
        FROM public.attendance_sessions s
        JOIN public.branches b ON s.branch_id = b.id
        WHERE s.locked_at IS NULL
          AND public.timezone(b.timezone, now()) >= (s.date + interval '1 day')
        FOR UPDATE SKIP LOCKED
    )
    UPDATE public.attendance_sessions
    SET locked_at = now()
    WHERE id IN (SELECT id FROM to_lock);

    GET DIAGNOSTICS locked_count = ROW_COUNT;
    
    RETURN locked_count;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.rpc_auto_lock_attendance() FROM public;
REVOKE EXECUTE ON FUNCTION public.rpc_auto_lock_attendance() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_auto_lock_attendance() TO service_role;

-- 10. RPC FOR ATOMIC BULK SAVE (BLOCKER 1, 2)
CREATE OR REPLACE FUNCTION public.rpc_save_attendance(
    p_branch_id UUID,
    p_academic_year_id UUID,
    p_section_id UUID,
    p_date DATE,
    p_records JSONB -- Array of { student_id, status, notes }
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_session_id UUID;
    v_locked_at TIMESTAMPTZ;
    v_student_id UUID;
    v_status public.attendance_status;
    v_notes TEXT;
    v_record JSONB;
    v_unenrolled_count INTEGER;
BEGIN
    -- Permission Check
    IF NOT public.auth_user_has_branch_permission(p_branch_id, 'attendance.session.manage') THEN
        RAISE EXCEPTION 'Not authorized to manage attendance in this branch';
    END IF;

    -- Calendar and Academic Year bounds validation
    DECLARE
        v_operating_days INTEGER[];
        v_override_instructional BOOLEAN;
        v_is_instructional BOOLEAN;
        v_ay_start DATE;
        v_ay_end DATE;
    BEGIN
        SELECT operating_days, start_date, end_date INTO v_operating_days, v_ay_start, v_ay_end
        FROM public.academic_years
        WHERE id = p_academic_year_id AND branch_id = p_branch_id;

        IF v_operating_days IS NULL THEN
            RAISE EXCEPTION 'Academic year not found in branch';
        END IF;

        IF p_date < v_ay_start OR p_date > v_ay_end THEN
            RAISE EXCEPTION 'Date is outside academic year';
        END IF;

        SELECT is_instructional INTO v_override_instructional
        FROM public.calendar_events
        WHERE academic_year_id = p_academic_year_id
          AND p_date >= start_date AND p_date <= end_date
          AND status = 'ACTIVE'
        ORDER BY 
          is_instructional ASC,
          (end_date - start_date) ASC,
          id ASC
        LIMIT 1;

        IF v_override_instructional IS NOT NULL THEN
            v_is_instructional := v_override_instructional;
        ELSE
            v_is_instructional := EXTRACT(ISODOW FROM p_date) = ANY(v_operating_days);
        END IF;

        IF NOT v_is_instructional THEN
            RAISE EXCEPTION 'Cannot record attendance on a non-instructional day';
        END IF;
    END;


    -- Validate enrollment context for all students in the payload
    -- Block 2: student ownership/enrollment integrity
    SELECT COUNT(*)
    INTO v_unenrolled_count
    FROM jsonb_array_elements(p_records) AS r
    WHERE NOT EXISTS (
        SELECT 1 FROM public.enrollments e
        WHERE e.student_id = (r->>'student_id')::UUID
          AND e.section_id = p_section_id
          AND e.academic_year_id = p_academic_year_id
          AND e.branch_id = p_branch_id
          AND e.status = 'ACTIVE'
    );

    IF v_unenrolled_count > 0 THEN
        RAISE EXCEPTION 'One or more students are not enrolled in the specified section and branch';
    END IF;

    -- Fetch or create session
    SELECT id, locked_at INTO v_session_id, v_locked_at
    FROM public.attendance_sessions
    WHERE section_id = p_section_id AND date = p_date
    FOR UPDATE; -- lock session for concurrency

    IF v_locked_at IS NOT NULL THEN
        RAISE EXCEPTION 'Attendance is locked for this section and date';
    END IF;

    IF v_session_id IS NULL THEN
        INSERT INTO public.attendance_sessions (branch_id, academic_year_id, section_id, date)
        VALUES (p_branch_id, p_academic_year_id, p_section_id, p_date)
        RETURNING id INTO v_session_id;
    END IF;

    -- Upsert records
    FOR v_record IN SELECT * FROM jsonb_array_elements(p_records) LOOP
        v_student_id := (v_record->>'student_id')::UUID;
        v_status := (v_record->>'status')::public.attendance_status;
        v_notes := v_record->>'notes';

        INSERT INTO public.attendance_records (session_id, student_id, status, notes)
        VALUES (v_session_id, v_student_id, v_status, v_notes)
        ON CONFLICT (session_id, student_id) 
        DO UPDATE SET status = EXCLUDED.status, notes = EXCLUDED.notes, updated_at = now();
    END LOOP;

    RETURN v_session_id;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.rpc_save_attendance(UUID, UUID, UUID, DATE, JSONB) FROM public;
GRANT EXECUTE ON FUNCTION public.rpc_save_attendance(UUID, UUID, UUID, DATE, JSONB) TO authenticated;

-- 11. RPC FOR ATOMIC CORRECTION (BLOCKER 5, 6)
CREATE OR REPLACE FUNCTION public.rpc_correct_attendance(
    p_branch_id UUID,
    p_session_id UUID,
    p_student_id UUID,
    p_new_status public.attendance_status,
    p_reason TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_record_id UUID;
    v_old_status public.attendance_status;
    v_old_notes TEXT;
BEGIN
    IF NOT public.auth_user_has_branch_permission(p_branch_id, 'attendance.session.correct') THEN
        RAISE EXCEPTION 'Not authorized to correct attendance';
    END IF;

    IF p_reason IS NULL OR trim(p_reason) = '' THEN
        RAISE EXCEPTION 'Correction reason is mandatory';
    END IF;

    SELECT id, status, notes INTO v_record_id, v_old_status, v_old_notes
    FROM public.attendance_records
    WHERE session_id = p_session_id AND student_id = p_student_id
    FOR UPDATE;

    IF v_record_id IS NULL THEN
        RAISE EXCEPTION 'Record not found';
    END IF;

    -- Update record
    UPDATE public.attendance_records
    SET status = p_new_status, updated_at = now()
    WHERE id = v_record_id;

    -- Insert audit log atomically
    INSERT INTO public.attendance_audit_logs (
        session_id, record_id, actor_id, action, reason, before_state, after_state
    ) VALUES (
        p_session_id, v_record_id, auth.uid(), 'CORRECT', p_reason, 
        jsonb_build_object('status', v_old_status, 'notes', v_old_notes),
        jsonb_build_object('status', p_new_status, 'notes', v_old_notes)
    );

    RETURN TRUE;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.rpc_correct_attendance(UUID, UUID, UUID, public.attendance_status, TEXT) FROM public;
GRANT EXECUTE ON FUNCTION public.rpc_correct_attendance(UUID, UUID, UUID, public.attendance_status, TEXT) TO authenticated;
