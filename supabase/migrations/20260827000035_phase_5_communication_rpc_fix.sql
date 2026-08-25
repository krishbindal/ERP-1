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
    v_actor_id := auth.uid();
    
    SELECT * INTO v_msg FROM public.communication_messages WHERE id = p_message_id FOR UPDATE;
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
    WHERE id = p_message_id;
    
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
    v_actor_id := auth.uid();
    
    SELECT * INTO v_msg FROM public.communication_messages WHERE id = p_message_id FOR UPDATE;
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
    WHERE id = p_message_id;
    
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
GRANT EXECUTE ON FUNCTION public.rpc_process_scheduled_messages() TO service_role;

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
    v_actor_id := auth.uid();
    
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
DECLARE
    v_msg RECORD;
    v_recipients UUID[];
BEGIN
    SELECT * INTO v_msg FROM public.communication_messages WHERE id = p_message_id;
    IF NOT FOUND THEN RETURN ARRAY[]::UUID[]; END IF;

    SELECT array_agg(DISTINCT p_id) INTO v_recipients
    FROM (
        SELECT DISTINCT s.profile_id AS p_id
        FROM public.communication_message_targets cmt
        JOIN public.enrollments e ON (
            e.branch_id = v_msg.branch_id AND
            (
                (cmt.target_type = 'BRANCH' AND e.branch_id = v_msg.branch_id) OR
                (cmt.target_type = 'CLASS' AND e.class_id = cmt.target_id) OR
                (cmt.target_type = 'SECTION' AND e.section_id = cmt.target_id)
            )
        )
        JOIN public.academic_years ay ON e.academic_year_id = ay.id
        JOIN public.students s ON e.student_id = s.id
        WHERE cmt.message_id = p_message_id
          AND e.status = 'ACTIVE'
          AND ay.status = 'ACTIVE'
          AND s.profile_id IS NOT NULL

        UNION
        
        SELECT DISTINCT g.profile_id AS p_id
        FROM public.communication_message_targets cmt
        JOIN public.enrollments e ON (
            e.branch_id = v_msg.branch_id AND
            (
                (cmt.target_type = 'BRANCH' AND e.branch_id = v_msg.branch_id) OR
                (cmt.target_type = 'CLASS' AND e.class_id = cmt.target_id) OR
                (cmt.target_type = 'SECTION' AND e.section_id = cmt.target_id)
            )
        )
        JOIN public.academic_years ay ON e.academic_year_id = ay.id
        JOIN public.student_guardians sg ON e.student_id = sg.student_id
        JOIN public.guardians g ON sg.guardian_id = g.id
        WHERE cmt.message_id = p_message_id
          AND e.status = 'ACTIVE'
          AND ay.status = 'ACTIVE'
          AND g.profile_id IS NOT NULL
          AND g.status = 'ACTIVE'
    ) sub;

    RETURN COALESCE(v_recipients, ARRAY[]::UUID[]);
END;
$$;
REVOKE EXECUTE ON FUNCTION public.fn_resolve_message_recipients(UUID) FROM PUBLIC, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_resolve_message_recipients(UUID) TO service_role;

COMMIT;

-- 6. Storage Bucket and Policies
INSERT INTO storage.buckets (id, name, public) VALUES ('communication_assets', 'communication_assets', false) ON CONFLICT DO NOTHING;

CREATE POLICY "Users can upload communication attachments to their own drafts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'communication_assets' AND
  (SELECT sender_id FROM public.communication_messages WHERE id::text = (string_to_array(name, '/'))[1]) = auth.uid() AND
  (SELECT status FROM public.communication_messages WHERE id::text = (string_to_array(name, '/'))[1]) = 'DRAFT'
);

CREATE POLICY "Users can read communication attachments for messages they received or sent"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'communication_assets' AND
  (
    (SELECT sender_id FROM public.communication_messages WHERE id::text = (string_to_array(name, '/'))[1]) = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.communication_recipients 
      WHERE message_id::text = (string_to_array(name, '/'))[1] 
      AND recipient_id = auth.uid()
    )
  )
);
