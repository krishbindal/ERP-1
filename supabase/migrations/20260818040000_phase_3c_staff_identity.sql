-- Phase 3C: Staff Identity and Staff Branch Profiles

-- ==========================================
-- 1. TABLES
-- ==========================================

-- 1.1 staff (Organization-scoped)
CREATE TABLE public.staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    profile_id UUID,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT fk_staff_organization FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_staff_profile FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- 1.2 staff_branch_profiles (Branch-scoped)
CREATE TABLE public.staff_branch_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    employee_id_local TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'TRANSFERRED', 'ARCHIVED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT fk_staff_branch_profiles_staff FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON DELETE CASCADE,
    CONSTRAINT fk_staff_branch_profiles_branch FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE,
    CONSTRAINT staff_branch_profiles_branch_employee_id_key UNIQUE (branch_id, employee_id_local),
    CONSTRAINT staff_branch_profiles_staff_branch_key UNIQUE (staff_id, branch_id)
);

-- ==========================================
-- 2. INDEXES
-- ==========================================
CREATE INDEX idx_staff_organization ON public.staff(organization_id);
CREATE INDEX idx_staff_profile ON public.staff(profile_id);
CREATE INDEX idx_staff_branch_profiles_staff ON public.staff_branch_profiles(staff_id);
CREATE INDEX idx_staff_branch_profiles_branch ON public.staff_branch_profiles(branch_id);

-- ==========================================
-- 3. GRANTS
-- ==========================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_branch_profiles TO authenticated;

-- ==========================================
-- 4. TRIGGERS
-- ==========================================
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON public.staff FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_staff_branch_profiles_updated_at BEFORE UPDATE ON public.staff_branch_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER enforce_staff_branch_profile_branch_immutable BEFORE UPDATE ON public.staff_branch_profiles FOR EACH ROW EXECUTE FUNCTION public.prevent_branch_id_update();
CREATE TRIGGER audit_staff AFTER INSERT OR UPDATE OR DELETE ON public.staff FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
CREATE TRIGGER audit_staff_branch_profiles AFTER INSERT OR UPDATE OR DELETE ON public.staff_branch_profiles FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- ==========================================
-- 5. RLS POLICIES
-- ==========================================
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_branch_profiles ENABLE ROW LEVEL SECURITY;

-- 5.1 staff RLS
CREATE POLICY "Super Admins can manage staff in their orgs"
ON public.staff
TO authenticated
USING (organization_id = ANY(auth_user_organizations()) AND auth_is_super_admin())
WITH CHECK (organization_id = ANY(auth_user_organizations()) AND auth_is_super_admin());

CREATE POLICY "Branch members can view staff linked to visible branch profiles"
ON public.staff FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.staff_branch_profiles 
        WHERE staff_branch_profiles.staff_id = staff.id 
        AND staff_branch_profiles.branch_id = ANY(auth_user_branches())
    )
);

CREATE POLICY "Branch Admins can insert staff in their org"
ON public.staff FOR INSERT
TO authenticated
WITH CHECK (organization_id = ANY(auth_user_organizations()));

CREATE POLICY "Branch Admins can update staff placed in their branches"
ON public.staff FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.staff_branch_profiles 
        WHERE staff_branch_profiles.staff_id = staff.id 
        AND staff_branch_profiles.branch_id = ANY(auth_user_branches())
    )
)
WITH CHECK (organization_id = ANY(auth_user_organizations()));

-- 5.2 staff_branch_profiles RLS
CREATE POLICY "Super Admins can manage staff profiles in their orgs"
ON public.staff_branch_profiles
TO authenticated
USING (
    branch_id IN (SELECT id FROM public.branches WHERE organization_id = ANY(auth_user_organizations())) AND auth_is_super_admin()
)
WITH CHECK (
    branch_id IN (SELECT id FROM public.branches WHERE organization_id = ANY(auth_user_organizations())) AND auth_is_super_admin()
);

CREATE POLICY "Branch members can view staff profiles in their branches"
ON public.staff_branch_profiles FOR SELECT
TO authenticated
USING (branch_id = ANY(auth_user_branches()));

CREATE POLICY "Branch Admins can insert staff profiles"
ON public.staff_branch_profiles FOR INSERT
TO authenticated
WITH CHECK (branch_id = ANY(auth_user_branches()));

CREATE POLICY "Branch Admins can update staff profiles"
ON public.staff_branch_profiles FOR UPDATE
TO authenticated
USING (branch_id = ANY(auth_user_branches()))
WITH CHECK (branch_id = ANY(auth_user_branches()));
