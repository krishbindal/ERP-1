"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { mapDatabaseError } from '@/lib/db-error-mapper';
import { getCurrentAppBranch } from '@/lib/branch-context';

export type AppConfigPayload = {
  app_name: string;
  android_package_id?: string;
  ios_bundle_id?: string;
  slug?: string;
  status?: 'draft' | 'active' | 'archived';
  support_contact?: string;
};

async function getContextBranchId() {
  const branch = await getCurrentAppBranch();
  if (!branch) throw new Error("No branch context available.");
  return branch.id;
}

export async function getBranchAppConfig() {
  const supabase = await createClient();
  const branch_id = await getContextBranchId();
  
  const { data, error } = await supabase
    .from('branch_app_configs')
    .select('*')
    .eq('branch_id', branch_id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return { data: null }; // Not found
    }
    return { error: mapDatabaseError(error) };
  }
  return { data };
}

export async function updateBranchAppConfig(payload: AppConfigPayload) {
  const supabase = await createClient();
  const branch_id = await getContextBranchId();

  // Validate package/bundle IDs on the server
  if (payload.android_package_id && !/^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+[0-9a-z_]$/i.test(payload.android_package_id)) {
    return { error: "Invalid Android Package ID format." };
  }
  if (payload.ios_bundle_id && !/^[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/.test(payload.ios_bundle_id)) {
    return { error: "Invalid iOS Bundle ID format." };
  }
  if (payload.slug && !/^[a-z0-9-]+$/.test(payload.slug)) {
    return { error: "Slug can only contain lowercase letters, numbers, and hyphens." };
  }

  const { error } = await supabase
    .from('branch_app_configs')
    .update(payload)
    .eq('branch_id', branch_id);

  if (error) return { error: mapDatabaseError(error) };
  
  revalidatePath('/admin/app-config');
  return { success: true };
}
