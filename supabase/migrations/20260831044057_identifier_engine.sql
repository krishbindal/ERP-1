-- Migration: Identifier Engine Foundation
-- Description: Shared transaction-safe subsystem for generating business identifiers.

CREATE TABLE public.identifier_sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE,
    
    entity_type TEXT NOT NULL,
    
    prefix TEXT NOT NULL DEFAULT '',
    suffix TEXT NOT NULL DEFAULT '',
    padding_length INT NOT NULL DEFAULT 4,
    
    last_value BIGINT NOT NULL DEFAULT 0,
    
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure exactly one sequence configuration per context
    UNIQUE NULLS NOT DISTINCT (organization_id, branch_id, academic_year_id, entity_type)
);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.identifier_sequences TO authenticated;
GRANT ALL ON public.identifier_sequences TO service_role;

-- RLS
ALTER TABLE public.identifier_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sequences in their organization"
    ON public.identifier_sequences FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.organization_memberships
            WHERE organization_memberships.user_id = auth.uid()
            AND organization_memberships.organization_id = identifier_sequences.organization_id
        )
    );

CREATE POLICY "Admins can configure sequences"
    ON public.identifier_sequences FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_role_assignments ura
            JOIN public.branch_memberships bm ON ura.branch_membership_id = bm.id
            JOIN public.branches b ON bm.branch_id = b.id
            JOIN public.roles r ON ura.role_id = r.id
            WHERE bm.user_id = auth.uid()
            AND b.organization_id = identifier_sequences.organization_id
            AND r.name IN ('superadmin', 'organizationadmin', 'branchadmin')
        )
    );

-- The generation function
CREATE OR REPLACE FUNCTION public.generate_business_identifier(
    p_organization_id UUID,
    p_branch_id UUID,
    p_academic_year_id UUID,
    p_entity_type TEXT
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_new_value BIGINT;
    v_prefix TEXT;
    v_suffix TEXT;
    v_padding INT;
    v_result TEXT;
    v_has_access BOOLEAN;
BEGIN
    -- Authorization check: user must belong to the organization
    -- (We use SECURITY DEFINER to allow ordinary roles to generate IDs if they have permission to create the target entity, 
    -- but they must be part of the organization. Bypassing RLS here ensures the sequence is generated atomically even if they don't have UPDATE permissions on the sequence table itself)
    SELECT EXISTS (
        SELECT 1 FROM public.organization_memberships
        WHERE organization_memberships.user_id = auth.uid()
        AND organization_memberships.organization_id = p_organization_id
    ) INTO v_has_access;

    IF NOT v_has_access AND auth.role() != 'service_role' THEN
        RAISE EXCEPTION 'Unauthorized: cannot generate identifier for this organization';
    END IF;

    -- Atomic update and lock
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

REVOKE ALL ON FUNCTION public.generate_business_identifier FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.generate_business_identifier TO authenticated, service_role;
