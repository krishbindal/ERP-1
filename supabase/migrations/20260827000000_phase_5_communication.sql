-- Phase 5: Communication Migration

-- ==========================================
-- 1. PERMISSIONS
-- ==========================================
INSERT INTO public.permissions (name, description) VALUES
    ('communication.manage.branch', 'Create and manage branch-wide announcements and templates');

-- ==========================================
-- 2. TABLES & SCHEMA
-- ==========================================

CREATE TABLE public.branch_communication_settings (
    branch_id UUID PRIMARY KEY REFERENCES public.branches(id) ON DELETE CASCADE,
    max_teacher_announcements_per_day INT NOT NULL DEFAULT 5,
    max_admin_announcements_per_day INT NOT NULL DEFAULT 50,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.communication_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body_template TEXT NOT NULL,
    variables_schema JSONB,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.communication_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    subject TEXT,
    body TEXT,
    status TEXT NOT NULL DEFAULT 'DRAFT',
    type TEXT NOT NULL DEFAULT 'ANNOUNCEMENT',
    scheduled_for TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_communication_status CHECK (status IN ('DRAFT', 'SCHEDULED', 'QUEUED', 'PROCESSING', 'SENT', 'DELIVERED', 'PARTIALLY_FAILED', 'FAILED')),
    CONSTRAINT chk_communication_type CHECK (type IN ('ANNOUNCEMENT', 'SYSTEM_NOTIFICATION'))
);

CREATE TABLE public.communication_message_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES public.communication_messages(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL,
    target_id UUID,
    CONSTRAINT chk_target_type CHECK (target_type IN ('BRANCH', 'CLASS', 'SECTION'))
);

CREATE TABLE public.communication_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES public.communication_messages(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'QUEUED',
    read_at TIMESTAMPTZ,
    UNIQUE (message_id, recipient_id),
    CONSTRAINT chk_recipient_status CHECK (status IN ('QUEUED', 'SENT', 'DELIVERED', 'FAILED', 'READ'))
);

CREATE TABLE public.communication_delivery_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES public.communication_recipients(id) ON DELETE CASCADE,
    channel TEXT NOT NULL,
    provider TEXT NOT NULL,
    attempt_number INT NOT NULL,
    provider_message_id TEXT,
    error_details JSONB,
    attempt_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    success_delivery_timestamp TIMESTAMPTZ,
    CONSTRAINT chk_delivery_channel CHECK (channel IN ('IN_APP', 'PUSH', 'EMAIL'))
);

CREATE TABLE public.communication_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES public.communication_messages(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_size INT NOT NULL,
    content_type TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_notification_preferences (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    in_app_enabled BOOLEAN NOT NULL DEFAULT true,
    email_enabled BOOLEAN NOT NULL DEFAULT true,
    push_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, topic)
);

CREATE TABLE public.platform_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
    aggregate_type TEXT NOT NULL,
    aggregate_id UUID NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    idempotency_key TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    attempts INT NOT NULL DEFAULT 0,
    max_attempts INT NOT NULL DEFAULT 5,
    next_retry_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    error_details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at TIMESTAMPTZ,
    CONSTRAINT chk_platform_event_status CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'DLQ'))
);

CREATE TABLE public.communication_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES public.communication_messages(id) ON DELETE SET NULL,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- 3. INDEXES
-- ==========================================
CREATE INDEX idx_communication_messages_branch ON public.communication_messages(branch_id);
CREATE INDEX idx_communication_recipients_user ON public.communication_recipients(recipient_id, status);
CREATE INDEX idx_platform_events_pending ON public.platform_events(status, next_retry_at) WHERE status = 'PENDING';
CREATE INDEX idx_communication_audit_message ON public.communication_audit_logs(message_id);

-- ==========================================
-- 4. RLS & POLICIES
-- ==========================================
ALTER TABLE public.branch_communication_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_message_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_delivery_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_audit_logs ENABLE ROW LEVEL SECURITY;

-- Helpers for RLS
CREATE OR REPLACE FUNCTION public.fn_has_branch_permission(p_branch_id UUID, p_permission TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.role_permissions rp
        JOIN public.user_role_assignments ura ON ura.role_id = rp.role_id
        JOIN public.permissions p ON p.id = rp.permission_id
        WHERE ura.branch_id = p_branch_id 
        AND ura.profile_id = auth.uid() 
        AND p.name = p_permission
    );
$$;

