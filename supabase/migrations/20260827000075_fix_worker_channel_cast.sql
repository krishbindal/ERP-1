-- Fix the parameter types and casting in rpc_record_delivery_attempt
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
        p_channel::public.communication_channel,
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
