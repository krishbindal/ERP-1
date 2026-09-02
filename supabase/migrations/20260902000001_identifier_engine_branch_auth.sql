-- Migration: Identifier Engine Branch Authorization Hardening
-- Addresses: AUD-002 (P1) — cross-branch identifier authorization bypass
-- 
-- Root cause: generate_business_identifier() only checked organization_memberships
-- but did not verify the caller has branch membership for p_branch_id.
-- A user in Branch A could generate identifiers for Branch B within the same org.
--
-- Fix: Add branch membership + branch/org relationship + academic year validation.
-- Uses canonical authorization model for Super Admin handling.
-- Hardens SECURITY DEFINER with explicit search_path.

CREATE OR REPLACE FUNCTION public.generate_business_identifier(
    p_organization_id UUID,
    p_branch_id UUID,
    p_academic_year_id UUID,
    p_entity_type TEXT
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_new_value BIGINT;
    v_prefix TEXT;
    v_suffix TEXT;
    v_padding INT;
    v_result TEXT;
    v_is_service_role BOOLEAN;
    v_caller_uid UUID;
BEGIN
    -- Determine if caller is service_role (bypasses all user-level checks)
    v_is_service_role := (current_setting('role', true) = 'service_role');

    IF NOT v_is_service_role THEN
        v_caller_uid := auth.uid();

        -- 1. Organization authorization: caller must be an active member
        IF NOT EXISTS (
            SELECT 1 FROM public.organization_memberships
            WHERE user_id = v_caller_uid
              AND organization_id = p_organization_id
              AND status = 'ACTIVE'
        ) THEN
            RAISE EXCEPTION 'Unauthorized: caller is not an active member of the requested organization';
        END IF;

        -- 2. Branch authorization (when branch-scoped)
        IF p_branch_id IS NOT NULL THEN
            -- 2a. Branch must exist and belong to the requested organization
            IF NOT EXISTS (
                SELECT 1 FROM public.branches
                WHERE id = p_branch_id
                  AND organization_id = p_organization_id
                  AND status = 'ACTIVE'
            ) THEN
                RAISE EXCEPTION 'Invalid branch: does not exist or does not belong to the requested organization';
            END IF;

            -- 2b. Caller must have branch membership OR be a Super Admin in this org
            -- Super Admin check follows canonical model: JWT app_metadata.is_super_admin + active profile
            IF NOT EXISTS (
                SELECT 1 FROM public.branch_memberships
                WHERE user_id = v_caller_uid
                  AND branch_id = p_branch_id
                  AND status = 'ACTIVE'
            ) AND NOT public.auth_is_super_admin() THEN
                RAISE EXCEPTION 'Unauthorized: caller does not have an active membership in the requested branch';
            END IF;
        END IF;

        -- 3. Academic year validation (when specified)
        IF p_academic_year_id IS NOT NULL THEN
            -- 3a. When branch-scoped: academic year must belong to that branch
            IF p_branch_id IS NOT NULL THEN
                IF NOT EXISTS (
                    SELECT 1 FROM public.academic_years
                    WHERE id = p_academic_year_id
                      AND branch_id = p_branch_id
                ) THEN
                    RAISE EXCEPTION 'Invalid academic year: does not belong to the requested branch';
                END IF;
            ELSE
                -- 3b. When org-level: academic year's branch must belong to the organization
                IF NOT EXISTS (
                    SELECT 1 FROM public.academic_years ay
                    JOIN public.branches b ON b.id = ay.branch_id
                    WHERE ay.id = p_academic_year_id
                      AND b.organization_id = p_organization_id
                ) THEN
                    RAISE EXCEPTION 'Invalid academic year: does not belong to the requested organization';
                END IF;
            END IF;
        END IF;
    END IF;

    -- Atomic update and lock (only reached after successful authorization)
    UPDATE public.identifier_sequences
    SET last_value = last_value + 1, updated_at = NOW()
    WHERE organization_id = p_organization_id
      AND (branch_id IS NOT DISTINCT FROM p_branch_id)
      AND (academic_year_id IS NOT DISTINCT FROM p_academic_year_id)
      AND entity_type = p_entity_type
    RETURNING last_value, prefix, suffix, padding_length
    INTO v_new_value, v_prefix, v_suffix, v_padding;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Sequence not configured for entity %', p_entity_type;
    END IF;

    -- Format
    v_result := v_prefix || LPAD(v_new_value::TEXT, v_padding, '0') || v_suffix;
    RETURN v_result;
END;
$$;

-- Preserve least-privilege grants
REVOKE ALL ON FUNCTION public.generate_business_identifier(UUID, UUID, UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.generate_business_identifier(UUID, UUID, UUID, TEXT) TO authenticated, service_role;
