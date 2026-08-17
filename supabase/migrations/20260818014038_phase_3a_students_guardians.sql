-- Phase 3A: Students, Guardians, and Minimal Placement Foundation

-- 1. Create tables

CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    middle_name TEXT,
    last_name TEXT NOT NULL,
    date_of_birth DATE,
    gender TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'ARCHIVED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.guardians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'ARCHIVED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.student_guardians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    guardian_id UUID NOT NULL REFERENCES public.guardians(id) ON DELETE CASCADE,
    relationship TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    is_emergency_contact BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, guardian_id) -- prevent duplicate identical links
);

CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'TRANSFERRED', 'WITHDRAWN', 'GRADUATED')),
    effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_to DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- 3. Grants
GRANT SELECT, INSERT, UPDATE ON public.students TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.guardians TO authenticated;
-- Break recursion with a SECURITY DEFINER function
CREATE OR REPLACE FUNCTION public.is_guardian_in_student_org(p_student_id UUID, p_guardian_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_student_org UUID;
    v_guardian_org UUID;
BEGIN
    SELECT organization_id INTO v_student_org FROM students WHERE id = p_student_id;
    SELECT organization_id INTO v_guardian_org FROM guardians WHERE id = p_guardian_id;
    RETURN v_student_org IS NOT NULL AND v_student_org = v_guardian_org;
END;
$$;

GRANT SELECT, INSERT, UPDATE ON public.student_guardians TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.enrollments TO authenticated;

-- 4. Audit Triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_guardians_updated_at BEFORE UPDATE ON public.guardians FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_student_guardians_updated_at BEFORE UPDATE ON public.student_guardians FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_enrollments_updated_at BEFORE UPDATE ON public.enrollments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Indexes
CREATE INDEX idx_students_organization_id ON public.students(organization_id);
CREATE INDEX idx_students_status ON public.students(status);
CREATE INDEX idx_guardians_organization_id ON public.guardians(organization_id);
CREATE INDEX idx_student_guardians_student_id ON public.student_guardians(student_id);
CREATE INDEX idx_student_guardians_guardian_id ON public.student_guardians(guardian_id);
CREATE INDEX idx_enrollments_organization_id ON public.enrollments(organization_id);
CREATE INDEX idx_enrollments_branch_id ON public.enrollments(branch_id);
CREATE INDEX idx_enrollments_student_id ON public.enrollments(student_id);

-- 6. Helper Functions (if any needed for optimization)
-- Using existing auth_user_organizations() and auth_user_branches()

-- 7. RLS Policies

-- ENROLLMENTS
CREATE POLICY "Super Admins can manage enrollments in their orgs"
ON public.enrollments
TO authenticated
USING (organization_id = ANY(auth_user_organizations()) AND auth_is_super_admin())
WITH CHECK (organization_id = ANY(auth_user_organizations()) AND auth_is_super_admin());

CREATE POLICY "Branch members can view enrollments in their branches"
ON public.enrollments FOR SELECT
TO authenticated
USING (branch_id = ANY(auth_user_branches()));

CREATE POLICY "Branch Admins can insert enrollments"
ON public.enrollments FOR INSERT
TO authenticated
WITH CHECK (
    branch_id = ANY(auth_user_branches()) 
    AND organization_id = ANY(auth_user_organizations())
);

CREATE POLICY "Branch Admins can update enrollments"
ON public.enrollments FOR UPDATE
TO authenticated
USING (branch_id = ANY(auth_user_branches()))
WITH CHECK (
    branch_id = ANY(auth_user_branches()) 
    AND organization_id = ANY(auth_user_organizations())
);

-- STUDENTS
CREATE POLICY "Super Admins can manage students in their orgs"
ON public.students
TO authenticated
USING (organization_id = ANY(auth_user_organizations()) AND auth_is_super_admin())
WITH CHECK (organization_id = ANY(auth_user_organizations()) AND auth_is_super_admin());

CREATE POLICY "Branch members can view students placed in their branches"
ON public.students FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.enrollments 
        WHERE enrollments.student_id = students.id 
        AND enrollments.branch_id = ANY(auth_user_branches())
    )
);

CREATE POLICY "Branch Admins can insert students in their org"
ON public.students FOR INSERT
TO authenticated
WITH CHECK (organization_id = ANY(auth_user_organizations()));

