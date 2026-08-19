"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { mapDatabaseError } from '@/lib/db-error-mapper';
import { getAppContext } from '@/lib/branch-context';

export type AppConfigPayload = {
  app_name: string;
  android_package_id?: string;
  ios_bundle_id?: string;
  slug?: string;
  status?: 'draft' | 'active' | 'archived';
  support_contact?: string;
};

async function getContextBranchId(explicitBranchId?: string) {
  const context = await getAppContext();
  if (!context) throw new Error("No context available.");
  
  if (context.type === 'superadmin') {
    if (!explicitBranchId) {
      throw new Error("Super Admins must explicitly provide a branch ID.");
    }
    // Verify branch belongs to superadmin's org
    const supabase = await createClient();
    const { data: branch, error } = await supabase
      .from('branches')
      .select('organization_id')
      .eq('id', explicitBranchId)
      .single();
    if (error || !branch) throw new Error("Branch not found or inaccessible.");
    if (branch.organization_id !== context.organizationId) {
      throw new Error("Branch does not belong to your organization.");
    }
    return explicitBranchId;
  }
  
  if (context.type === 'normal') {
    if (explicitBranchId && explicitBranchId !== context.branchId) {
      throw new Error("Normal users cannot target arbitrary branches.");
    }
    return context.branchId;
  }
  throw new Error("Unknown context type.");
}

export async function getBranchAppConfig(explicitBranchId?: string) {
  const supabase = await createClient();
  let branch_id: string;
  try {
    branch_id = await getContextBranchId(explicitBranchId);
  } catch (e: any) {
    return { error: e.message };
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
  } catch (e: any) {
    return { error: e.message };
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
