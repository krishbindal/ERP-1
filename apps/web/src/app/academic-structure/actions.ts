"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { mapDatabaseError } from '@/lib/db-error-mapper';
import { getAppContext } from '@/lib/branch-context';

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

// Academic Years
export async function createAcademicYear(data: { name: string; start_date: string; end_date: string; status: string }, explicitBranchId?: string) {
  const supabase = await createClient();
  let branch_id: string;
  try {
    branch_id = await getContextBranchId(explicitBranchId);
  } catch (e: any) {
    return { error: e.message };
  }
  const { error } = await supabase.from('academic_years').insert({ ...data, branch_id });
  if (error) return { error: mapDatabaseError(error) };
  revalidatePath('/academic-structure');
  return { success: true };
}

export async function updateAcademicYear(id: string, data: { name: string; start_date: string; end_date: string; status: string }, explicitBranchId?: string) {
  const supabase = await createClient();
  let branch_id: string;
  try {
    branch_id = await getContextBranchId(explicitBranchId);
  } catch (e: any) {
    return { error: e.message };
  }
  const { error } = await supabase.from('academic_years').update(data).eq('id', id);
  if (error) return { error: mapDatabaseError(error) };
  revalidatePath('/academic-structure');
  return { success: true };
}

export async function deleteAcademicYear(id: string, explicitBranchId?: string) {
  const supabase = await createClient();
  let branch_id: string;
  try {
    branch_id = await getContextBranchId(explicitBranchId);
  } catch (e: any) {
    return { error: e.message };
  }
  const { error } = await supabase.from('academic_years').delete().eq('id', id);
  if (error) return { error: mapDatabaseError(error) };
  revalidatePath('/academic-structure');
  return { success: true };
}

// Classes
export async function createClass(data: { academic_year_id: string; name: string; level: number }, explicitBranchId?: string) {
  const supabase = await createClient();
  let branch_id: string;
  try {
    branch_id = await getContextBranchId(explicitBranchId);
  } catch (e: any) {
    return { error: e.message };
  }
  const { error } = await supabase.from('classes').insert({ ...data, branch_id });
  if (error) return { error: mapDatabaseError(error) };
  revalidatePath('/academic-structure');
  return { success: true };
}

export async function updateClass(id: string, data: { name: string; level: number }, explicitBranchId?: string) {
  const supabase = await createClient();
  let branch_id: string;
  try {
    branch_id = await getContextBranchId(explicitBranchId);
  } catch (e: any) {
    return { error: e.message };
  }
  const { error } = await supabase.from('classes').update(data).eq('id', id);
  if (error) return { error: mapDatabaseError(error) };
  revalidatePath('/academic-structure');
  return { success: true };
}

export async function deleteClass(id: string, explicitBranchId?: string) {
  const supabase = await createClient();
  let branch_id: string;
  try {
    branch_id = await getContextBranchId(explicitBranchId);
  } catch (e: any) {
    return { error: e.message };
  }
  const { error } = await supabase.from('classes').delete().eq('id', id);
  if (error) return { error: mapDatabaseError(error) };
  revalidatePath('/academic-structure');
  return { success: true };
}

// Sections
export async function createSection(data: { class_id: string; name: string; capacity: number }, explicitBranchId?: string) {
  const supabase = await createClient();
  let branch_id: string;
  try {
    branch_id = await getContextBranchId(explicitBranchId);
  } catch (e: any) {
    return { error: e.message };
  }
  const { error } = await supabase.from('sections').insert({ ...data, branch_id });
  if (error) return { error: mapDatabaseError(error) };
  revalidatePath('/academic-structure');
  return { success: true };
}

export async function updateSection(id: string, data: { name: string; capacity: number }, explicitBranchId?: string) {
  const supabase = await createClient();
  let branch_id: string;
  try {
    branch_id = await getContextBranchId(explicitBranchId);
  } catch (e: any) {
    return { error: e.message };
  }
  const { error } = await supabase.from('sections').update(data).eq('id', id);
  if (error) return { error: mapDatabaseError(error) };
  revalidatePath('/academic-structure');
  return { success: true };
}

export async function deleteSection(id: string, explicitBranchId?: string) {
  const supabase = await createClient();
  let branch_id: string;
  try {
    branch_id = await getContextBranchId(explicitBranchId);
  } catch (e: any) {
    return { error: e.message };
  }
  const { error } = await supabase.from('sections').delete().eq('id', id);
  if (error) return { error: mapDatabaseError(error) };
  revalidatePath('/academic-structure');
  return { success: true };
}

export async function getAcademicYears(explicitBranchId?: string) {
  const supabase = await createClient();
  let branch_id: string;
  try {
    branch_id = await getContextBranchId(explicitBranchId);
  } catch (e: any) {
    return { error: e.message };
  }
  const { data, error } = await supabase.from('academic_years').select('id, name').eq('branch_id', branch_id);
  if (error) return { error: mapDatabaseError(error) };
  return { data };
}

export async function getClasses(explicitBranchId?: string) {
  const supabase = await createClient();
  let branch_id: string;
  try {
    branch_id = await getContextBranchId(explicitBranchId);
  } catch (e: any) {
    return { error: e.message };
  }
  const { data, error } = await supabase.from('classes').select('id, name').eq('branch_id', branch_id);
  if (error) return { error: mapDatabaseError(error) };
  return { data };
}
