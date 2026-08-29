-- Phase 5 Notification Engine (Cross-cutting Domain Integration)
BEGIN;

-- 1. Bridge Homework Events to Platform Events
CREATE OR REPLACE FUNCTION public.fn_bridge_homework_events()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_org_id UUID;
    v_branch_id UUID;
BEGIN
    SELECT organization_id, branch_id INTO v_org_id, v_branch_id
    FROM public.homework_assignments WHERE id = NEW.assignment_id;

    INSERT INTO public.platform_events (
        organization_id, branch_id, aggregate_type, aggregate_id, event_type, payload, idempotency_key
    ) VALUES (
        v_org_id, v_branch_id, 'homework_assignment', NEW.assignment_id, 'homework.' || lower(NEW.event_type),
        NEW.payload, NEW.id::TEXT
    ) ON CONFLICT (idempotency_key) DO NOTHING;
    
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bridge_homework_events ON public.homework_events;
CREATE TRIGGER trg_bridge_homework_events
AFTER INSERT ON public.homework_events
FOR EACH ROW EXECUTE FUNCTION public.fn_bridge_homework_events();

-- 2. Notification Rules Engine function
CREATE OR REPLACE FUNCTION public.rpc_process_notification_rules()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $FUNC$
DECLARE
    v_evt RECORD;
    v_rule RECORD;
    v_recipients UUID[];
    v_rec UUID;
    v_msg_id UUID;
BEGIN
    FOR v_evt IN 
        SELECT * FROM public.platform_events 
        WHERE status = 'PENDING' AND event_type NOT IN ('message.queued') AND next_retry_at <= now()
        ORDER BY created_at ASC LIMIT 50 
        FOR UPDATE SKIP LOCKED
    LOOP
        BEGIN
            UPDATE public.platform_events SET status = 'PROCESSING', attempts = attempts + 1 WHERE id = v_evt.id;
            
            -- Check for matching rules
            FOR v_rule IN SELECT * FROM public.notification_rules WHERE organization_id = v_evt.organization_id AND (branch_id = v_evt.branch_id OR branch_id IS NULL) AND event_type = v_evt.event_type
            LOOP
                -- Mock Notification Rule application: Generate a System Notification
                INSERT INTO public.communication_messages (
                    organization_id, branch_id, sender_id, subject, body, type, status
                ) VALUES (
                    v_evt.organization_id, v_evt.branch_id, 
                    (SELECT id FROM public.profiles LIMIT 1), -- In reality, system sender.
                    'System Notification: ' || v_rule.topic,
                    'Event details: ' || v_evt.payload::text,
                    'SYSTEM_NOTIFICATION',
                    'QUEUED'
                ) RETURNING id INTO v_msg_id;
                
                -- Snapshot via outbox loop for this generated message
                INSERT INTO public.platform_events (
                    organization_id, branch_id, aggregate_type, aggregate_id, event_type, payload, idempotency_key
                ) VALUES (
                    v_evt.organization_id, v_evt.branch_id, 'communication_message', v_msg_id, 'message.queued',
                    jsonb_build_object('message_id', v_msg_id),
                    v_msg_id::TEXT || '_queued'
                );
            END LOOP;
            
            UPDATE public.platform_events SET status = 'COMPLETED', processed_at = now() WHERE id = v_evt.id;
        EXCEPTION WHEN OTHERS THEN
            IF v_evt.attempts >= v_evt.max_attempts THEN
                UPDATE public.platform_events SET status = 'DLQ', error_details = jsonb_build_object('error', SQLERRM) WHERE id = v_evt.id;
                INSERT INTO public.dead_letter_queue (organization_id, branch_id, source_table, source_id, payload, error_details, attempts, first_failed_at, last_failed_at)
                VALUES (v_evt.organization_id, v_evt.branch_id, 'platform_events', v_evt.id, v_evt.payload, jsonb_build_object('error', SQLERRM), v_evt.attempts, now(), now());
            ELSE
                UPDATE public.platform_events SET status = 'PENDING', next_retry_at = now() + (power(2, v_evt.attempts) * interval '1 minute'), error_details = jsonb_build_object('error', SQLERRM) WHERE id = v_evt.id;
            END IF;
        END;
    END LOOP;
END;
$FUNC$;

-- 3. Attachment Cleanup Worker
CREATE OR REPLACE FUNCTION public.rpc_cleanup_expired_communications()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Retention rule 1: Purge body for EXPIRED announcements
    UPDATE public.communication_messages
    SET body = '[PURGED]', subject = '[PURGED]', updated_at = now()
    WHERE expires_at < now() AND body != '[PURGED]';

    -- Retention rule 2: System Notifications older than 90 days
    UPDATE public.communication_messages
    SET body = '[PURGED]', subject = '[PURGED]', updated_at = now()
    WHERE type = 'SYSTEM_NOTIFICATION' AND created_at < now() - interval '90 days' AND body != '[PURGED]';

    -- Note: Asynchronous edge function handles deleting from storage buckets for purged items.
END;
$$;
GRANT EXECUTE ON FUNCTION public.rpc_cleanup_expired_communications TO authenticated;

COMMIT;
