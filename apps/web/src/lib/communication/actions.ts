'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createMessage(
  organizationId: string,
  branchId: string,
  subject: string,
  body: string,
  type: 'ANNOUNCEMENT' | 'SYSTEM_NOTIFICATION',
  targets: Array<{ target_type: 'BRANCH' | 'CLASS' | 'SECTION'; target_id?: string }>,
  scheduledFor?: Date,
  expiresAt?: Date
) {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('rpc_create_message', {
    p_organization_id: organizationId,
    p_branch_id: branchId,
    p_subject: subject,
    p_body: body,
    p_type: type,
    p_targets: targets,
    p_scheduled_for: scheduledFor?.toISOString(),
    p_expires_at: expiresAt?.toISOString(),
  });

  if (error) throw new Error(`Failed to create message: ${error.message}`);
  
  revalidatePath('/communication');
  return data;
}

export async function sendMessage(messageId: string) {
  const supabase = createClient();
  const { error } = await supabase.rpc('rpc_send_message', {
    p_message_id: messageId,
  });

  if (error) throw new Error(`Failed to send message: ${error.message}`);
  
  revalidatePath('/communication');
}

export async function markMessageRead(messageId: string) {
  const supabase = createClient();
  const { error } = await supabase.rpc('rpc_mark_read', {
    p_message_id: messageId,
  });

  if (error) throw new Error(`Failed to mark read: ${error.message}`);
  
  revalidatePath('/communication');
}
