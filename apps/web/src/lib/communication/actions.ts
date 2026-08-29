'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createMessage(
  branchId: string,
  subject: string,
  body: string,
  type: 'ANNOUNCEMENT' | 'SYSTEM_NOTIFICATION',
  targets: Array<{ target_type: 'BRANCH' | 'CLASS' | 'SECTION'; target_id?: string }>,
  scheduledFor?: Date,
  expiresAt?: Date
) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('rpc_create_message', {
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

export async function scheduleMessage(messageId: string, scheduledFor: Date) {
  const supabase = await createClient();
  const { error } = await supabase.rpc('rpc_schedule_message', {
    p_message_id: messageId,
    p_scheduled_for: scheduledFor.toISOString()
  });

  if (error) throw new Error(`Failed to schedule message: ${error.message}`);
  
  revalidatePath('/communication');
}

export async function sendMessage(messageId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc('rpc_send_message', {
    p_message_id: messageId,
  });

  if (error) throw new Error(`Failed to send message: ${error.message}`);
  
  revalidatePath('/communication');
}

export async function markMessageRead(messageId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc('rpc_mark_read', {
    p_message_id: messageId,
  });

  if (error) throw new Error(`Failed to mark read: ${error.message}`);
  
  revalidatePath('/communication');
}

export async function resolveRecipients(branchId: string, targets: Array<{ target_type: string; target_id?: string }>) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('rpc_resolve_recipients', {
    p_branch_id: branchId,
    p_targets: targets
  });

  if (error) throw new Error(`Failed to resolve recipients: ${error.message}`);
  
  return data;
}
