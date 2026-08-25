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
