-- Phase 3C.3D: Student Transfer Lifecycle

-- 1. Admission Number
ALTER TABLE public.student_branch_profiles ADD COLUMN admission_number TEXT;
CREATE UNIQUE INDEX idx_student_branch_profiles_admission_number ON public.student_branch_profiles(branch_id, admission_number) WHERE admission_number IS NOT NULL;

-- 2. Global Active-Profile Invariant
CREATE UNIQUE INDEX idx_global_active_profile ON public.student_branch_profiles (student_id) WHERE status = 'ACTIVE';

-- 3. Global Active-Enrollment Invariant (Replaces previous profile-scoped index)
DROP INDEX IF EXISTS public.idx_unique_active_enrollment;
CREATE UNIQUE INDEX idx_global_active_enrollment_per_year ON public.enrollments (student_id, academic_year_id) WHERE status = 'ACTIVE';

-- 4. Organization Integrity Constraints
-- Add unique constraints to allow composite FKs
ALTER TABLE public.branches ADD CONSTRAINT uq_branches_id_org UNIQUE (id, organization_id);
ALTER TABLE public.students ADD CONSTRAINT uq_students_id_org UNIQUE (id, organization_id);

-- Enforce enrollment organization integrity with composite FKs
ALTER TABLE public.enrollments 
    ADD CONSTRAINT fk_enrollments_branch_org FOREIGN KEY (branch_id, organization_id) REFERENCES public.branches(id, organization_id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_enrollments_student_org FOREIGN KEY (student_id, organization_id) REFERENCES public.students(id, organization_id) ON DELETE RESTRICT;

-- 5. Student Transfer RPC
CREATE OR REPLACE FUNCTION public.rpc_transfer_student(
    p_student_id UUID,
    p_source_branch_id UUID,
    p_destination_section_id UUID,
    p_effective_date DATE,
    p_destination_admission_number TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_dest_class_id UUID;
    v_dest_year_id UUID;
    v_dest_branch_id UUID;
    v_dest_org_id UUID;
    v_source_org_id UUID;
    v_source_enrollment RECORD;
    v_source_profile RECORD;
    v_dest_profile public.student_branch_profiles%ROWTYPE;
    v_new_enrollment_id UUID;
    v_update_count INT;
BEGIN
    -- 1. Derive destination structure exclusively from section
    SELECT s.class_id, s.academic_year_id, s.branch_id, b.organization_id 
    INTO v_dest_class_id, v_dest_year_id, v_dest_branch_id, v_dest_org_id 
    FROM public.sections s
    JOIN public.branches b ON b.id = s.branch_id
    WHERE s.id = p_destination_section_id;

    IF v_dest_branch_id IS NULL THEN
        RAISE EXCEPTION 'Destination section not found';
    END IF;

    -- 2. Verify source branch
    SELECT organization_id INTO v_source_org_id FROM public.branches WHERE id = p_source_branch_id;
    
    IF v_source_org_id IS NULL THEN
        RAISE EXCEPTION 'Source branch not found';
    END IF;

    -- 3. Invariants
    IF v_source_org_id != v_dest_org_id THEN 
        RAISE EXCEPTION 'Source and destination branches must belong to the same organization'; 
    END IF;
    
    IF p_source_branch_id = v_dest_branch_id THEN 
        RAISE EXCEPTION 'Destination branch must be different from source branch'; 
    END IF;

    -- 4. Authorization: Super Admin OR Branch Admin in BOTH branches
    IF NOT (
        (auth_is_super_admin() AND EXISTS (SELECT 1 FROM public.organization_memberships WHERE user_id = auth.uid() AND organization_id = v_source_org_id)) OR
        (
            EXISTS (
                SELECT 1 FROM public.branch_memberships bm
                JOIN public.user_role_assignments ura ON ura.branch_membership_id = bm.id
                JOIN public.roles r ON r.id = ura.role_id
                WHERE bm.user_id = auth.uid() AND bm.branch_id = p_source_branch_id AND r.name = 'Branch Admin'
            ) AND
            EXISTS (
                SELECT 1 FROM public.branch_memberships bm
                JOIN public.user_role_assignments ura ON ura.branch_membership_id = bm.id
                JOIN public.roles r ON r.id = ura.role_id
                WHERE bm.user_id = auth.uid() AND bm.branch_id = v_dest_branch_id AND r.name = 'Branch Admin'
            )
        )
    ) THEN
        RAISE EXCEPTION 'Not authorized: Must be Super Admin or Branch Admin for both branches';
    END IF;

    -- 5. Lock and Verify Active State
    PERFORM 1 FROM public.students WHERE id = p_student_id AND status = 'ACTIVE' FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Student is not active or does not exist';
    END IF;

    SELECT * INTO v_source_profile FROM public.student_branch_profiles
    WHERE student_id = p_student_id AND branch_id = p_source_branch_id AND status = 'ACTIVE'
    FOR UPDATE;

    IF v_source_profile IS NULL THEN
        RAISE EXCEPTION 'No active profile found in source branch';
    END IF;

    SELECT * INTO v_source_enrollment FROM public.enrollments 
    WHERE student_id = p_student_id AND branch_id = p_source_branch_id AND status = 'ACTIVE'
    FOR UPDATE;

    IF v_source_enrollment IS NULL THEN
        RAISE EXCEPTION 'No active enrollment found in source branch';
    END IF;

    -- 6. Date invariant
    IF p_effective_date <= v_source_enrollment.effective_from THEN
        RAISE EXCEPTION 'Effective date must be strictly after the source enrollment effective_from date';
    END IF;

    -- 7. Apply Source Transfers
    -- Enforce request reason for audit log
    PERFORM set_config('request.reason', 'Student transfer', true);

    UPDATE public.enrollments 
    SET status = 'TRANSFERRED', 
        effective_to = p_effective_date - 1 
    WHERE id = v_source_enrollment.id;

    UPDATE public.student_branch_profiles
    SET status = 'TRANSFERRED',
        updated_at = NOW()
    WHERE id = v_source_profile.id;

    -- 8. Destination Profile Handling (Reuse if exists)
    SELECT * INTO v_dest_profile FROM public.student_branch_profiles
    WHERE student_id = p_student_id AND branch_id = v_dest_branch_id
    FOR UPDATE;

    IF v_dest_profile.id IS NOT NULL THEN
        IF v_dest_profile.status = 'ACTIVE' THEN
            RAISE EXCEPTION 'Student already has an active profile in the destination branch';
        END IF;
        
        UPDATE public.student_branch_profiles 
        SET status = 'ACTIVE', 
            admission_number = COALESCE(p_destination_admission_number, admission_number) 
        WHERE id = v_dest_profile.id;
    ELSE
        INSERT INTO public.student_branch_profiles (student_id, branch_id, admission_number, status)
        VALUES (p_student_id, v_dest_branch_id, p_destination_admission_number, 'ACTIVE')
        RETURNING * INTO v_dest_profile;
    END IF;

    INSERT INTO public.enrollments (
        organization_id, 
        branch_id, 
        student_id, 
        student_branch_profile_id, 
        academic_year_id, 
        class_id, 
        section_id, 
        status, 
        effective_from
    )
    VALUES (
        v_dest_org_id, 
        v_dest_branch_id, 
        p_student_id, 
        v_dest_profile.id, 
        v_dest_year_id, 
        v_dest_class_id, 
        p_destination_section_id, 
        'ACTIVE', 
        p_effective_date
    )
    RETURNING id INTO v_new_enrollment_id;

    RETURN v_new_enrollment_id;
END;
$$;