CREATE POLICY "Branch Admins can update students placed in their branches"
ON public.students FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.enrollments 
        WHERE enrollments.student_id = students.id 
        AND enrollments.branch_id = ANY(auth_user_branches())
    )
)
WITH CHECK (organization_id = ANY(auth_user_organizations()));

-- GUARDIANS
CREATE POLICY "Super Admins can manage guardians in their orgs"
ON public.guardians
TO authenticated
USING (organization_id = ANY(auth_user_organizations()) AND auth_is_super_admin())
WITH CHECK (organization_id = ANY(auth_user_organizations()) AND auth_is_super_admin());

CREATE POLICY "Branch members can view guardians linked to visible students"
ON public.guardians FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.student_guardians sg
        JOIN public.enrollments e ON sg.student_id = e.student_id
        WHERE sg.guardian_id = guardians.id 
        AND e.branch_id = ANY(auth_user_branches())
    )
);

CREATE POLICY "Branch Admins can insert guardians in their org"
ON public.guardians FOR INSERT
TO authenticated
WITH CHECK (organization_id = ANY(auth_user_organizations()));

CREATE POLICY "Branch Admins can update visible guardians"
ON public.guardians FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.student_guardians sg
        JOIN public.enrollments e ON sg.student_id = e.student_id
        WHERE sg.guardian_id = guardians.id 
        AND e.branch_id = ANY(auth_user_branches())
    )
)
WITH CHECK (organization_id = ANY(auth_user_organizations()));

-- STUDENT_GUARDIANS
CREATE POLICY "Super Admins can manage student_guardians in their orgs"
ON public.student_guardians
TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_id AND s.organization_id = ANY(auth_user_organizations()) AND auth_is_super_admin())
)
WITH CHECK (
    EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_id AND s.organization_id = ANY(auth_user_organizations()) AND auth_is_super_admin())
);

CREATE POLICY "Branch members can view student_guardians linked to visible students"
ON public.student_guardians FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.enrollments e 
        WHERE e.student_id = student_guardians.student_id 
        AND e.branch_id = ANY(auth_user_branches())
    )
);

CREATE POLICY "Branch Admins can insert student_guardians for visible students"
ON public.student_guardians FOR INSERT
TO authenticated
WITH CHECK (
    -- Can only link to students placed in their branch
    EXISTS (
        SELECT 1 FROM public.enrollments e 
        WHERE e.student_id = student_guardians.student_id 
        AND e.branch_id IN (SELECT branch_id FROM branch_memberships WHERE user_id = auth.uid() AND status = 'ACTIVE')
    )
    AND
    -- Can only link to guardians in the same organization as the student
    public.is_guardian_in_student_org(student_guardians.student_id, student_guardians.guardian_id)
);

CREATE POLICY "Branch Admins can update student_guardians for visible students"
ON public.student_guardians FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.enrollments e 
        WHERE e.student_id = student_guardians.student_id 
        AND e.branch_id IN (SELECT branch_id FROM branch_memberships WHERE user_id = auth.uid() AND status = 'ACTIVE')
    )
)
WITH CHECK (
    -- Can only link to students placed in their branch
    EXISTS (
        SELECT 1 FROM public.enrollments e 
        WHERE e.student_id = student_guardians.student_id 
        AND e.branch_id IN (SELECT branch_id FROM branch_memberships WHERE user_id = auth.uid() AND status = 'ACTIVE')
    )
    AND
    -- Can only link to guardians in the same organization as the student
    public.is_guardian_in_student_org(student_guardians.student_id, student_guardians.guardian_id)
);

-- 8. Atomic Creation Function
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
SECURITY INVOKER
AS $$
DECLARE
    v_student_id UUID;
BEGIN
    -- Pre-generate the UUID to avoid RETURNING clause which triggers SELECT RLS before enrollment exists
    v_student_id := gen_random_uuid();

    -- 1. Create the student
    INSERT INTO public.students (
        id, organization_id, first_name, middle_name, last_name, date_of_birth, gender
    ) VALUES (
        v_student_id, p_organization_id, p_first_name, p_middle_name, p_last_name, p_date_of_birth, p_gender
    );

    -- 2. Create the enrollment to link them to the branch (this satisfies visibility for SELECT)
    INSERT INTO public.enrollments (
        organization_id, branch_id, student_id, status
    ) VALUES (
        p_organization_id, p_branch_id, v_student_id, 'ACTIVE'
    );

    RETURN v_student_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.create_student_with_initial_placement TO authenticated;
