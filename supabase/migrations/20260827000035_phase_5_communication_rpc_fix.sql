BEGIN;

-- 1. rpc_schedule_message
CREATE OR REPLACE FUNCTION public.rpc_schedule_message(p_message_id UUID, p_scheduled_for TIMESTAMPTZ)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_msg RECORD;
    v_actor_id UUID;
BEGIN
    v_actor_id := (SELECT id FROM public.profiles WHERE auth_id = public.auth_uid() LIMIT 1);
    
    SELECT * INTO v_msg FROM public.communication_messages WHERE id = p_message_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Message not found';
    END IF;

    IF v_msg.sender_id != v_actor_id AND NOT public.auth_is_branch_admin(v_msg.branch_id) THEN
        RAISE EXCEPTION 'Not authorized to schedule this message';
    END IF;

    IF v_msg.status != 'DRAFT' THEN
        RAISE EXCEPTION 'Only DRAFT messages can be scheduled';
    END IF;

    UPDATE public.communication_messages
    SET status = 'SCHEDULED', scheduled_for = p_scheduled_for, updated_at = now()
    WHERE id = p_message_id AND status = 'DRAFT';
    
    INSERT INTO public.communication_audit_logs (message_id, actor_id, action, metadata)
    VALUES (p_message_id, v_actor_id, 'SCHEDULED', jsonb_build_object('scheduled_for', p_scheduled_for));
END;
$$;
REVOKE EXECUTE ON FUNCTION public.rpc_schedule_message(UUID, TIMESTAMPTZ) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_schedule_message(UUID, TIMESTAMPTZ) TO authenticated;

-- 2. rpc_send_message
CREATE OR REPLACE FUNCTION public.rpc_send_message(p_message_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_msg RECORD;
    v_actor_id UUID;
BEGIN
    v_actor_id := (SELECT id FROM public.profiles WHERE auth_id = public.auth_uid() LIMIT 1);
    
    SELECT * INTO v_msg FROM public.communication_messages WHERE id = p_message_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Message not found';
    END IF;

    IF v_msg.sender_id != v_actor_id AND NOT public.auth_is_branch_admin(v_msg.branch_id) THEN
        RAISE EXCEPTION 'Not authorized to send this message';
    END IF;

    IF v_msg.status NOT IN ('DRAFT', 'SCHEDULED') THEN
        RAISE EXCEPTION 'Only DRAFT or SCHEDULED messages can be sent';
    END IF;

    UPDATE public.communication_messages
    SET status = 'QUEUED', updated_at = now()
    WHERE id = p_message_id AND status IN ('DRAFT', 'SCHEDULED');
    
    INSERT INTO public.platform_events (
        organization_id, branch_id, aggregate_type, aggregate_id, event_type, payload, idempotency_key
    ) VALUES (
        v_msg.organization_id, v_msg.branch_id, 'communication_message', p_message_id, 'message.queued',
        jsonb_build_object('message_id', p_message_id),
        p_message_id::TEXT || '_queued'
    ) ON CONFLICT (idempotency_key) DO NOTHING;

    INSERT INTO public.communication_audit_logs (message_id, actor_id, action)
    VALUES (p_message_id, v_actor_id, 'QUEUED');
END;
$$;
REVOKE EXECUTE ON FUNCTION public.rpc_send_message(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_send_message(UUID) TO authenticated;

-- 3. rpc_process_scheduled_messages
CREATE OR REPLACE FUNCTION public.rpc_process_scheduled_messages()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_msg RECORD;
BEGIN
    FOR v_msg IN 
        SELECT * FROM public.communication_messages 
        WHERE status = 'SCHEDULED' AND scheduled_for <= now()
        ORDER BY scheduled_for ASC LIMIT 50 
        FOR UPDATE SKIP LOCKED
    LOOP
        UPDATE public.communication_messages SET status = 'QUEUED', updated_at = now() WHERE id = v_msg.id;
        
        INSERT INTO public.platform_events (
            organization_id, branch_id, aggregate_type, aggregate_id, event_type, payload, idempotency_key
        ) VALUES (
            v_msg.organization_id, v_msg.branch_id, 'communication_message', v_msg.id, 'message.queued',
            jsonb_build_object('message_id', v_msg.id),
            v_msg.id::TEXT || '_queued'
        ) ON CONFLICT (idempotency_key) DO NOTHING;
    END LOOP;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.rpc_process_scheduled_messages() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_process_scheduled_messages() TO authenticated;

-- 4. rpc_mark_read
CREATE OR REPLACE FUNCTION public.rpc_mark_read(p_message_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_actor_id UUID;
BEGIN
    v_actor_id := (SELECT id FROM public.profiles WHERE auth_id = public.auth_uid() LIMIT 1);
    
    UPDATE public.communication_recipients
    SET status = 'READ', read_at = now()
    WHERE message_id = p_message_id AND recipient_id = v_actor_id AND status != 'READ';
END;
$$;
REVOKE EXECUTE ON FUNCTION public.rpc_mark_read(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_mark_read(UUID) TO authenticated;

-- 5. fn_resolve_message_recipients

CREATE OR REPLACE FUNCTION public.fn_resolve_message_recipients(p_message_id UUID)
RETURNS UUID[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN ARRAY(SELECT p.id FROM public.profiles p LIMIT 1); 
END;
$$;
REVOKE EXECUTE ON FUNCTION public.fn_resolve_message_recipients(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_resolve_message_recipients(UUID) TO authenticated;

COMMIT;
