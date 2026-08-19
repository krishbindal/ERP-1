-- Phase 3C.4: Security Remediation & Timezone Architecture

-- ==========================================
-- 1. TIMEZONE ARCHITECTURE
-- ==========================================

-- Architectural Justification for DEFAULT 'UTC':
-- The system is currently pre-production with no active UI. Existing seed data 
-- requires a non-null timezone. 'UTC' is a safe default for development. 
-- Before a production launch, any genuine branches must be backfilled with 
-- their actual IANA timezone (e.g., 'Asia/Kolkata', 'America/New_York').
ALTER TABLE public.branches 
    ADD COLUMN timezone TEXT NOT NULL DEFAULT 'UTC';

CREATE OR REPLACE FUNCTION public.validate_branch_timezone()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_timezone_names WHERE name = NEW.timezone) THEN
        RAISE EXCEPTION 'Invalid timezone: %', NEW.timezone;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER check_branch_timezone
    BEFORE INSERT OR UPDATE ON public.branches
    FOR EACH ROW EXECUTE FUNCTION public.validate_branch_timezone();

-- ==========================================
-- 2. SECURE AUTHORIZATION HELPERS
-- ==========================================

CREATE OR REPLACE FUNCTION public.auth_is_branch_admin(p_branch_id uuid)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM branch_memberships bm
        JOIN user_role_assignments ura ON bm.id = ura.branch_membership_id
        JOIN roles r ON ura.role_id = r.id
        WHERE bm.user_id = auth.uid()
          AND bm.branch_id = p_branch_id
          AND bm.status = 'ACTIVE'
          AND r.name = 'Branch Admin'
          AND r.organization_id = (SELECT organization_id FROM branches WHERE id = p_branch_id)
    );
$$;

REVOKE EXECUTE ON FUNCTION public.auth_is_branch_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_is_branch_admin(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.auth_is_super_admin_for_org(p_organization_id uuid)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM organization_memberships om
        WHERE om.user_id = auth.uid()
          AND om.organization_id = p_organization_id
          AND om.status = 'ACTIVE'
    ) AND public.auth_is_super_admin();
$$;

