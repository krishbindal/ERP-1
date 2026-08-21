"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { mapDatabaseError } from '@/lib/db-error-mapper';
import { getAppContext, auth_has_org_access } from '@/lib/branch-context';

export type AppConfigPayload = {
  app_name: string;
  android_package_id?: string;
  ios_bundle_id?: string;
  slug?: string;
  status?: 'draft' | 'active' | 'archived';
  support_contact?: string;
};



export async function getBranchAppConfig(explicitBranchId?: string) {
  const supabase = await createClient();
  let branch_id: string;
  try {
    branch_id = await getContextBranchId(explicitBranchId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Unknown error' };
  }
  
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

export async function updateBranchAppConfig(payload: AppConfigPayload, explicitBranchId?: string) {
  const supabase = await createClient();
  let branch_id: string;
  try {
    branch_id = await getContextBranchId(explicitBranchId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Unknown error' };
  }

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


