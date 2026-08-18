-- Phase 3C.3A: Enrollment Structural Upgrade

-- 1. Replace existing CASCADE with RESTRICT to protect historical data
ALTER TABLE public.enrollments
    DROP CONSTRAINT enrollments_organization_id_fkey,
    DROP CONSTRAINT enrollments_branch_id_fkey,
    DROP CONSTRAINT enrollments_student_id_fkey,
    DROP CONSTRAINT enrollments_student_branch_profile_id_fkey;

ALTER TABLE public.enrollments
    ADD CONSTRAINT enrollments_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE RESTRICT,
    ADD CONSTRAINT enrollments_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE RESTRICT,
    ADD CONSTRAINT enrollments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE RESTRICT,
    ADD CONSTRAINT enrollments_student_branch_profile_id_fkey FOREIGN KEY (student_branch_profile_id) REFERENCES public.student_branch_profiles(id) ON DELETE RESTRICT;

-- 2. Add academic structural columns
ALTER TABLE public.enrollments
    ADD COLUMN academic_year_id UUID NOT NULL,
    ADD COLUMN class_id UUID NOT NULL,
    ADD COLUMN section_id UUID NOT NULL,
    ADD COLUMN roll_number INTEGER NULL;

-- 3. Redefine create_student_with_initial_placement to NOT create an enrollment automatically, 
-- since enrollments now require academic structure.
CREATE OR REPLACE FUNCTION public.create_student_with_initial_placement(
    p_organization_id UUID,
    p_branch_id UUID,
    p_first_name TEXT,
    p_last_name TEXT,
    p_date_of_birth DATE DEFAULT NULL,
    p_gender TEXT DEFAULT NULL,
    p_middle_name TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $FUNC$
DECLARE
    v_student_id UUID;
    v_profile_id UUID;
BEGIN
    -- Explicitly validate branch membership to prevent abuse of SECURITY DEFINER
    IF NOT (auth_is_super_admin() OR p_branch_id = ANY(auth_user_branches())) THEN
        RAISE EXCEPTION 'Not authorized to create student in this branch (RLS bypassed)';
    END IF;

    -- Pre-generate the UUID to avoid RETURNING clause which triggers SELECT RLS before enrollment exists
    v_student_id := gen_random_uuid();

    -- 1. Create the student
    INSERT INTO public.students (
        id, organization_id, first_name, middle_name, last_name, date_of_birth, gender
    ) VALUES (
        v_student_id, p_organization_id, p_first_name, p_middle_name, p_last_name, p_date_of_birth, p_gender
    );
    
    -- 2. Create the branch profile
    INSERT INTO public.student_branch_profiles (
        id, student_id, branch_id
    ) VALUES (
        gen_random_uuid(), v_student_id, p_branch_id
    ) RETURNING id INTO v_profile_id;

    -- NOTE: We no longer automatically insert into enrollments here. 
    -- Callers must manually insert an enrollment with academic_year, class, and section IDs.

    RETURN v_student_id;
END;
$FUNC$;
GRANT EXECUTE ON FUNCTION public.create_student_with_initial_placement TO authenticated;

-- 3. Add composite structural foreign key to sections
ALTER TABLE public.enrollments
    ADD CONSTRAINT fk_enrollments_section 
    FOREIGN KEY (section_id, class_id, academic_year_id, branch_id) 
    REFERENCES public.sections (id, class_id, academic_year_id, branch_id) 
    ON DELETE RESTRICT;

-- 4. Uniqueness constraints
CREATE UNIQUE INDEX idx_unique_active_enrollment 
    ON public.enrollments (student_branch_profile_id, academic_year_id) 
    WHERE status = 'ACTIVE';

CREATE UNIQUE INDEX idx_unique_active_roll_number 
    ON public.enrollments (section_id, roll_number) 
    WHERE status = 'ACTIVE' AND roll_number IS NOT NULL;

-- 5. Lifecycle constraint and transitions
ALTER TABLE public.enrollments
    DROP CONSTRAINT enrollments_status_check;

ALTER TABLE public.enrollments
    ADD CONSTRAINT enrollments_status_check 
    CHECK (status IN ('ACTIVE', 'TRANSFERRED', 'WITHDRAWN', 'COMPLETED', 'GRADUATED', 'CANCELLED'));

-- Trigger for lifecycle transition enforcement
CREATE OR REPLACE FUNCTION public.enforce_enrollment_lifecycle()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        -- If old status was terminal, prevent reverting to ACTIVE
        IF OLD.status IN ('TRANSFERRED', 'WITHDRAWN', 'COMPLETED', 'GRADUATED') AND NEW.status = 'ACTIVE' THEN
            RAISE EXCEPTION 'Cannot transition from % to ACTIVE', OLD.status;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_enforce_enrollment_lifecycle
    BEFORE UPDATE ON public.enrollments
    FOR EACH ROW EXECUTE FUNCTION public.enforce_enrollment_lifecycle();

-- 6. Enforce enrollments.branch_id = student_branch_profiles.branch_id
CREATE OR REPLACE FUNCTION public.verify_enrollment_branch_consistency()
RETURNS TRIGGER AS $$
DECLARE
    v_profile_branch_id UUID;
BEGIN
    SELECT branch_id INTO v_profile_branch_id 
    FROM public.student_branch_profiles 
    WHERE id = NEW.student_branch_profile_id;
    
    IF NEW.branch_id != v_profile_branch_id THEN
        RAISE EXCEPTION 'enrollment branch_id contradicts the profile branch_id';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_enforce_enrollment_branch
    BEFORE INSERT OR UPDATE ON public.enrollments
    FOR EACH ROW EXECUTE FUNCTION public.verify_enrollment_branch_consistency();

-- 7. Additional Indexes for Performance & RLS
CREATE INDEX idx_enrollments_student_profile_id ON public.enrollments(student_branch_profile_id);
CREATE INDEX idx_enrollments_section_id ON public.enrollments(section_id);
CREATE INDEX idx_enrollments_academic_year_id ON public.enrollments(academic_year_id);
CREATE INDEX idx_enrollments_branch_status ON public.enrollments(branch_id, status);
