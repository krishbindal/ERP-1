'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { getAppContext } from '@/lib/branch-context';
import { z } from 'zod';

const CreateMessageSchema = z.object({
  subject: z.string().min(1, "Subject is required").max(255, "Subject is too long"),
  content: z.string().min(1, "Message content is required").max(10000, "Message is too long"),
  target_type: z.enum(['BRANCH', 'CLASS', 'SECTION']),
  target_id: z.string().uuid("Invalid target ID format").optional().or(z.literal('')),
}).refine(data => {
  if (data.target_type !== 'BRANCH') {
    return !!data.target_id && data.target_id !== '';
  }
  return true;
}, {
  message: "Target ID is required for class or section targets",
  path: ["target_id"]
}).refine(data => {
  if (data.target_type === 'BRANCH') {
    return !data.target_id || data.target_id === '';
  }
  return true;
}, {
  message: "Target ID must not be provided for branch targets",
  path: ["target_id"]
});

export async function createAndSendAnnouncement(formData: FormData): Promise<{ error: string } | { success: true }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const context = await getAppContext();

    if (!user || !context) {
      return { error: "Not logged in" };
    }

    const branch_id = ('branchId' in context) ? context.branchId : null;
    if (!branch_id) {
      return { error: "Invalid branch context" };
    }

    const validatedData = CreateMessageSchema.safeParse({
      subject: formData.get('subject'),
      content: formData.get('content'),
      target_type: formData.get('target_type'),
      target_id: formData.get('target_id'),
    });

    if (!validatedData.success) {
      return { error: validatedData.error.issues[0].message };
    }

    const { subject, content: body, target_type, target_id } = validatedData.data;

    const final_target_id = target_type === 'BRANCH' ? null : target_id;

    // 1. Insert message via RPC
    const { data: msgId, error: msgError } = await supabase.rpc('rpc_create_message', {
      p_branch_id: branch_id,
      p_subject: subject,
      p_body: body,
      p_type: 'ANNOUNCEMENT',
      p_targets: [{ target_type, target_id: final_target_id }],
      p_scheduled_for: null,
      p_expires_at: null
    });

    if (msgError) {
      console.error("rpc_create_message error:", msgError);
      return { error: msgError.message };
    }

    // 2. Send message via RPC
    const { error: sendError } = await supabase.rpc('rpc_send_message', {
      p_message_id: msgId
    });

    if (sendError) {
      console.error("rpc_send_message error:", sendError);
      return { error: sendError.message };
    }

    revalidatePath('/communication');
    return { success: true };
  } catch (err) {
    console.error("Server action error:", err);
    return { error: err instanceof Error ? err.message : "An unexpected error occurred" };
  }
}
