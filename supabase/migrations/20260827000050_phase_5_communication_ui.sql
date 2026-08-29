-- Add helper for UI target selection
CREATE OR REPLACE FUNCTION public.rpc_get_communication_targets(p_branch_id UUID)
RETURNS TABLE (target_type TEXT, target_id UUID, target_name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$ 
DECLARE
    v_has_branch_manage BOOLEAN;
BEGIN
    v_has_branch_manage := public.fn_has_branch_permission(p_branch_id, 'communication.manage.branch');
    
    IF v_has_branch_manage THEN
        RETURN QUERY SELECT 'BRANCH'::TEXT, p_branch_id, 'Entire Branch'::TEXT;
        RETURN QUERY SELECT 'CLASS'::TEXT, id, name FROM public.classes WHERE branch_id = p_branch_id AND status = 'ACTIVE';
        RETURN QUERY SELECT 'SECTION'::TEXT, id, name FROM public.sections WHERE branch_id = p_branch_id AND status = 'ACTIVE';
    ELSE
        RETURN QUERY SELECT 'CLASS'::TEXT, c.id, c.name FROM public.classes c
                     WHERE c.branch_id = p_branch_id AND c.status = 'ACTIVE' AND public.fn_is_teacher_authorized_class(c.id);
        
        RETURN QUERY SELECT 'SECTION'::TEXT, s.id, s.name FROM public.sections s
                     WHERE s.branch_id = p_branch_id AND s.status = 'ACTIVE' AND public.fn_is_teacher_authorized(s.id);
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_get_communication_targets(UUID) TO authenticated;
