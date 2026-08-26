import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createAndSendAnnouncement(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Not logged in");

  const org_id = formData.get('organization_id') as string;
  const branch_id = formData.get('branch_id') as string;
  const subject = formData.get('subject') as string;
  const body = formData.get('content') as string;
  const target_type = formData.get('target_type') as string;
  const target_id = formData.get('target_id') as string;

  // 1. Insert message via RPC
  const { data: msgId, error: msgError } = await supabase.rpc('rpc_create_message', {
    p_branch_id: branch_id,
    p_type: 'ANNOUNCEMENT',
    p_subject: subject,
    p_body: body,
    p_category: 'GENERAL',
    p_priority: 'NORMAL',
    p_targets: [{ target_type, target_id: target_type === 'BRANCH' ? null : target_id }],
    p_scheduled_for: null
  });

  if (msgError) throw new Error(msgError.message);

  // 2. Send message via RPC
  const { error: sendError } = await supabase.rpc('rpc_send_message', {
    p_message_id: msgId
  });

  if (sendError) throw new Error(sendError.message);

  revalidatePath('/communication');
  redirect('/communication');
}
