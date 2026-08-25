-- Phase 5 Worker Logic

-- 1. Add platform_event_id to communication_delivery_attempts
ALTER TABLE public.communication_delivery_attempts
ADD COLUMN platform_event_id UUID REFERENCES public.platform_events(id) ON DELETE CASCADE;

-- Idempotency constraint: one channel delivery attempt per event per recipient per attempt_number
CREATE UNIQUE INDEX idx_comm_delivery_attempts_idempotency
ON public.communication_delivery_attempts (platform_event_id, recipient_id, channel, attempt_number);

-- 2. rpc_claim_platform_events
CREATE OR REPLACE FUNCTION public.rpc_claim_platform_events(p_batch_size INT)
RETURNS SETOF public.platform_events
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
    UPDATE public.platform_events pe
    SET status = 'PROCESSING'
    WHERE pe.id IN (
        SELECT inner_pe.id FROM public.platform_events inner_pe
        WHERE inner_pe.status IN ('PENDING') AND inner_pe.next_retry_at <= now()
        ORDER BY inner_pe.created_at ASC
        LIMIT p_batch_size
        FOR UPDATE SKIP LOCKED
    )
    RETURNING pe.*;
$$;

REVOKE EXECUTE ON FUNCTION public.rpc_claim_platform_events(INT) FROM PUBLIC, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_claim_platform_events(INT) TO service_role;

-- 3. rpc_prepare_message_dispatch (To resolve targets dynamically)
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
            cr.recipient_id,
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

REVOKE EXECUTE ON FUNCTION public.rpc_prepare_message_dispatch(UUID) FROM PUBLIC, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_prepare_message_dispatch(UUID) TO service_role;

-- 4. rpc_record_delivery_attempt
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
    SELECT * INTO v_event FROM public.platform_events WHERE id = p_event_id;
    IF NOT FOUND THEN RETURN; END IF;
    
    v_attempt_number := v_event.attempts + 1;
    v_msg_id := (v_event.payload->>'message_id')::UUID;

    INSERT INTO public.communication_delivery_attempts (
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
        UPDATE public.communication_recipients
        SET status = 'SENT'
        WHERE message_id = v_msg_id AND recipient_id = p_recipient_id;
    ELSE
        UPDATE public.communication_recipients
        SET status = 'FAILED'
        WHERE message_id = v_msg_id AND recipient_id = p_recipient_id;
    END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.rpc_record_delivery_attempt(UUID, UUID, TEXT, TEXT, BOOLEAN, TEXT, JSONB) FROM PUBLIC, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_record_delivery_attempt(UUID, UUID, TEXT, TEXT, BOOLEAN, TEXT, JSONB) TO service_role;

-- 5. rpc_finalize_event
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
    SELECT * INTO v_event FROM public.platform_events WHERE id = p_event_id FOR UPDATE;
    IF NOT FOUND THEN RETURN; END IF;

    v_new_attempts := v_event.attempts + 1;
    v_msg_id := (v_event.payload->>'message_id')::UUID;

    IF p_all_recipients_success THEN
        UPDATE public.platform_events
        SET status = 'PROCESSED', attempts = v_new_attempts, updated_at = now()
        WHERE id = p_event_id;

        UPDATE public.communication_messages
        SET status = 'SENT', updated_at = now()
        WHERE id = v_msg_id;
    ELSE
        IF v_new_attempts >= v_event.max_attempts THEN
            UPDATE public.platform_events
            SET status = 'DLQ', attempts = v_new_attempts, updated_at = now()
            WHERE id = p_event_id;
            
            UPDATE public.communication_messages
            SET status = 'FAILED', updated_at = now()
            WHERE id = v_msg_id;
        ELSE
            UPDATE public.platform_events
            SET status = 'PENDING', 
                attempts = v_new_attempts, 
                next_retry_at = now() + (POWER(2, v_new_attempts) || ' minutes')::INTERVAL,
                updated_at = now()
            WHERE id = p_event_id;
        END IF;
    END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.rpc_finalize_event(UUID, BOOLEAN) FROM PUBLIC, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_finalize_event(UUID, BOOLEAN) TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.communication_delivery_attempts TO service_role;
