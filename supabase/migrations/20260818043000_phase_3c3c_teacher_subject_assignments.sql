-- Phase 3C.3C: Teacher Subject Assignments

-- ==========================================
-- 1. TABLE
-- ==========================================
CREATE TABLE public.teacher_subject_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL,
    academic_year_id UUID NOT NULL,
    class_id UUID NOT NULL,
    section_id UUID NOT NULL,
    subject_id UUID NOT NULL,
    staff_branch_profile_id UUID NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- 3. STRUCTURAL FK — SECTION
    CONSTRAINT fk_tsa_section FOREIGN KEY (section_id, class_id, academic_year_id, branch_id)
        REFERENCES public.sections(id, class_id, academic_year_id, branch_id) ON DELETE RESTRICT,

    -- 4. SUBJECT ELIGIBILITY
    CONSTRAINT fk_tsa_class_subject FOREIGN KEY (class_id, subject_id)
        REFERENCES public.class_subjects(class_id, subject_id) ON DELETE RESTRICT,

    -- 5. TEACHER BRANCH FK
    CONSTRAINT fk_tsa_teacher FOREIGN KEY (staff_branch_profile_id, branch_id)
        REFERENCES public.staff_branch_profiles(id, branch_id) ON DELETE RESTRICT,

    -- 6. SUBJECT BRANCH FK
    CONSTRAINT fk_tsa_subject FOREIGN KEY (subject_id, branch_id)
        REFERENCES public.subjects(id, branch_id) ON DELETE RESTRICT
);

-- ==========================================
-- 2. INDEXES
-- ==========================================
-- 9. PRIMARY TEACHER
CREATE UNIQUE INDEX idx_tsa_single_primary
ON public.teacher_subject_assignments(section_id, subject_id)
WHERE is_primary = true AND status = 'ACTIVE';

-- 10. DUPLICATE ACTIVE ASSIGNMENT
CREATE UNIQUE INDEX idx_tsa_active_teacher_assignment
ON public.teacher_subject_assignments(section_id, subject_id, staff_branch_profile_id)
WHERE status = 'ACTIVE';

-- Lookups
CREATE INDEX idx_tsa_branch ON public.teacher_subject_assignments(branch_id);
CREATE INDEX idx_tsa_teacher ON public.teacher_subject_assignments(staff_branch_profile_id);
CREATE INDEX idx_tsa_section ON public.teacher_subject_assignments(section_id);
CREATE INDEX idx_tsa_subject ON public.teacher_subject_assignments(subject_id);

-- ==========================================
-- 3. GRANTS
-- ==========================================
GRANT SELECT, INSERT, UPDATE ON public.teacher_subject_assignments TO authenticated;
-- No DELETE for authenticated

-- ==========================================
-- 4. TRIGGERS
-- ==========================================
-- 7. STATUS ELIGIBILITY
CREATE OR REPLACE FUNCTION public.check_teacher_subject_eligibility()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'ACTIVE' THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.staff_branch_profiles
            WHERE id = NEW.staff_branch_profile_id AND status = 'ACTIVE'
        ) THEN
            RAISE EXCEPTION 'Teacher branch profile must be ACTIVE to be assigned.';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM public.subjects
            WHERE id = NEW.subject_id AND status = 'ACTIVE'
        ) THEN
            RAISE EXCEPTION 'Subject must be ACTIVE to be assigned.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_tsa_eligibility
BEFORE INSERT OR UPDATE ON public.teacher_subject_assignments
FOR EACH ROW EXECUTE FUNCTION public.check_teacher_subject_eligibility();

-- 11. AUDIT
CREATE TRIGGER audit_teacher_subject_assignments
AFTER INSERT OR UPDATE OR DELETE ON public.teacher_subject_assignments
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- 12. UPDATED_AT
CREATE TRIGGER update_tsa_updated_at
BEFORE UPDATE ON public.teacher_subject_assignments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 13. BRANCH IMMUTABILITY
CREATE TRIGGER enforce_tsa_branch_immutable
BEFORE UPDATE ON public.teacher_subject_assignments
FOR EACH ROW EXECUTE FUNCTION public.prevent_branch_id_update();

-- ==========================================
-- 5. RLS
-- ==========================================
ALTER TABLE public.teacher_subject_assignments ENABLE ROW LEVEL SECURITY;

-- SUPER ADMIN
CREATE POLICY "Super Admins can select assignments"
ON public.teacher_subject_assignments FOR SELECT TO authenticated
USING (branch_id IN (SELECT id FROM public.branches WHERE organization_id = ANY(auth_user_organizations())) AND auth_is_super_admin());

CREATE POLICY "Super Admins can insert assignments"
ON public.teacher_subject_assignments FOR INSERT TO authenticated
WITH CHECK (branch_id IN (SELECT id FROM public.branches WHERE organization_id = ANY(auth_user_organizations())) AND auth_is_super_admin());

CREATE POLICY "Super Admins can update assignments"
ON public.teacher_subject_assignments FOR UPDATE TO authenticated
USING (branch_id IN (SELECT id FROM public.branches WHERE organization_id = ANY(auth_user_organizations())) AND auth_is_super_admin())
WITH CHECK (branch_id IN (SELECT id FROM public.branches WHERE organization_id = ANY(auth_user_organizations())) AND auth_is_super_admin());

-- BRANCH ADMIN
CREATE POLICY "Branch Admins can select assignments"
ON public.teacher_subject_assignments FOR SELECT TO authenticated
USING (
    branch_id = ANY(auth_user_branches())
    AND NOT EXISTS (SELECT 1 FROM public.staff WHERE profile_id = auth.uid())
);

CREATE POLICY "Branch Admins can insert assignments"
ON public.teacher_subject_assignments FOR INSERT TO authenticated
WITH CHECK (
    branch_id = ANY(auth_user_branches())
    AND NOT EXISTS (SELECT 1 FROM public.staff WHERE profile_id = auth.uid())
);

CREATE POLICY "Branch Admins can update assignments"
ON public.teacher_subject_assignments FOR UPDATE TO authenticated
USING (
    branch_id = ANY(auth_user_branches())
    AND NOT EXISTS (SELECT 1 FROM public.staff WHERE profile_id = auth.uid())
)
WITH CHECK (
    branch_id = ANY(auth_user_branches())
    AND NOT EXISTS (SELECT 1 FROM public.staff WHERE profile_id = auth.uid())
);

CREATE POLICY "Branch Admins can delete assignments"
ON public.teacher_subject_assignments FOR DELETE TO authenticated
USING (
    branch_id = ANY(auth_user_branches())
    AND NOT EXISTS (SELECT 1 FROM public.staff WHERE profile_id = auth.uid())
);

-- TEACHER

CREATE POLICY "Teachers can view own assignments"
ON public.teacher_subject_assignments FOR SELECT TO authenticated
USING (
    staff_branch_profile_id IN (
        SELECT sbp.id 
        FROM public.staff_branch_profiles sbp
        JOIN public.staff s ON sbp.staff_id = s.id
        WHERE s.profile_id = auth.uid()
    )
);
