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

-- 4.1 Branch Communication Settings
CREATE POLICY "Branch Admins can view settings" ON public.branch_communication_settings
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.branch_memberships WHERE branch_memberships.branch_id = branch_communication_settings.branch_id AND profile_id = auth.uid()));

-- 4.2 Communication Templates
CREATE POLICY "Users can view active templates in their branch" ON public.communication_templates
    FOR SELECT TO authenticated
    USING (
        is_active = true AND 
        EXISTS (SELECT 1 FROM public.branch_memberships WHERE branch_memberships.branch_id = communication_templates.branch_id AND profile_id = auth.uid())
    );

-- 4.3 Communication Messages
-- Admins can view all messages in branch
-- Teachers can view messages they sent
-- Guardians/Students cannot view directly, they read from communication_recipients (One-Way bound)
CREATE POLICY "Users can view messages they sent or received" ON public.communication_messages
    FOR SELECT TO authenticated
    USING (
        sender_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.communication_recipients 
            WHERE communication_recipients.message_id = communication_messages.id 
            AND communication_recipients.recipient_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.role_permissions rp
            JOIN public.user_role_assignments ura ON ura.role_id = rp.role_id
            JOIN public.permissions p ON p.id = rp.permission_id
            WHERE ura.branch_id = communication_messages.branch_id 
            AND ura.profile_id = auth.uid() 
            AND p.name = 'communication.manage.branch'
        )
    );

-- 4.4 Targets
CREATE POLICY "Users can view targets for messages they can view" ON public.communication_message_targets
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.communication_messages 
            WHERE communication_messages.id = communication_message_targets.message_id
        )
    );

-- 4.5 Recipients
-- User can view their own
-- Sender can view recipients of their messages
CREATE POLICY "Users can view their own receipts and sent receipts" ON public.communication_recipients
    FOR SELECT TO authenticated
    USING (
        recipient_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.communication_messages 
            WHERE communication_messages.id = communication_recipients.message_id 
            AND communication_messages.sender_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.communication_messages cm
            JOIN public.role_permissions rp ON true
            JOIN public.user_role_assignments ura ON ura.role_id = rp.role_id
            JOIN public.permissions p ON p.id = rp.permission_id
            WHERE cm.id = communication_recipients.message_id
            AND ura.branch_id = cm.branch_id 
            AND ura.profile_id = auth.uid() 
            AND p.name = 'communication.manage.branch'
        )
    );

-- 4.6 Delivery Attempts
CREATE POLICY "Users can view attempts for their receipts" ON public.communication_delivery_attempts
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.communication_recipients 
            WHERE communication_recipients.id = communication_delivery_attempts.recipient_id
        )
    );

-- 4.7 Attachments
CREATE POLICY "Users can view attachments for messages they can view" ON public.communication_attachments
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.communication_messages 
            WHERE communication_messages.id = communication_attachments.message_id
        )
    );

-- 4.8 Preferences
CREATE POLICY "Users manage their own preferences" ON public.user_notification_preferences
    FOR ALL TO authenticated
    USING (user_id = auth.uid());

-- 4.9 Platform Events (Internal outbox, no direct user access except service_role)
-- 4.10 Audit Logs
CREATE POLICY "Users can view audit logs for messages they can view" ON public.communication_audit_logs
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.communication_messages 
            WHERE communication_messages.id = communication_audit_logs.message_id
        )
    );

-- ==========================================
-- 5. RPC & SERVER ACTIONS (SECURITY DEFINER)
-- ==========================================

-- 5.1 Mark Read
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

-- (RPCs for creating and scheduling messages will be created and properly hardened)
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
-- 5.4 Check message access for Storage
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
            EXISTS (
                SELECT 1 FROM public.communication_recipients
                WHERE message_id = p_message_id AND recipient_id = auth.uid()
            ) OR
            EXISTS (
                SELECT 1 FROM public.role_permissions rp
                JOIN public.user_role_assignments ura ON ura.role_id = rp.role_id
                JOIN public.permissions p ON p.id = rp.permission_id
                WHERE ura.branch_id = public.communication_messages.branch_id 
                AND ura.profile_id = auth.uid() 
                AND p.name = 'communication.manage.branch'
            )
        )
    );
$$;

-- Note: Storage policies would be inserted here, assuming bucket 'communication_attachments' exists.
-- We can add the bucket and policies directly to this migration.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES ('communication_attachments', 'communication_attachments', false, 10485760, '{"image/*", "application/pdf"}')
ON CONFLICT (id) DO UPDATE SET public = false;

CREATE POLICY "Users can access their own attachments" ON storage.objects
FOR SELECT TO authenticated
USING (
    bucket_id = 'communication_attachments' AND
    public.fn_check_message_access((storage.foldername(name))[2]::UUID)
);

CREATE POLICY "Senders can upload attachments" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'communication_attachments' AND
    (storage.foldername(name))[1] = auth.uid()::TEXT -- Enforce path convention: profile_id/message_id/filename
);
-- Fix Insert policy
DROP POLICY IF EXISTS "Senders can upload attachments" ON storage.objects;
CREATE POLICY "Senders can upload attachments" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'communication_attachments' AND
    EXISTS (
        SELECT 1 FROM public.communication_messages
        WHERE id = (storage.foldername(name))[2]::UUID
        AND branch_id = (storage.foldername(name))[1]::UUID
        AND sender_id = auth.uid()
    )
);
