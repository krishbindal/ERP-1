-- =======================================================================================
-- Phase F: Homework Remediation
-- =======================================================================================

-- 1. Structural Tenancy Constraints (TEN-001)
-- =======================================================================================
-- Add strict composite foreign keys linking homework -> section -> class -> academic year
-- and linking homework -> class -> subject to guarantee the assignments belong to the 
-- canonical academic hierarchy.

ALTER TABLE public.homework_assignments 
  ADD CONSTRAINT fk_homework_assignments_section_strict 
  FOREIGN KEY (section_id, class_id, academic_year_id, branch_id) 
  REFERENCES public.sections(id, class_id, academic_year_id, branch_id) 
  ON DELETE RESTRICT;

ALTER TABLE public.homework_assignments 
  ADD CONSTRAINT fk_homework_assignments_class_subject 
  FOREIGN KEY (class_id, subject_id) 
  REFERENCES public.class_subjects(class_id, subject_id) 
  ON DELETE RESTRICT;


-- 2. Formal State Machine Trigger (HW-001)
-- =======================================================================================
CREATE OR REPLACE FUNCTION public.fn_trg_homework_state_machine()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
    IF OLD.status = 'DRAFT' THEN
        IF NEW.status NOT IN ('DRAFT', 'PUBLISHED') THEN
            RAISE EXCEPTION 'Invalid status transition: % to %', OLD.status, NEW.status;
        END IF;
    ELSIF OLD.status = 'PUBLISHED' THEN
        IF NEW.status NOT IN ('PUBLISHED', 'CLOSED') THEN
            RAISE EXCEPTION 'Invalid status transition: % to %', OLD.status, NEW.status;
        END IF;
    ELSIF OLD.status = 'CLOSED' THEN
        IF NEW.status != 'CLOSED' THEN
            RAISE EXCEPTION 'Invalid status transition: % to %. Cannot reopen closed homework.', OLD.status, NEW.status;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_homework_state_machine ON public.homework_assignments;
CREATE TRIGGER trg_homework_state_machine
BEFORE UPDATE ON public.homework_assignments
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.fn_trg_homework_state_machine();


-- 3. Platform Events Migration (HW-002, EVT-001)
-- =======================================================================================
-- Migrate homework_events to platform_events for unified outbox pattern.

-- First, drop the bridge trigger
DROP TRIGGER IF EXISTS trg_bridge_homework_events ON public.homework_events;
DROP FUNCTION IF EXISTS public.fn_bridge_homework_events();

-- Second, rewrite rpc_publish_homework to write directly to platform_events
CREATE OR REPLACE FUNCTION public.rpc_publish_homework(
    p_id UUID,
    p_expected_updated_at TIMESTAMPTZ
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
    v_assignment public.homework_assignments%ROWTYPE;
    v_has_permission BOOLEAN;
    v_org_id UUID;
    v_branch_id UUID;
BEGIN
    SELECT * INTO v_assignment FROM public.homework_assignments WHERE id = p_id FOR UPDATE;
    IF v_assignment.id IS NULL THEN RAISE EXCEPTION 'Assignment not found'; END IF;
    IF v_assignment.updated_at != p_expected_updated_at THEN
        RAISE EXCEPTION 'Concurrency conflict: Assignment has been modified';
    END IF;
    IF v_assignment.status != 'DRAFT' THEN
        RAISE EXCEPTION 'Only DRAFT assignments can be published';
    END IF;

    v_branch_id := v_assignment.branch_id;
    SELECT organization_id INTO v_org_id FROM public.branches WHERE id = v_branch_id;

    v_has_permission := public.auth_user_has_branch_permission(v_branch_id, 'homework.manage.all');
    IF NOT v_has_permission THEN
        SELECT EXISTS (
            SELECT 1 FROM public.teacher_subject_assignments tsa
            JOIN public.staff_branch_profiles sbp ON tsa.staff_branch_profile_id = sbp.id
            JOIN public.staff s_auth ON sbp.staff_id = s_auth.id WHERE s_auth.profile_id = auth.uid()
              AND tsa.section_id = v_assignment.section_id
              AND tsa.subject_id = v_assignment.subject_id
              AND tsa.status = 'ACTIVE'
        ) INTO v_has_permission;
    END IF;
    IF NOT v_has_permission THEN RAISE EXCEPTION 'Unauthorized'; END IF;

    UPDATE public.homework_assignments
    SET status = 'PUBLISHED', updated_at = now(), updated_by = auth.uid()
    WHERE id = p_id;
    
    INSERT INTO public.platform_events (
        organization_id, branch_id, aggregate_type, aggregate_id, 
        event_type, payload, actor_id, idempotency_key
    )
    VALUES (
        v_org_id, v_branch_id, 'HOMEWORK', p_id,
        'HOMEWORK_PUBLISHED', jsonb_build_object('assignment_id', p_id, 'status', 'PUBLISHED'),
        auth.uid(), p_id::TEXT || '-PUBLISHED'
    );

    INSERT INTO public.homework_audit_logs (assignment_id, actor_id, action, previous_state, new_state)
    VALUES (p_id, auth.uid(), 'STATUS_CHANGED', jsonb_build_object('status', 'DRAFT'), jsonb_build_object('status', 'PUBLISHED'));

    RETURN TRUE;
END;
$$;

-- Revoke and Grant
REVOKE EXECUTE ON FUNCTION public.rpc_publish_homework(UUID, TIMESTAMPTZ) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_publish_homework(UUID, TIMESTAMPTZ) TO authenticated;

-- Finally, drop homework_events
DROP TABLE IF EXISTS public.homework_events;
