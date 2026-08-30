'use server';

import { createClient } from '@/lib/supabase/server';

export async function updatePasswordAction(newPassword: string) {
  const supabase = await createClient();
  const { data: user, error: authError } = await supabase.auth.getUser();

  if (authError || !user?.user?.id) {
    return { error: 'Not authenticated' };
  }

  // 1. Update the password in Auth
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (updateError) {
    return { error: updateError.message };
  }

  // 2. Clear the force_password_reset flag using the RPC
  const { error: rpcError } = await supabase.rpc('clear_password_reset_flag');

  if (rpcError) {
    console.error('Failed to clear password reset flag:', rpcError);
    return { error: 'Password updated, but failed to clear reset flag. Please contact support.' };
  }

  return { success: true };
}
