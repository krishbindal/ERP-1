DROP FUNCTION IF EXISTS public.rpc_prepare_message_dispatch(UUID);
CREATE OR REPLACE FUNCTION public.rpc_prepare_message_dispatch(p_event_id UUID)
RETURNS TABLE (
    v_recipient_id UUID,
    email TEXT,
    push_token TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_event RECORD;
    v_msg_id UUID;
    v_recipient UUID;
    v_recipients UUID[];
BEGIN
    SELECT * INTO v_event FROM public.platform_events AS pe WHERE pe.id = p_event_id;
    IF NOT FOUND THEN RETURN; END IF;

    IF v_event.event_type = 'message.queued' THEN
        v_msg_id := (v_event.payload->>'message_id')::UUID;
        
        UPDATE public.communication_messages AS cm SET status = 'PROCESSING' WHERE cm.id = v_msg_id AND cm.status = 'QUEUED';

        v_recipients := public.fn_resolve_message_recipients(v_msg_id);

        FOREACH v_recipient IN ARRAY v_recipients
        LOOP
            INSERT INTO public.communication_recipients AS cr (message_id, recipient_id, status)
            VALUES (v_msg_id, v_recipient, 'QUEUED')
            ON CONFLICT (message_id, recipient_id) DO NOTHING;
        END LOOP;

        RETURN QUERY
        SELECT 
            cr.id as v_recipient_id,
            au.email::TEXT as email,
            ud.push_token::TEXT as push_token
        FROM public.communication_recipients AS cr
        JOIN auth.users AS au ON cr.recipient_id = au.id
        LEFT JOIN public.user_devices AS ud ON cr.recipient_id = ud.user_id AND ud.is_active = true
        WHERE cr.message_id = v_msg_id 
          AND cr.status IN ('QUEUED', 'FAILED');
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_record_delivery_attempt(
    p_event_id UUID,
    p_recipient_id UUID,
    p_channel TEXT,
    p_provider TEXT,
    p_success BOOLEAN,
    p_provider_message_id TEXT,
    p_error_details JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_event RECORD;
    v_attempt_number INT;
    v_msg_id UUID;
BEGIN
    SELECT * INTO v_event FROM public.platform_events AS pe WHERE pe.id = p_event_id;
    IF NOT FOUND THEN RETURN; END IF;
    
    v_attempt_number := v_event.attempts + 1;
    v_msg_id := (v_event.payload->>'message_id')::UUID;

    INSERT INTO public.communication_delivery_attempts AS cda (
        platform_event_id,
        recipient_id,
        channel,
        provider,
        attempt_number,
        provider_message_id,
        error_details,
        success_delivery_timestamp
    ) VALUES (
        p_event_id,
        p_recipient_id,
        p_channel,
        p_provider,
        v_attempt_number,
        p_provider_message_id,
        p_error_details,
        CASE WHEN p_success THEN now() ELSE NULL END
    ) ON CONFLICT (platform_event_id, recipient_id, channel, attempt_number) DO NOTHING;

    IF p_success THEN
        UPDATE public.communication_recipients AS cr
        SET status = 'SENT'
        WHERE cr.message_id = v_msg_id AND cr.id = p_recipient_id;
    ELSE
        UPDATE public.communication_recipients AS cr
        SET status = 'FAILED'
        WHERE cr.message_id = v_msg_id AND cr.id = p_recipient_id;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_finalize_event(
    p_event_id UUID,
    p_all_recipients_success BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_event RECORD;
    v_msg_id UUID;
    v_new_attempts INT;
BEGIN
    SELECT * INTO v_event FROM public.platform_events AS pe WHERE pe.id = p_event_id FOR UPDATE;
    IF NOT FOUND THEN RETURN; END IF;

    v_new_attempts := v_event.attempts + 1;
    v_msg_id := (v_event.payload->>'message_id')::UUID;

    IF p_all_recipients_success THEN
        UPDATE public.platform_events AS pe
        SET status = 'COMPLETED', attempts = v_new_attempts, processed_at = now()
        WHERE pe.id = p_event_id;

        UPDATE public.communication_messages AS cm
        SET status = 'SENT', updated_at = now()
        WHERE cm.id = v_msg_id;
    ELSE
        IF v_new_attempts >= v_event.max_attempts THEN
            UPDATE public.platform_events AS pe
            SET status = 'DLQ', attempts = v_new_attempts, processed_at = now()
            WHERE pe.id = p_event_id;
            
            UPDATE public.communication_messages AS cm
            SET status = 'FAILED', updated_at = now()
            WHERE cm.id = v_msg_id;
        ELSE
            UPDATE public.platform_events AS pe
            SET status = 'PENDING', 
                attempts = v_new_attempts, 
                next_retry_at = now() + (POWER(2, v_new_attempts) || ' minutes')::INTERVAL,
                processed_at = now() 
            WHERE pe.id = p_event_id;
        END IF;
    END IF;
END;
$$;
