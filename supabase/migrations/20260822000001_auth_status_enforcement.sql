-- ==========================================
-- PR R2.1: Authorization Status Hardening
-- ==========================================

-- 1. Helper Function Fix for Status Enforcement
CREATE OR REPLACE FUNCTION public.auth_user_has_branch_role(target_branch_id uuid, target_role_name text)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.branch_memberships bm
        JOIN public.branches b ON b.id = bm.branch_id
        JOIN public.organization_memberships om ON om.organization_id = b.organization_id AND om.user_id = auth.uid()
        JOIN public.user_role_assignments ura ON ura.branch_membership_id = bm.id
        JOIN public.roles r ON r.id = ura.role_id
        WHERE bm.user_id = auth.uid()
          AND bm.branch_id = target_branch_id
          AND lower(replace(r.name, ' ', '')) = lower(replace(target_role_name, ' ', ''))
          AND bm.status = 'ACTIVE'
          AND b.status = 'ACTIVE'
          AND om.status = 'ACTIVE'
    );
$$;

-- Explicitly revoke execute from public and grant to authenticated
REVOKE EXECUTE ON FUNCTION public.auth_user_has_branch_role(uuid, text) FROM public;
GRANT EXECUTE ON FUNCTION public.auth_user_has_branch_role(uuid, text) TO authenticated;
