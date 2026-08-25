-- Phase 5: Communication Migration - FINAL HARDENED COMPLETE CONTRACT
BEGIN;

-- ==========================================
-- 1. PERMISSIONS & RBAC
-- ==========================================
INSERT INTO public.permissions (name, description) VALUES
    ('communication.manage.branch', 'Create and manage branch-wide announcements and templates')
ON CONFLICT (name) DO NOTHING;

DO $$
DECLARE
    v_perm_id UUID;
    v_role RECORD;
BEGIN
    SELECT id INTO v_perm_id FROM public.permissions WHERE name = 'communication.manage.branch';
    FOR v_role IN SELECT id FROM public.roles WHERE name IN ('Branch Admin', 'Principal')
    LOOP
        INSERT INTO public.role_permissions (role_id, permission_id) VALUES (v_role.id, v_perm_id) ON CONFLICT DO NOTHING;
    END LOOP;
END
$$;

-- ==========================================
-- 2. TABLES & SCHEMA
-- ==========================================
CREATE TABLE IF NOT EXISTS public.branch_communication_settings (
    branch_id UUID PRIMARY KEY REFERENCES public.branches(id) ON DELETE CASCADE,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    max_teacher_announcements_per_day INT NOT NULL DEFAULT 5,
    max_admin_announcements_per_day INT NOT NULL DEFAULT 50,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.communication_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body_template TEXT NOT NULL,
    variables_schema JSONB,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.communication_messages (
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
    CONSTRAINT chk_communication_status CHECK (status IN ('DRAFT', 'SCHEDULED', 'QUEUED', 'PROCESSING', 'SENT', 'PARTIALLY_FAILED', 'FAILED')),
    CONSTRAINT chk_communication_type CHECK (type IN ('ANNOUNCEMENT', 'SYSTEM_NOTIFICATION'))
);

CREATE TABLE IF NOT EXISTS public.communication_message_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES public.communication_messages(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL,
    target_id UUID,
    CONSTRAINT chk_target_type CHECK (target_type IN ('BRANCH', 'CLASS', 'SECTION')),
    CONSTRAINT chk_target_integrity CHECK (
        (target_type = 'BRANCH' AND target_id IS NULL) OR
        (target_type IN ('CLASS', 'SECTION') AND target_id IS NOT NULL)
    )
);

CREATE TABLE IF NOT EXISTS public.communication_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES public.communication_messages(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'QUEUED',
    read_at TIMESTAMPTZ,
    UNIQUE (message_id, recipient_id),
    CONSTRAINT chk_recipient_status CHECK (status IN ('QUEUED', 'SENT', 'DELIVERED', 'FAILED', 'READ'))
);

CREATE TABLE IF NOT EXISTS public.communication_delivery_attempts (
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

CREATE TABLE IF NOT EXISTS public.communication_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES public.communication_messages(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_size INT NOT NULL,
    content_type TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_notification_preferences (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    in_app_enabled BOOLEAN NOT NULL DEFAULT true,
    email_enabled BOOLEAN NOT NULL DEFAULT true,
    push_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, topic)
);

CREATE TABLE IF NOT EXISTS public.platform_events (
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

CREATE TABLE IF NOT EXISTS public.communication_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES public.communication_messages(id) ON DELETE SET NULL,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notification_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    topic TEXT NOT NULL,
    audience_types TEXT[] NOT NULL,
    channel_priority TEXT[] NOT NULL,
    is_mandatory BOOLEAN NOT NULL DEFAULT false,
    template_id UUID REFERENCES public.communication_templates(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (organization_id, branch_id, event_type)
);

CREATE TABLE IF NOT EXISTS public.user_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    push_token TEXT NOT NULL,
    device_name TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, push_token)
);

CREATE TABLE IF NOT EXISTS public.email_delivery_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES public.communication_messages(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES public.communication_recipients(id) ON DELETE CASCADE,
    email_address TEXT NOT NULL,
    subject TEXT NOT NULL,
    html_body TEXT NOT NULL,
    provider TEXT,
    provider_message_id TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'FAILED')),
    error_details JSONB,
    attempts INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.dead_letter_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
    source_table TEXT NOT NULL,
    source_id UUID NOT NULL,
    payload JSONB NOT NULL,
    error_details JSONB NOT NULL,
    attempts INT NOT NULL,
    first_failed_at TIMESTAMPTZ NOT NULL,
    last_failed_at TIMESTAMPTZ NOT NULL,
    resolution_state TEXT NOT NULL DEFAULT 'UNRESOLVED' CHECK (resolution_state IN ('UNRESOLVED', 'REQUEUED', 'DISMISSED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- 3. INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_communication_messages_branch ON public.communication_messages(branch_id);
CREATE INDEX IF NOT EXISTS idx_communication_messages_scheduled ON public.communication_messages(status, scheduled_for) WHERE status = 'SCHEDULED';
CREATE INDEX IF NOT EXISTS idx_communication_recipients_user ON public.communication_recipients(recipient_id, status);
CREATE INDEX IF NOT EXISTS idx_platform_events_pending ON public.platform_events(status, next_retry_at) WHERE status = 'PENDING';
CREATE INDEX IF NOT EXISTS idx_communication_audit_message ON public.communication_audit_logs(message_id);
CREATE INDEX IF NOT EXISTS idx_dlq_unresolved ON public.dead_letter_queue(resolution_state) WHERE resolution_state = 'UNRESOLVED';

-- ==========================================
-- 4. RLS HELPERS (DECOUPLED FOR RECURSION PREVENTION)
-- ==========================================
CREATE OR REPLACE FUNCTION public.fn_has_branch_permission(p_branch_id UUID, p_permission TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.branch_memberships bm
        JOIN public.user_role_assignments ura ON ura.branch_membership_id = bm.id
        JOIN public.roles r ON r.id = ura.role_id
        JOIN public.role_permissions rp ON rp.role_id = r.id
        JOIN public.permissions p ON p.id = rp.permission_id
        JOIN public.branches b ON b.id = bm.branch_id
        WHERE bm.user_id = auth.uid()
        AND bm.branch_id = p_branch_id
        AND bm.status = 'ACTIVE'
        AND r.organization_id = b.organization_id
        AND p.name = p_permission
    );
$$;

CREATE OR REPLACE FUNCTION public.fn_is_teacher_authorized(p_section_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.staff s
        JOIN public.staff_branch_profiles sbp ON sbp.staff_id = s.id
        JOIN public.teacher_subject_assignments tsa ON tsa.staff_branch_profile_id = sbp.id
        JOIN public.academic_years ay ON ay.id = tsa.academic_year_id
        WHERE s.profile_id = auth.uid()
        AND tsa.section_id = p_section_id
        AND ay.status IN ('PLANNED', 'ACTIVE')
        AND s.status = 'ACTIVE'
        AND sbp.status = 'ACTIVE'
        AND tsa.status = 'ACTIVE'
    );
$$;

CREATE OR REPLACE FUNCTION public.fn_is_teacher_authorized_class(p_class_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.staff s
        JOIN public.staff_branch_profiles sbp ON sbp.staff_id = s.id
        JOIN public.teacher_subject_assignments tsa ON tsa.staff_branch_profile_id = sbp.id
        JOIN public.academic_years ay ON ay.id = tsa.academic_year_id
        WHERE s.profile_id = auth.uid()
        AND tsa.class_id = p_class_id
        AND ay.status IN ('PLANNED', 'ACTIVE')
        AND s.status = 'ACTIVE'
        AND sbp.status = 'ACTIVE'
        AND tsa.status = 'ACTIVE'
    );
$$;

CREATE OR REPLACE FUNCTION public.fn_is_message_sender_or_admin(p_message_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.communication_messages cm
        WHERE cm.id = p_message_id
        AND (
            cm.sender_id = auth.uid() OR
            public.fn_has_branch_permission(cm.branch_id, 'communication.manage.branch')
        )
    );
$$;

CREATE OR REPLACE FUNCTION public.fn_is_message_recipient(p_message_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.communication_recipients
        WHERE message_id = p_message_id AND recipient_id = auth.uid()
    );
$$;

-- ==========================================
-- 5. RLS ENABLEMENT & POLICIES
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
ALTER TABLE public.notification_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_delivery_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dead_letter_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Branch Admins can view settings" ON public.branch_communication_settings
    FOR SELECT TO authenticated
    USING (public.fn_has_branch_permission(branch_id, 'communication.manage.branch'));

CREATE POLICY "Admins can manage templates" ON public.communication_templates
    FOR ALL TO authenticated
    USING (public.fn_has_branch_permission(branch_id, 'communication.manage.branch'));

CREATE POLICY "Branch members can view active templates" ON public.communication_templates
    FOR SELECT TO authenticated
    USING (
        is_active = true AND 
        EXISTS (SELECT 1 FROM public.branch_memberships WHERE branch_id = communication_templates.branch_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can view messages they sent or received" ON public.communication_messages
    FOR SELECT TO authenticated
    USING (
        sender_id = auth.uid() OR
        public.fn_has_branch_permission(branch_id, 'communication.manage.branch') OR
        public.fn_is_message_recipient(id)
    );

CREATE POLICY "Users can view targets for messages they can view" ON public.communication_message_targets
    FOR SELECT TO authenticated
    USING (
        public.fn_is_message_sender_or_admin(message_id) OR
        public.fn_is_message_recipient(message_id)
    );

CREATE POLICY "Users can view their own receipts and sent receipts" ON public.communication_recipients
    FOR SELECT TO authenticated
    USING (
        recipient_id = auth.uid() OR
        public.fn_is_message_sender_or_admin(message_id)
    );

CREATE POLICY "Users can view attempts for messages they sent or receive" ON public.communication_delivery_attempts
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.communication_recipients cr
            WHERE cr.id = communication_delivery_attempts.recipient_id
            AND (cr.recipient_id = auth.uid() OR public.fn_is_message_sender_or_admin(cr.message_id))
        )
    );

CREATE POLICY "Users can view attachments for messages they can view" ON public.communication_attachments
    FOR SELECT TO authenticated
    USING (
        public.fn_is_message_sender_or_admin(message_id) OR
        public.fn_is_message_recipient(message_id)
    );

CREATE POLICY "Users manage their own preferences" ON public.user_notification_preferences
    FOR ALL TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can view audit logs for messages they can view" ON public.communication_audit_logs
    FOR SELECT TO authenticated
    USING (public.fn_is_message_sender_or_admin(message_id));

CREATE POLICY "Admins manage notification rules" ON public.notification_rules
    FOR ALL TO authenticated
    USING (public.fn_has_branch_permission(branch_id, 'communication.manage.branch'));

CREATE POLICY "Users manage their own devices" ON public.user_devices
    FOR ALL TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can view their email jobs" ON public.email_delivery_jobs
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.communication_recipients cr WHERE cr.id = email_delivery_jobs.recipient_id AND (cr.recipient_id = auth.uid() OR public.fn_is_message_sender_or_admin(cr.message_id))));

