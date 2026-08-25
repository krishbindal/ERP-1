-- 5.2 Helper to check if a teacher has active assignment to a section
CREATE OR REPLACE FUNCTION public.fn_is_teacher_authorized(p_teacher_profile_id UUID, p_section_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.teacher_subject_assignments tsa
        JOIN public.academic_years ay ON ay.id = tsa.academic_year_id
        -- Note: using teacher_id as per Phase 3, wait, in phase 3 it was teacher_id referencing profiles temporarily.
        WHERE tsa.teacher_id = p_teacher_profile_id
        AND tsa.section_id = p_section_id
        AND ay.status IN ('PLANNED', 'ACTIVE')
    );
$$;

CREATE OR REPLACE FUNCTION public.rpc_create_message(
    p_organization_id UUID,
    p_branch_id UUID,
    p_subject TEXT,
    p_body TEXT,
    p_type TEXT,
    p_targets JSONB,
    p_scheduled_for TIMESTAMPTZ,
    p_expires_at TIMESTAMPTZ
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_message_id UUID;
    v_target JSONB;
    v_target_type TEXT;
    v_target_id UUID;
    v_has_branch_manage BOOLEAN;
BEGIN
    -- Check branch admin
    SELECT EXISTS (
        SELECT 1 FROM public.role_permissions rp
        JOIN public.user_role_assignments ura ON ura.role_id = rp.role_id
        JOIN public.permissions p ON p.id = rp.permission_id
        WHERE ura.branch_id = p_branch_id 
        AND ura.profile_id = auth.uid() 
        AND p.name = 'communication.manage.branch'
    ) INTO v_has_branch_manage;

    -- Validate targets
    FOR v_target IN SELECT * FROM jsonb_array_elements(p_targets)
    LOOP
        v_target_type := v_target->>'target_type';
        v_target_id := (v_target->>'target_id')::UUID;
        
        IF v_target_type = 'BRANCH' AND NOT v_has_branch_manage THEN
            RAISE EXCEPTION 'Unauthorized to target branch-wide';
        END IF;

        IF v_target_type = 'SECTION' AND NOT v_has_branch_manage THEN
            IF NOT public.fn_is_teacher_authorized(auth.uid(), v_target_id) THEN
                RAISE EXCEPTION 'Unauthorized to target section %', v_target_id;
            END IF;
        END IF;
    END LOOP;

    INSERT INTO public.communication_messages (
        organization_id, branch_id, sender_id, subject, body, type, scheduled_for, expires_at, status
    ) VALUES (
        p_organization_id, p_branch_id, auth.uid(), p_subject, p_body, p_type, p_scheduled_for, p_expires_at, 
        CASE WHEN p_scheduled_for IS NOT NULL THEN 'SCHEDULED' ELSE 'DRAFT' END
    ) RETURNING id INTO v_message_id;

    FOR v_target IN SELECT * FROM jsonb_array_elements(p_targets)
    LOOP
        INSERT INTO public.communication_message_targets (
            message_id, target_type, target_id
        ) VALUES (
            v_message_id, v_target->>'target_type', (v_target->>'target_id')::UUID
        );
    END LOOP;

    INSERT INTO public.communication_audit_logs (message_id, actor_id, action, metadata)
    VALUES (v_message_id, auth.uid(), 'CREATED', jsonb_build_object('type', p_type));

    RETURN v_message_id;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.rpc_create_message FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_create_message TO authenticated;

CREATE OR REPLACE FUNCTION public.rpc_send_message(p_message_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_message RECORD;
    v_has_branch_manage BOOLEAN;
BEGIN
    SELECT * INTO v_message FROM public.communication_messages WHERE id = p_message_id FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Message not found';
    END IF;

    IF v_message.sender_id != auth.uid() THEN
        SELECT EXISTS (
            SELECT 1 FROM public.role_permissions rp
            JOIN public.user_role_assignments ura ON ura.role_id = rp.role_id
            JOIN public.permissions p ON p.id = rp.permission_id
            WHERE ura.branch_id = v_message.branch_id 
            AND ura.profile_id = auth.uid() 
            AND p.name = 'communication.manage.branch'
        ) INTO v_has_branch_manage;
        IF NOT v_has_branch_manage THEN
            RAISE EXCEPTION 'Unauthorized';
        END IF;
    END IF;

    IF v_message.status NOT IN ('DRAFT', 'SCHEDULED') THEN
        RAISE EXCEPTION 'Message is already sent or queued';
    END IF;

    UPDATE public.communication_messages
    SET status = 'QUEUED', updated_at = now()
    WHERE id = p_message_id;

    INSERT INTO public.platform_events (
        organization_id, branch_id, aggregate_type, aggregate_id, event_type, payload, actor_id, idempotency_key
    ) VALUES (
        v_message.organization_id, v_message.branch_id, 'communication_message', p_message_id, 'message.queued',
        jsonb_build_object('message_id', p_message_id),
        auth.uid(),
        p_message_id::TEXT || '_queued'
    ) ON CONFLICT (idempotency_key) DO NOTHING;

    INSERT INTO public.communication_audit_logs (message_id, actor_id, action, metadata)
    VALUES (p_message_id, auth.uid(), 'QUEUED', '{}'::JSONB);
END;
$$;
REVOKE EXECUTE ON FUNCTION public.rpc_send_message FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_send_message TO authenticated;
