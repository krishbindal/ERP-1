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