CREATE POLICY "Admins manage DLQ" ON public.dead_letter_queue
    FOR ALL TO authenticated
    USING (public.fn_has_branch_permission(branch_id, 'communication.manage.branch'));

-- ==========================================
-- 6. RPC CORE FUNCTIONS
-- ==========================================
CREATE OR REPLACE FUNCTION public.fn_check_rate_limits(p_branch_id UUID, p_sender_id UUID, p_is_admin BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_today_count INT;
    v_limit INT;
    v_tz TEXT;
BEGIN
    SELECT timezone INTO v_tz FROM public.branch_communication_settings WHERE branch_id = p_branch_id;
    IF v_tz IS NULL THEN v_tz := 'UTC'; END IF;

    IF p_is_admin THEN
        SELECT max_admin_announcements_per_day INTO v_limit FROM public.branch_communication_settings WHERE branch_id = p_branch_id;
        IF v_limit IS NULL THEN v_limit := 50; END IF;
    ELSE
        SELECT max_teacher_announcements_per_day INTO v_limit FROM public.branch_communication_settings WHERE branch_id = p_branch_id;
        IF v_limit IS NULL THEN v_limit := 5; END IF;
    END IF;

    SELECT COUNT(*) INTO v_today_count FROM public.communication_messages 
    WHERE sender_id = p_sender_id 
    AND (created_at AT TIME ZONE 'UTC' AT TIME ZONE v_tz)::date = (now() AT TIME ZONE 'UTC' AT TIME ZONE v_tz)::date;

    IF v_today_count >= v_limit THEN
        RAISE EXCEPTION 'Rate limit exceeded: You have sent % messages today. Limit is %.', v_today_count, v_limit;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_create_message(
    p_branch_id UUID, p_subject TEXT, p_body TEXT, p_type TEXT, p_targets JSONB, p_scheduled_for TIMESTAMPTZ, p_expires_at TIMESTAMPTZ
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $FUNC$
DECLARE
    v_message_id UUID;
    v_target JSONB;
    v_target_type TEXT;
    v_target_id UUID;
    v_has_branch_manage BOOLEAN;
    v_org_id UUID;
    v_is_active BOOLEAN;
BEGIN
    SELECT (status = 'ACTIVE') INTO v_is_active FROM public.profiles WHERE id = auth.uid();
    IF v_is_active IS NOT TRUE THEN RAISE EXCEPTION 'User profile is inactive'; END IF;

    SELECT organization_id INTO v_org_id FROM public.branches WHERE id = p_branch_id;
    IF v_org_id IS NULL THEN RAISE EXCEPTION 'Invalid branch'; END IF;

    IF NOT EXISTS (SELECT 1 FROM public.branch_memberships WHERE branch_id = p_branch_id AND user_id = auth.uid() AND status = 'ACTIVE') THEN
        RAISE EXCEPTION 'Not an active member of this branch';
    END IF;

    v_has_branch_manage := public.fn_has_branch_permission(p_branch_id, 'communication.manage.branch');
    PERFORM public.fn_check_rate_limits(p_branch_id, auth.uid(), v_has_branch_manage);

    FOR v_target IN SELECT * FROM jsonb_array_elements(p_targets)
    LOOP
        v_target_type := v_target->>'target_type';
        v_target_id := (v_target->>'target_id')::UUID;
        
        IF v_target_type = 'BRANCH' AND NOT v_has_branch_manage THEN RAISE EXCEPTION 'Unauthorized to target branch-wide'; END IF;
        IF v_target_type = 'CLASS' AND NOT v_has_branch_manage AND NOT public.fn_is_teacher_authorized_class(v_target_id) THEN RAISE EXCEPTION 'Unauthorized'; END IF;
        IF v_target_type = 'SECTION' AND NOT v_has_branch_manage AND NOT public.fn_is_teacher_authorized(v_target_id) THEN RAISE EXCEPTION 'Unauthorized'; END IF;
    END LOOP;

    INSERT INTO public.communication_messages (
        organization_id, branch_id, sender_id, subject, body, type, scheduled_for, expires_at, status
    ) VALUES (
        v_org_id, p_branch_id, auth.uid(), p_subject, p_body, p_type, p_scheduled_for, p_expires_at, 
        CASE WHEN p_scheduled_for IS NOT NULL THEN 'SCHEDULED' ELSE 'DRAFT' END
    ) RETURNING id INTO v_message_id;

    FOR v_target IN SELECT * FROM jsonb_array_elements(p_targets)
    LOOP
        v_target_type := v_target->>'target_type';
        v_target_id := (v_target->>'target_id')::UUID;
        IF v_target_type = 'BRANCH' THEN v_target_id := NULL; END IF;
        IF v_target_type IN ('CLASS', 'SECTION') AND v_target_id IS NULL THEN RAISE EXCEPTION 'Target ID required'; END IF;
        INSERT INTO public.communication_message_targets (message_id, target_type, target_id) VALUES (v_message_id, v_target_type, v_target_id);
    END LOOP;

    INSERT INTO public.communication_audit_logs (message_id, actor_id, action, metadata) VALUES (v_message_id, auth.uid(), 'CREATED', jsonb_build_object('type', p_type));

    RETURN v_message_id;
END;
$FUNC$;
GRANT EXECUTE ON FUNCTION public.rpc_create_message TO authenticated;

-- Helper to safely compute recipients
CREATE OR REPLACE FUNCTION public.fn_resolve_message_recipients(p_message_id UUID)
RETURNS UUID[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $FUNC$
DECLARE
    v_target RECORD;
    v_recipients UUID[] := ARRAY[]::UUID[];
BEGIN
    FOR v_target IN SELECT * FROM public.communication_message_targets WHERE message_id = p_message_id
    LOOP
        IF v_target.target_type = 'SECTION' THEN
            SELECT array_cat(v_recipients, array_agg(DISTINCT st.profile_id)) INTO v_recipients FROM public.enrollments e JOIN public.students st ON st.id = e.student_id WHERE e.section_id = v_target.target_id AND e.status = 'ACTIVE' AND st.profile_id IS NOT NULL AND st.status = 'ACTIVE';
            SELECT array_cat(v_recipients, array_agg(DISTINCT g.profile_id)) INTO v_recipients FROM public.enrollments e JOIN public.student_guardians sg ON sg.student_id = e.student_id JOIN public.guardians g ON g.id = sg.guardian_id WHERE e.section_id = v_target.target_id AND e.status = 'ACTIVE' AND g.profile_id IS NOT NULL AND g.status = 'ACTIVE';
        ELSIF v_target.target_type = 'CLASS' THEN
            SELECT array_cat(v_recipients, array_agg(DISTINCT st.profile_id)) INTO v_recipients FROM public.enrollments e JOIN public.students st ON st.id = e.student_id WHERE e.class_id = v_target.target_id AND e.status = 'ACTIVE' AND st.profile_id IS NOT NULL AND st.status = 'ACTIVE';
            SELECT array_cat(v_recipients, array_agg(DISTINCT g.profile_id)) INTO v_recipients FROM public.enrollments e JOIN public.student_guardians sg ON sg.student_id = e.student_id JOIN public.guardians g ON g.id = sg.guardian_id WHERE e.class_id = v_target.target_id AND e.status = 'ACTIVE' AND g.profile_id IS NOT NULL AND g.status = 'ACTIVE';
        ELSIF v_target.target_type = 'BRANCH' THEN
            SELECT array_cat(v_recipients, array_agg(DISTINCT s.profile_id)) INTO v_recipients FROM public.staff_branch_profiles sbp JOIN public.staff s ON s.id = sbp.staff_id WHERE sbp.branch_id = (SELECT branch_id FROM public.communication_messages WHERE id = p_message_id) AND sbp.status = 'ACTIVE' AND s.status = 'ACTIVE' AND s.profile_id IS NOT NULL;
            SELECT array_cat(v_recipients, array_agg(DISTINCT st.profile_id)) INTO v_recipients FROM public.student_branch_profiles stbp JOIN public.students st ON st.id = stbp.student_id WHERE stbp.branch_id = (SELECT branch_id FROM public.communication_messages WHERE id = p_message_id) AND stbp.status = 'ACTIVE' AND st.status = 'ACTIVE' AND st.profile_id IS NOT NULL;
            SELECT array_cat(v_recipients, array_agg(DISTINCT g.profile_id)) INTO v_recipients FROM public.student_branch_profiles stbp JOIN public.students st ON st.id = stbp.student_id JOIN public.student_guardians sg ON sg.student_id = st.id JOIN public.guardians g ON g.id = sg.guardian_id WHERE stbp.branch_id = (SELECT branch_id FROM public.communication_messages WHERE id = p_message_id) AND stbp.status = 'ACTIVE' AND st.status = 'ACTIVE' AND g.status = 'ACTIVE' AND g.profile_id IS NOT NULL;
        END IF;
    END LOOP;
    RETURN (SELECT array_agg(DISTINCT val) FROM unnest(v_recipients) as val);
END;
$FUNC$;

-- Worker functions for processing
CREATE OR REPLACE FUNCTION public.rpc_process_platform_events(p_batch_size INT DEFAULT 50)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $FUNC$
DECLARE
    v_evt RECORD;
    v_recipients UUID[];
    v_rec UUID;
BEGIN
    FOR v_evt IN 
        SELECT * FROM public.platform_events 
        WHERE status = 'PENDING' AND next_retry_at <= now()
        ORDER BY created_at ASC LIMIT p_batch_size 
        FOR UPDATE SKIP LOCKED
    LOOP
        BEGIN
            UPDATE public.platform_events SET status = 'PROCESSING', attempts = attempts + 1 WHERE id = v_evt.id;

            IF v_evt.event_type = 'message.queued' AND v_evt.aggregate_type = 'communication_message' THEN
                v_recipients := public.fn_resolve_message_recipients(v_evt.aggregate_id);
                FOREACH v_rec IN ARRAY v_recipients
                LOOP
                    INSERT INTO public.communication_recipients (message_id, recipient_id, status) VALUES (v_evt.aggregate_id, v_rec, 'SENT') ON CONFLICT DO NOTHING;
                    INSERT INTO public.communication_delivery_attempts (recipient_id, channel, provider, attempt_number, success_delivery_timestamp)
                    SELECT cr.id, 'IN_APP', 'INTERNAL', 1, now() FROM public.communication_recipients cr WHERE cr.message_id = v_evt.aggregate_id AND cr.recipient_id = v_rec;
                END LOOP;
                UPDATE public.communication_messages SET status = 'SENT', updated_at = now() WHERE id = v_evt.aggregate_id;
                INSERT INTO public.communication_audit_logs (message_id, action, metadata) VALUES (v_evt.aggregate_id, 'PROCESSED_DISPATCH', jsonb_build_object('recipient_count', array_length(v_recipients, 1)));
            END IF;

            UPDATE public.platform_events SET status = 'COMPLETED', processed_at = now() WHERE id = v_evt.id;
        EXCEPTION WHEN OTHERS THEN
            IF v_evt.attempts >= v_evt.max_attempts THEN
                UPDATE public.platform_events SET status = 'DLQ', error_details = jsonb_build_object('error', SQLERRM) WHERE id = v_evt.id;
                INSERT INTO public.dead_letter_queue (organization_id, branch_id, source_table, source_id, payload, error_details, attempts, first_failed_at, last_failed_at)
                VALUES (v_evt.organization_id, v_evt.branch_id, 'platform_events', v_evt.id, v_evt.payload, jsonb_build_object('error', SQLERRM), v_evt.attempts, now(), now());
                IF v_evt.event_type = 'message.queued' THEN UPDATE public.communication_messages SET status = 'FAILED' WHERE id = v_evt.aggregate_id; END IF;
            ELSE
                UPDATE public.platform_events SET status = 'PENDING', next_retry_at = now() + (power(2, v_evt.attempts) * interval '1 minute'), error_details = jsonb_build_object('error', SQLERRM) WHERE id = v_evt.id;
            END IF;
        END;
    END LOOP;
END;
$FUNC$;

-- Storage policies
CREATE OR REPLACE FUNCTION public.fn_check_message_access(p_message_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
    SELECT EXISTS (SELECT 1 FROM public.communication_messages WHERE id = p_message_id AND (sender_id = auth.uid() OR public.fn_has_branch_permission(branch_id, 'communication.manage.branch')))
    OR EXISTS (SELECT 1 FROM public.communication_recipients WHERE message_id = p_message_id AND recipient_id = auth.uid());
$$;

COMMIT;