REVOKE EXECUTE ON FUNCTION public.auth_is_super_admin_for_org(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_is_super_admin_for_org(uuid) TO authenticated;

-- Helper to safely get the org for a branch
CREATE OR REPLACE FUNCTION public.get_branch_org(p_branch_id uuid)
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT organization_id FROM branches WHERE id = p_branch_id;
$$;

REVOKE EXECUTE ON FUNCTION public.get_branch_org(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_branch_org(uuid) TO authenticated;


-- ==========================================
-- 3. REMEDIATE PHASE 3B: ACADEMIC STRUCTURE
-- ==========================================

-- Drop all old policies
DROP POLICY IF EXISTS "Super Admins can manage academic_years in their orgs" ON public.academic_years;
DROP POLICY IF EXISTS "Branch Admins can insert academic_years" ON public.academic_years;
DROP POLICY IF EXISTS "Branch Admins can update academic_years" ON public.academic_years;
DROP POLICY IF EXISTS "Branch Admins can delete academic_years" ON public.academic_years;

DROP POLICY IF EXISTS "Super Admins can manage classes in their orgs" ON public.classes;
DROP POLICY IF EXISTS "Branch Admins can insert classes" ON public.classes;
DROP POLICY IF EXISTS "Branch Admins can update classes" ON public.classes;
DROP POLICY IF EXISTS "Branch Admins can delete classes" ON public.classes;

DROP POLICY IF EXISTS "Super Admins can manage sections in their orgs" ON public.sections;
DROP POLICY IF EXISTS "Branch Admins can insert sections" ON public.sections;
DROP POLICY IF EXISTS "Branch Admins can update sections" ON public.sections;
DROP POLICY IF EXISTS "Branch Admins can delete sections" ON public.sections;

DROP POLICY IF EXISTS "Super Admins can manage subjects in their orgs" ON public.subjects;
DROP POLICY IF EXISTS "Branch Admins can insert subjects" ON public.subjects;
DROP POLICY IF EXISTS "Branch Admins can update subjects" ON public.subjects;
DROP POLICY IF EXISTS "Branch Admins can delete subjects" ON public.subjects;

DROP POLICY IF EXISTS "Super Admins can manage class_subjects in their orgs" ON public.class_subjects;
DROP POLICY IF EXISTS "Branch Admins can insert class_subjects" ON public.class_subjects;
DROP POLICY IF EXISTS "Branch Admins can update class_subjects" ON public.class_subjects;
DROP POLICY IF EXISTS "Branch Admins can delete class_subjects" ON public.class_subjects;

-- Recreate with strict role checks

-- academic_years
CREATE POLICY "Super Admins can manage academic_years" ON public.academic_years TO authenticated
    USING (public.auth_is_super_admin_for_org(public.get_branch_org(branch_id)))
    WITH CHECK (public.auth_is_super_admin_for_org(public.get_branch_org(branch_id)));

CREATE POLICY "Branch Admins can insert academic_years" ON public.academic_years FOR INSERT TO authenticated
    WITH CHECK (public.auth_is_branch_admin(branch_id));

CREATE POLICY "Branch Admins can update academic_years" ON public.academic_years FOR UPDATE TO authenticated
    USING (public.auth_is_branch_admin(branch_id))
    WITH CHECK (public.auth_is_branch_admin(branch_id));

CREATE POLICY "Branch Admins can delete academic_years" ON public.academic_years FOR DELETE TO authenticated
    USING (public.auth_is_branch_admin(branch_id));

-- classes
CREATE POLICY "Super Admins can manage classes" ON public.classes TO authenticated
    USING (public.auth_is_super_admin_for_org(public.get_branch_org(branch_id)))
    WITH CHECK (public.auth_is_super_admin_for_org(public.get_branch_org(branch_id)));

CREATE POLICY "Branch Admins can insert classes" ON public.classes FOR INSERT TO authenticated
    WITH CHECK (public.auth_is_branch_admin(branch_id));

CREATE POLICY "Branch Admins can update classes" ON public.classes FOR UPDATE TO authenticated
    USING (public.auth_is_branch_admin(branch_id))
    WITH CHECK (public.auth_is_branch_admin(branch_id));

CREATE POLICY "Branch Admins can delete classes" ON public.classes FOR DELETE TO authenticated
    USING (public.auth_is_branch_admin(branch_id));

-- sections
CREATE POLICY "Super Admins can manage sections" ON public.sections TO authenticated
    USING (public.auth_is_super_admin_for_org(public.get_branch_org(branch_id)))
    WITH CHECK (public.auth_is_super_admin_for_org(public.get_branch_org(branch_id)));

CREATE POLICY "Branch Admins can insert sections" ON public.sections FOR INSERT TO authenticated
    WITH CHECK (public.auth_is_branch_admin(branch_id));

CREATE POLICY "Branch Admins can update sections" ON public.sections FOR UPDATE TO authenticated
    USING (public.auth_is_branch_admin(branch_id))
    WITH CHECK (public.auth_is_branch_admin(branch_id));

CREATE POLICY "Branch Admins can delete sections" ON public.sections FOR DELETE TO authenticated
    USING (public.auth_is_branch_admin(branch_id));

-- subjects
CREATE POLICY "Super Admins can manage subjects" ON public.subjects TO authenticated
    USING (public.auth_is_super_admin_for_org(public.get_branch_org(branch_id)))
    WITH CHECK (public.auth_is_super_admin_for_org(public.get_branch_org(branch_id)));

CREATE POLICY "Branch Admins can insert subjects" ON public.subjects FOR INSERT TO authenticated
    WITH CHECK (public.auth_is_branch_admin(branch_id));

CREATE POLICY "Branch Admins can update subjects" ON public.subjects FOR UPDATE TO authenticated
    USING (public.auth_is_branch_admin(branch_id))
    WITH CHECK (public.auth_is_branch_admin(branch_id));

CREATE POLICY "Branch Admins can delete subjects" ON public.subjects FOR DELETE TO authenticated
    USING (public.auth_is_branch_admin(branch_id));

-- class_subjects
CREATE POLICY "Super Admins can manage class_subjects" ON public.class_subjects TO authenticated
    USING (public.auth_is_super_admin_for_org(public.get_branch_org(branch_id)))
    WITH CHECK (public.auth_is_super_admin_for_org(public.get_branch_org(branch_id)));

CREATE POLICY "Branch Admins can insert class_subjects" ON public.class_subjects FOR INSERT TO authenticated
    WITH CHECK (public.auth_is_branch_admin(branch_id));

CREATE POLICY "Branch Admins can update class_subjects" ON public.class_subjects FOR UPDATE TO authenticated
    USING (public.auth_is_branch_admin(branch_id))
    WITH CHECK (public.auth_is_branch_admin(branch_id));

CREATE POLICY "Branch Admins can delete class_subjects" ON public.class_subjects FOR DELETE TO authenticated
    USING (public.auth_is_branch_admin(branch_id));


-- ==========================================
-- 4. REMEDIATE PHASE 3C.3C: TEACHER ASSIGNMENTS
-- ==========================================

DROP POLICY IF EXISTS "Super Admins can manage assignments in their orgs" ON public.teacher_subject_assignments;
DROP POLICY IF EXISTS "Branch Admins can insert assignments" ON public.teacher_subject_assignments;
DROP POLICY IF EXISTS "Branch Admins can update assignments" ON public.teacher_subject_assignments;
DROP POLICY IF EXISTS "Branch Admins can delete assignments" ON public.teacher_subject_assignments;

CREATE POLICY "Super Admins can manage assignments" ON public.teacher_subject_assignments TO authenticated
    USING (public.auth_is_super_admin_for_org(public.get_branch_org(branch_id)))
    WITH CHECK (public.auth_is_super_admin_for_org(public.get_branch_org(branch_id)));

CREATE POLICY "Branch Admins can insert assignments" ON public.teacher_subject_assignments FOR INSERT TO authenticated
    WITH CHECK (public.auth_is_branch_admin(branch_id));

CREATE POLICY "Branch Admins can update assignments" ON public.teacher_subject_assignments FOR UPDATE TO authenticated
    USING (public.auth_is_branch_admin(branch_id))
    WITH CHECK (public.auth_is_branch_admin(branch_id));

CREATE POLICY "Branch Admins can delete assignments" ON public.teacher_subject_assignments FOR DELETE TO authenticated
    USING (public.auth_is_branch_admin(branch_id));


-- ==========================================
-- 5. REMEDIATE PHASE 3A: STUDENTS & ENROLLMENTS
-- ==========================================

-- enrollments
DROP POLICY IF EXISTS "Super Admins can manage enrollments in their orgs" ON public.enrollments;
DROP POLICY IF EXISTS "Branch Admins can insert enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Branch Admins can update enrollments" ON public.enrollments;

CREATE POLICY "Super Admins can manage enrollments" ON public.enrollments TO authenticated
    USING (public.auth_is_super_admin_for_org(organization_id))
    WITH CHECK (public.auth_is_super_admin_for_org(organization_id));

CREATE POLICY "Branch Admins can insert enrollments" ON public.enrollments FOR INSERT TO authenticated
    WITH CHECK (public.auth_is_branch_admin(branch_id) AND organization_id = public.get_branch_org(branch_id));

CREATE POLICY "Branch Admins can update enrollments" ON public.enrollments FOR UPDATE TO authenticated
    USING (public.auth_is_branch_admin(branch_id))
    WITH CHECK (public.auth_is_branch_admin(branch_id) AND organization_id = public.get_branch_org(branch_id));

-- students
DROP POLICY IF EXISTS "Super Admins can manage students in their orgs" ON public.students;
DROP POLICY IF EXISTS "Branch Admins can insert students in their org" ON public.students;
DROP POLICY IF EXISTS "Branch Admins can update students placed in their branches" ON public.students;

CREATE POLICY "Super Admins can manage students" ON public.students TO authenticated
    USING (public.auth_is_super_admin_for_org(organization_id))
    WITH CHECK (public.auth_is_super_admin_for_org(organization_id));

CREATE POLICY "Branch Admins can insert students" ON public.students FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM branches b 
            WHERE b.organization_id = students.organization_id 
            AND public.auth_is_branch_admin(b.id)
        )
    );