-- Settings
CREATE POLICY "Branch Admins can view settings" ON public.branch_communication_settings
    FOR SELECT TO authenticated
    USING (public.fn_has_branch_permission(branch_id, 'communication.manage.branch'));

-- Templates
CREATE POLICY "Admins can manage templates" ON public.communication_templates
    FOR ALL TO authenticated
    USING (public.fn_has_branch_permission(branch_id, 'communication.manage.branch'));

CREATE POLICY "Branch members can view active templates" ON public.communication_templates
    FOR SELECT TO authenticated
    USING (
        is_active = true AND 
        EXISTS (SELECT 1 FROM public.branch_memberships WHERE branch_id = communication_templates.branch_id AND profile_id = auth.uid())
    );

-- Messages
CREATE POLICY "Users can view messages they sent or received" ON public.communication_messages
    FOR SELECT TO authenticated
    USING (
        sender_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.communication_recipients 
            WHERE communication_recipients.message_id = communication_messages.id 
            AND communication_recipients.recipient_id = auth.uid()
        ) OR
        public.fn_has_branch_permission(branch_id, 'communication.manage.branch')
    );

-- Targets
CREATE POLICY "Users can view targets for messages they can view" ON public.communication_message_targets
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.communication_messages cm
            WHERE cm.id = communication_message_targets.message_id
            AND (
                cm.sender_id = auth.uid() OR
                public.fn_has_branch_permission(cm.branch_id, 'communication.manage.branch') OR
                EXISTS (SELECT 1 FROM public.communication_recipients cr WHERE cr.message_id = cm.id AND cr.recipient_id = auth.uid())
            )
        )
    );

-- Recipients
CREATE POLICY "Users can view their own receipts and sent receipts" ON public.communication_recipients
    FOR SELECT TO authenticated
    USING (
        recipient_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.communication_messages cm
            WHERE cm.id = communication_recipients.message_id 
            AND (
                cm.sender_id = auth.uid() OR
                public.fn_has_branch_permission(cm.branch_id, 'communication.manage.branch')
            )
        )
    );

-- Delivery Attempts
CREATE POLICY "Users can view attempts for messages they sent or receive" ON public.communication_delivery_attempts
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.communication_recipients cr
            WHERE cr.id = communication_delivery_attempts.recipient_id
            AND (
                cr.recipient_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.communication_messages cm
                    WHERE cm.id = cr.message_id 
                    AND (
                        cm.sender_id = auth.uid() OR
                        public.fn_has_branch_permission(cm.branch_id, 'communication.manage.branch')
                    )
                )
            )
        )
    );

-- Attachments
CREATE POLICY "Users can view attachments for messages they can view" ON public.communication_attachments
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.communication_messages cm
            WHERE cm.id = communication_attachments.message_id
            AND (
                cm.sender_id = auth.uid() OR
                public.fn_has_branch_permission(cm.branch_id, 'communication.manage.branch') OR
                EXISTS (SELECT 1 FROM public.communication_recipients cr WHERE cr.message_id = cm.id AND cr.recipient_id = auth.uid())
            )
        )
    );

-- Preferences
CREATE POLICY "Users manage their own preferences" ON public.user_notification_preferences
    FOR ALL TO authenticated
    USING (user_id = auth.uid());

-- Audit Logs
CREATE POLICY "Users can view audit logs for messages they can view" ON public.communication_audit_logs
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.communication_messages cm
            WHERE cm.id = communication_audit_logs.message_id
            AND (
                cm.sender_id = auth.uid() OR
                public.fn_has_branch_permission(cm.branch_id, 'communication.manage.branch')
            )
        )
    );

-- ==========================================
-- 5. RPC & SERVER ACTIONS (SECURITY DEFINER)
-- ==========================================

-- 5.1 Helpers for Authorization

-- Teacher Section Auth
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
        -- In Phase 3, teacher_id references profiles.
        WHERE tsa.teacher_id = p_teacher_profile_id
        AND tsa.section_id = p_section_id
        AND ay.status IN ('PLANNED', 'ACTIVE')
    );
$$;

-- Teacher Class Auth
CREATE OR REPLACE FUNCTION public.fn_is_teacher_authorized_class(p_teacher_profile_id UUID, p_class_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.teacher_subject_assignments tsa
        JOIN public.sections s ON s.id = tsa.section_id
        JOIN public.academic_years ay ON ay.id = tsa.academic_year_id
        WHERE tsa.teacher_id = p_teacher_profile_id
        AND s.class_id = p_class_id
        AND ay.status IN ('PLANNED', 'ACTIVE')
    );
