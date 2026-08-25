import json
with open('supabase/migrations/20260827000035_phase_5_communication_rpc_fix.sql', 'a', encoding='utf-8') as f:
    f.write("""
-- 6. Storage Bucket and Policies
INSERT INTO storage.buckets (id, name, public) VALUES ('communication_assets', 'communication_assets', false) ON CONFLICT DO NOTHING;

CREATE POLICY "Users can upload communication attachments to their own drafts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'communication_assets' AND
  (SELECT sender_id FROM public.communication_messages WHERE id::text = path_tokens[1]) = auth.uid() AND
  (SELECT status FROM public.communication_messages WHERE id::text = path_tokens[1]) = 'DRAFT'
);

CREATE POLICY "Users can read communication attachments for messages they received or sent"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'communication_assets' AND
  (
    (SELECT sender_id FROM public.communication_messages WHERE id::text = path_tokens[1]) = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.communication_recipients 
      WHERE message_id::text = path_tokens[1] 
      AND recipient_id = auth.uid()
    )
  )
);
""")
print("done")