CREATE POLICY "Branch Admins can update students" ON public.students FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.enrollments 
            WHERE enrollments.student_id = students.id 
            AND public.auth_is_branch_admin(enrollments.branch_id)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.enrollments 
            WHERE enrollments.student_id = students.id 
            AND public.auth_is_branch_admin(enrollments.branch_id)
        )
    );

-- guardians
DROP POLICY IF EXISTS "Super Admins can manage guardians in their orgs" ON public.guardians;
DROP POLICY IF EXISTS "Branch Admins can insert guardians in their org" ON public.guardians;
DROP POLICY IF EXISTS "Branch Admins can update visible guardians" ON public.guardians;

CREATE POLICY "Super Admins can manage guardians" ON public.guardians TO authenticated
    USING (public.auth_is_super_admin_for_org(organization_id))
    WITH CHECK (public.auth_is_super_admin_for_org(organization_id));

CREATE POLICY "Branch Admins can insert guardians" ON public.guardians FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM branches b 
            WHERE b.organization_id = guardians.organization_id 
            AND public.auth_is_branch_admin(b.id)
        )
    );

CREATE POLICY "Branch Admins can update guardians" ON public.guardians FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.student_guardians sg
            JOIN public.enrollments e ON sg.student_id = e.student_id
            WHERE sg.guardian_id = guardians.id 
            AND public.auth_is_branch_admin(e.branch_id)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.student_guardians sg
            JOIN public.enrollments e ON sg.student_id = e.student_id
            WHERE sg.guardian_id = guardians.id 
            AND public.auth_is_branch_admin(e.branch_id)
        )
    );

