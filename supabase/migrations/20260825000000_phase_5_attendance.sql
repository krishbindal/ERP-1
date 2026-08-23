-- ==============================================================================
-- PHASE 5: ATTENDANCE
-- ==============================================================================

-- 1. ENUMS
CREATE TYPE public.attendance_status AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');
CREATE TYPE public.attendance_action AS ENUM ('CREATE', 'UPDATE', 'LOCK', 'PUBLISH', 'CORRECT');

-- 2. TABLES
CREATE TABLE public.attendance_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    locked_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uk_attendance_session_section_date UNIQUE (section_id, date)
);

CREATE TABLE public.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    status public.attendance_status NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uk_attendance_record_student_session UNIQUE (session_id, student_id)
);

CREATE TABLE public.attendance_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
    record_id UUID REFERENCES public.attendance_records(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action public.attendance_action NOT NULL,
    reason TEXT,
    before_state JSONB,
    after_state JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. TRIGGERS
CREATE TRIGGER update_attendance_sessions_updated_at
    BEFORE UPDATE ON public.attendance_sessions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_attendance_records_updated_at
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
    USING (branch_id = ANY(public.auth_user_branches()));

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

-- Staff insert
CREATE POLICY "Staff can insert attendance_sessions"
    ON public.attendance_sessions FOR INSERT TO authenticated
    WITH CHECK (branch_id = ANY(public.auth_user_branches()));

-- Staff update
CREATE POLICY "Staff can update attendance_sessions"
    ON public.attendance_sessions FOR UPDATE TO authenticated
    USING (
        branch_id = ANY(public.auth_user_branches()) AND
        (locked_at IS NULL OR public.auth_is_branch_admin(branch_id) OR public.auth_user_has_branch_role(branch_id, 'principal') OR public.auth_user_has_branch_role(branch_id, 'PRINCIPAL'))
    )
    WITH CHECK (
        branch_id = ANY(public.auth_user_branches()) AND
        (locked_at IS NULL OR public.auth_is_branch_admin(branch_id) OR public.auth_user_has_branch_role(branch_id, 'principal') OR public.auth_user_has_branch_role(branch_id, 'PRINCIPAL'))
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
        SELECT id FROM public.attendance_sessions WHERE branch_id = ANY(public.auth_user_branches())
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
        SELECT id FROM public.attendance_sessions WHERE branch_id = ANY(public.auth_user_branches())
    ));

-- Staff update
CREATE POLICY "Staff can update attendance_records"
    ON public.attendance_records FOR UPDATE TO authenticated
    USING (session_id IN (
        SELECT id FROM public.attendance_sessions WHERE branch_id = ANY(public.auth_user_branches()) AND (locked_at IS NULL OR public.auth_is_branch_admin(branch_id) OR public.auth_user_has_branch_role(branch_id, 'principal') OR public.auth_user_has_branch_role(branch_id, 'PRINCIPAL'))
    ))
    WITH CHECK (session_id IN (
        SELECT id FROM public.attendance_sessions WHERE branch_id = ANY(public.auth_user_branches()) AND (locked_at IS NULL OR public.auth_is_branch_admin(branch_id) OR public.auth_user_has_branch_role(branch_id, 'principal') OR public.auth_user_has_branch_role(branch_id, 'PRINCIPAL'))
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
        SELECT id FROM public.attendance_sessions WHERE public.auth_is_branch_admin(branch_id) OR public.auth_user_has_branch_role(branch_id, 'principal') OR public.auth_user_has_branch_role(branch_id, 'PRINCIPAL')
    ));

-- Staff insert
CREATE POLICY "Staff can insert audit logs"
    ON public.attendance_audit_logs FOR INSERT TO authenticated
    WITH CHECK (session_id IN (
        SELECT id FROM public.attendance_sessions WHERE branch_id = ANY(public.auth_user_branches())
    ));

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
SET search_path = ''
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