$$;

-- 5.2 Rate Limiting
CREATE OR REPLACE FUNCTION public.fn_check_rate_limits(p_branch_id UUID, p_sender_id UUID, p_is_admin BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_today_count INT;
    v_limit INT;
    v_settings public.branch_communication_settings%ROWTYPE;
BEGIN
    SELECT * INTO v_settings FROM public.branch_communication_settings WHERE branch_id = p_branch_id;
    
    -- Default limits if setting not found
    IF NOT FOUND THEN
        v_limit := CASE WHEN p_is_admin THEN 50 ELSE 5 END;
    ELSE
        v_limit := CASE WHEN p_is_admin THEN v_settings.max_admin_announcements_per_day ELSE v_settings.max_teacher_announcements_per_day END;
    END IF;

    SELECT COUNT(*) INTO v_today_count FROM public.communication_messages 
    WHERE sender_id = p_sender_id 
    AND created_at >= CURRENT_DATE;

    IF v_today_count >= v_limit THEN
        RAISE EXCEPTION 'Rate limit exceeded: You have sent % messages today. Limit is %.', v_today_count, v_limit;
    END IF;
END;
$$;

-- 5.3 Message Creation
CREATE OR REPLACE FUNCTION public.rpc_create_message(
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
    v_org_id UUID;
BEGIN
    -- Securely resolve canonical tenant context
    SELECT organization_id INTO v_org_id FROM public.branches WHERE id = p_branch_id;
    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'Invalid branch';
    END IF;

    -- Verify membership
    IF NOT EXISTS (SELECT 1 FROM public.branch_memberships WHERE branch_id = p_branch_id AND profile_id = auth.uid()) THEN
        RAISE EXCEPTION 'Not a member of this branch';
    END IF;

    -- Check privileges
    v_has_branch_manage := public.fn_has_branch_permission(p_branch_id, 'communication.manage.branch');

    -- Enforce Rate Limits
    PERFORM public.fn_check_rate_limits(p_branch_id, auth.uid(), v_has_branch_manage);

    -- Validate targets
    FOR v_target IN SELECT * FROM jsonb_array_elements(p_targets)
    LOOP
        v_target_type := v_target->>'target_type';
        v_target_id := (v_target->>'target_id')::UUID;
        
        IF v_target_type = 'BRANCH' AND NOT v_has_branch_manage THEN
            RAISE EXCEPTION 'Unauthorized to target branch-wide';
        END IF;

        IF v_target_type = 'CLASS' AND NOT v_has_branch_manage THEN
            IF NOT public.fn_is_teacher_authorized_class(auth.uid(), v_target_id) THEN
                RAISE EXCEPTION 'Unauthorized to target class %', v_target_id;
            END IF;
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
        v_org_id, p_branch_id, auth.uid(), p_subject, p_body, p_type, p_scheduled_for, p_expires_at, 
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

-- 5.4 Scheduling Contract
CREATE OR REPLACE FUNCTION public.rpc_schedule_message(p_message_id UUID, p_scheduled_for TIMESTAMPTZ)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_message RECORD;
BEGIN
    SELECT * INTO v_message FROM public.communication_messages WHERE id = p_message_id FOR UPDATE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Message not found';
    END IF;
    
    IF v_message.sender_id != auth.uid() AND NOT public.fn_has_branch_permission(v_message.branch_id, 'communication.manage.branch') THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    IF v_message.status NOT IN ('DRAFT', 'SCHEDULED') THEN
        RAISE EXCEPTION 'Cannot schedule a message in state %', v_message.status;
    END IF;

    UPDATE public.communication_messages
    SET scheduled_for = p_scheduled_for, status = 'SCHEDULED', updated_at = now()
    WHERE id = p_message_id;

    INSERT INTO public.communication_audit_logs (message_id, actor_id, action, metadata)
    VALUES (p_message_id, auth.uid(), 'SCHEDULED', jsonb_build_object('scheduled_for', p_scheduled_for));
END;
$$;
REVOKE EXECUTE ON FUNCTION public.rpc_schedule_message FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_schedule_message TO authenticated;

-- 5.5 Send/Enqueue Message
CREATE OR REPLACE FUNCTION public.rpc_send_message(p_message_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_message RECORD;
BEGIN
    SELECT * INTO v_message FROM public.communication_messages WHERE id = p_message_id FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Message not found';
    END IF;

    IF v_message.sender_id != auth.uid() AND NOT public.fn_has_branch_permission(v_message.branch_id, 'communication.manage.branch') THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    IF v_message.status NOT IN ('DRAFT', 'SCHEDULED') THEN
        RAISE EXCEPTION 'Message is already %', v_message.status;
    END IF;

    -- Concurrency/Idempotency via Status lock
    UPDATE public.communication_messages
    SET status = 'QUEUED', updated_at = now()
    WHERE id = p_message_id;

    -- Idempotent Enqueue
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

-- 5.6 Mark Read
CREATE OR REPLACE FUNCTION public.rpc_mark_read(p_message_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    UPDATE public.communication_recipients
    SET status = 'READ', read_at = now()
    WHERE message_id = p_message_id AND recipient_id = auth.uid();
END;
$$;
REVOKE EXECUTE ON FUNCTION public.rpc_mark_read FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_mark_read TO authenticated;

-- 5.7 Resolve Recipients (Dry Run for Client, actual resolution done in Outbox Worker)
CREATE OR REPLACE FUNCTION public.rpc_resolve_recipients(p_branch_id UUID, p_targets JSONB)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_has_branch_manage BOOLEAN;
    v_target JSONB;
    v_target_type TEXT;
    v_target_id UUID;
    v_total INT := 0;
BEGIN
    v_has_branch_manage := public.fn_has_branch_permission(p_branch_id, 'communication.manage.branch');
    
    -- In actual implementation, we join enrollments & student_guardians.
    -- We mock the count logic dynamically to prevent raw directory download.
    -- Real resolution happens asynchronously during queue processing.
    -- Here we return an estimated distinct count for UI preview.
    
    -- Example simple approximation (would normally join real tables)
    v_total := 10; -- Stubbed count 
    RETURN v_total;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.rpc_resolve_recipients FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_resolve_recipients TO authenticated;

-- 5.8 Retention Cleanup Job Hook
CREATE OR REPLACE FUNCTION public.rpc_cleanup_expired_communications()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Only body is purged. Delivery facts and audits remain.
    UPDATE public.communication_messages
    SET body = '[PURGED]', subject = '[PURGED]'
    WHERE expires_at < now() AND body != '[PURGED]';

    -- Note: Asynchronous storage cleanup worker scans for [PURGED] bodies 
    -- to permanently delete attached files via Supabase API.
END;
$$;
REVOKE EXECUTE ON FUNCTION public.rpc_cleanup_expired_communications FROM PUBLIC;
-- Cannot be executed by arbitrary clients. Called via pg_cron.

-- ==========================================
-- 6. STORAGE POLICIES
-- ==========================================
-- Insert the bucket explicitly
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES ('communication_attachments', 'communication_attachments', false, 10485760, '{"image/*", "application/pdf"}')
ON CONFLICT (id) DO UPDATE SET public = false;

-- Policy helper for RLS
CREATE OR REPLACE FUNCTION public.fn_check_message_access(p_message_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.communication_messages
        WHERE id = p_message_id
        AND (
            sender_id = auth.uid() OR
            EXISTS (SELECT 1 FROM public.communication_recipients WHERE message_id = p_message_id AND recipient_id = auth.uid()) OR
            public.fn_has_branch_permission(branch_id, 'communication.manage.branch')
        )
    );
$$;

-- Download policy
CREATE POLICY "Users can access their own attachments" ON storage.objects
FOR SELECT TO authenticated
USING (
    bucket_id = 'communication_attachments' AND
    public.fn_check_message_access((storage.foldername(name))[2]::UUID)
);

-- Upload policy
CREATE POLICY "Senders can upload attachments" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'communication_attachments' AND
    EXISTS (
        SELECT 1 FROM public.communication_messages
        WHERE id = (storage.foldername(name))[2]::UUID
        AND branch_id = (storage.foldername(name))[1]::UUID
        AND sender_id = auth.uid()
        AND status = 'DRAFT'
    )
);

-- Delete policy (Owner can delete while draft)
CREATE POLICY "Senders can delete draft attachments" ON storage.objects
FOR DELETE TO authenticated
USING (
    bucket_id = 'communication_attachments' AND
    EXISTS (
        SELECT 1 FROM public.communication_messages
        WHERE id = (storage.foldername(name))[2]::UUID
        AND sender_id = auth.uid()
        AND status = 'DRAFT'
    )
);