-- student_guardians
DROP POLICY IF EXISTS "Super Admins can manage student_guardians in their orgs" ON public.student_guardians;
DROP POLICY IF EXISTS "Branch Admins can insert student_guardians for visible students" ON public.student_guardians;
DROP POLICY IF EXISTS "Branch Admins can update student_guardians for visible students" ON public.student_guardians;

CREATE POLICY "Super Admins can manage student_guardians" ON public.student_guardians TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_id AND public.auth_is_super_admin_for_org(s.organization_id))
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_id AND public.auth_is_super_admin_for_org(s.organization_id))
    );

CREATE POLICY "Branch Admins can insert student_guardians" ON public.student_guardians FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.enrollments e 
            WHERE e.student_id = student_guardians.student_id 
            AND public.auth_is_branch_admin(e.branch_id)
        )
        AND public.is_guardian_in_student_org(student_guardians.student_id, student_guardians.guardian_id)
    );

CREATE POLICY "Branch Admins can update student_guardians" ON public.student_guardians FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.enrollments e 
            WHERE e.student_id = student_guardians.student_id 
            AND public.auth_is_branch_admin(e.branch_id)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.enrollments e 
            WHERE e.student_id = student_guardians.student_id 
            AND public.auth_is_branch_admin(e.branch_id)
        )
        AND public.is_guardian_in_student_org(student_guardians.student_id, student_guardians.guardian_id)
    );
