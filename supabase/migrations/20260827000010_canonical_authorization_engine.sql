-- Phase B: Canonical Authorization Engine
BEGIN;

-- 1. Structural Slugs for Roles
ALTER TABLE public.roles ADD COLUMN IF NOT EXISTS slug TEXT;
UPDATE public.roles SET slug = lower(replace(name, ' ', '_')) WHERE slug IS NULL;
ALTER TABLE public.roles ALTER COLUMN slug SET NOT NULL;
ALTER TABLE public.roles DROP CONSTRAINT IF EXISTS roles_organization_id_slug_key;
ALTER TABLE public.roles ADD CONSTRAINT roles_organization_id_slug_key UNIQUE (organization_id, slug);

CREATE OR REPLACE FUNCTION public.fn_trg_roles_generate_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF NEW.slug IS NULL THEN
        NEW.slug := lower(replace(NEW.name, ' ', '_'));
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_roles_generate_slug ON public.roles;
CREATE TRIGGER trg_roles_generate_slug
BEFORE INSERT OR UPDATE ON public.roles
FOR EACH ROW EXECUTE FUNCTION public.fn_trg_roles_generate_slug();


-- 2. Revoke excessive execution privileges from PUBLIC, but grant to authenticated
REVOKE EXECUTE ON FUNCTION public.auth_user_has_branch_role(UUID, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.auth_is_super_admin() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.auth_user_organizations() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.auth_user_branches() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.auth_is_branch_admin(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.auth_is_super_admin_for_org(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.auth_user_has_branch_permission(UUID, TEXT) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.auth_user_has_branch_role(UUID, TEXT) TO authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION public.auth_is_super_admin() TO authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION public.auth_user_organizations() TO authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION public.auth_user_branches() TO authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION public.auth_is_branch_admin(UUID) TO authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION public.auth_is_super_admin_for_org(UUID) TO authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION public.auth_user_has_branch_permission(UUID, TEXT) TO authenticated, service_role, anon;

-- 3. Canonical Authorization Functions
-- Returns true if the user's profile is ACTIVE. All other checks must rely on this implicitly or explicitly.
CREATE OR REPLACE FUNCTION public.auth_is_active_user()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND status = 'ACTIVE'
    );
$$;

-- Global super admin check using JWT claim + active profile
CREATE OR REPLACE FUNCTION public.auth_is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
    SELECT public.auth_is_active_user() AND COALESCE((current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'is_super_admin')::boolean, false);
$$;

CREATE OR REPLACE FUNCTION public.auth_has_role_slug(p_branch_id UUID, p_role_slug TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
    SELECT 
      (public.auth_is_super_admin() AND EXISTS (
          SELECT 1 FROM public.organization_memberships om
          JOIN public.branches b ON b.organization_id = om.organization_id
          WHERE om.user_id = auth.uid() AND b.id = p_branch_id AND om.status = 'ACTIVE'
      ))
      OR 
      EXISTS (
        SELECT 1 FROM public.branch_memberships bm
        JOIN public.branches b ON b.id = bm.branch_id
        JOIN public.organization_memberships om ON om.organization_id = b.organization_id AND om.user_id = auth.uid()
        JOIN public.user_role_assignments ura ON ura.branch_membership_id = bm.id
        JOIN public.roles r ON r.id = ura.role_id
        WHERE bm.user_id = auth.uid()
        AND bm.branch_id = p_branch_id
        AND bm.status = 'ACTIVE'
        AND b.status = 'ACTIVE'
        AND om.status = 'ACTIVE'
        AND r.slug = p_role_slug
        AND public.auth_is_active_user()
    );
$$;

CREATE OR REPLACE FUNCTION public.auth_has_permission(p_branch_id UUID, p_permission TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
    SELECT 
      (public.auth_is_super_admin() AND EXISTS (
          SELECT 1 FROM public.organization_memberships om
          JOIN public.branches b ON b.organization_id = om.organization_id
          WHERE om.user_id = auth.uid() AND b.id = p_branch_id AND om.status = 'ACTIVE'
      ))
      OR 
      EXISTS (
        SELECT 1 FROM public.branch_memberships bm
        JOIN public.branches b ON b.id = bm.branch_id
        JOIN public.organization_memberships om ON om.organization_id = b.organization_id AND om.user_id = auth.uid()
        JOIN public.user_role_assignments ura ON ura.branch_membership_id = bm.id
        JOIN public.roles r ON r.id = ura.role_id
        JOIN public.role_permissions rp ON rp.role_id = r.id
        JOIN public.permissions p ON p.id = rp.permission_id
        WHERE bm.user_id = auth.uid()
        AND bm.branch_id = p_branch_id
        AND bm.status = 'ACTIVE'
        AND b.status = 'ACTIVE'
        AND om.status = 'ACTIVE'
        AND p.name = p_permission
        AND public.auth_is_active_user()
    );
$$;

-- 4. Re-wire old wrappers safely to prevent dropping dependent views/policies immediately
CREATE OR REPLACE FUNCTION public.auth_user_has_branch_role(target_branch_id uuid, target_role_name text)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
    SELECT public.auth_has_role_slug(
        target_branch_id, 
        CASE lower(replace(target_role_name, ' ', ''))
            WHEN 'branchadmin' THEN 'branch_admin'
            WHEN 'superadmin' THEN 'super_admin'
            WHEN 'systemadmin' THEN 'system_admin'
            ELSE lower(replace(target_role_name, ' ', '_'))
        END
    );
$$;

CREATE OR REPLACE FUNCTION public.auth_user_has_branch_permission(target_branch_id uuid, target_permission text)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
    SELECT public.auth_has_permission(target_branch_id, target_permission);
$$;

CREATE OR REPLACE FUNCTION public.fn_has_branch_permission(p_branch_id UUID, p_permission TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
    SELECT public.auth_has_permission(p_branch_id, p_permission);
$$;

CREATE OR REPLACE FUNCTION public.auth_is_branch_admin(p_branch_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
    SELECT public.auth_has_role_slug(p_branch_id, 'branchadmin') OR public.auth_has_role_slug(p_branch_id, 'branch_admin') OR public.auth_has_role_slug(p_branch_id, 'principal');
$$;

-- Secure grants for canonical functions
GRANT EXECUTE ON FUNCTION public.auth_is_active_user() TO authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION public.auth_is_super_admin() TO authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION public.auth_has_role_slug(UUID, TEXT) TO authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION public.auth_has_permission(UUID, TEXT) TO authenticated, service_role, anon;

COMMIT;
