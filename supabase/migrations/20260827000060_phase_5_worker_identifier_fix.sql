CREATE OR REPLACE FUNCTION public.rpc_prepare_message_dispatch(p_event_id UUID)
RETURNS TABLE (
    recipient_id UUID,
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
    SELECT * INTO v_event FROM public.platform_events WHERE id = p_event_id;
    IF NOT FOUND THEN RETURN; END IF;

    IF v_event.event_type = 'message.queued' THEN
        v_msg_id := (v_event.payload->>'message_id')::UUID;
        
        UPDATE public.communication_messages SET status = 'PROCESSING' WHERE id = v_msg_id AND status = 'QUEUED';

        v_recipients := public.fn_resolve_message_recipients(v_msg_id);

        FOREACH v_recipient IN ARRAY v_recipients
        LOOP
            INSERT INTO public.communication_recipients (message_id, recipient_id, status)
            VALUES (v_msg_id, v_recipient, 'QUEUED')
            ON CONFLICT (message_id, recipient_id) DO NOTHING;
        END LOOP;

        RETURN QUERY
        SELECT 
            cr.id as recipient_id,
            au.email::TEXT as email,
            ud.token::TEXT as push_token
        FROM public.communication_recipients cr
        JOIN auth.users au ON cr.recipient_id = au.id
        LEFT JOIN public.user_devices ud ON cr.recipient_id = ud.user_id AND ud.is_active = true
        WHERE cr.message_id = v_msg_id 
          AND cr.status IN ('QUEUED', 'FAILED');
    END IF;
END;
$$;
