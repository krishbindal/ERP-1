"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { mapDatabaseError } from '@/lib/db-error-mapper';
import { getCurrentAppBranch } from '@/lib/branch-context';

async function getContextBranchId() {
  const branch = await getCurrentAppBranch();
  if (!branch) throw new Error("No branch context available.");
  return branch.id;
}

// Academic Years
export async function createAcademicYear(data: { name: string; start_date: string; end_date: string; status: string }) {
  const supabase = await createClient();
  const branch_id = await getContextBranchId();
  const { error } = await supabase.from('academic_years').insert({ ...data, branch_id });
  if (error) return { error: mapDatabaseError(error) };
  revalidatePath('/academic-structure');
  return { success: true };
}

export async function updateAcademicYear(id: string, data: { name: string; start_date: string; end_date: string; status: string }) {
  const supabase = await createClient();
  const { error } = await supabase.from('academic_years').update(data).eq('id', id);
  if (error) return { error: mapDatabaseError(error) };
  revalidatePath('/academic-structure');
  return { success: true };
}

export async function deleteAcademicYear(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('academic_years').delete().eq('id', id);
  if (error) return { error: mapDatabaseError(error) };
  revalidatePath('/academic-structure');
  return { success: true };
}

// Classes
export async function createClass(data: { academic_year_id: string; name: string; level: number }) {
  const supabase = await createClient();
  const branch_id = await getContextBranchId();
  const { error } = await supabase.from('classes').insert({ ...data, branch_id });
  if (error) return { error: mapDatabaseError(error) };
  revalidatePath('/academic-structure');
  return { success: true };
}

export async function updateClass(id: string, data: { name: string; level: number }) {
  const supabase = await createClient();
  const { error } = await supabase.from('classes').update(data).eq('id', id);
  if (error) return { error: mapDatabaseError(error) };
  revalidatePath('/academic-structure');
  return { success: true };
}

export async function deleteClass(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('classes').delete().eq('id', id);
  if (error) return { error: mapDatabaseError(error) };
  revalidatePath('/academic-structure');
  return { success: true };
}

// Sections
export async function createSection(data: { class_id: string; name: string; capacity: number }) {
  const supabase = await createClient();
  const branch_id = await getContextBranchId();
  const { error } = await supabase.from('sections').insert({ ...data, branch_id });
  if (error) return { error: mapDatabaseError(error) };
  revalidatePath('/academic-structure');
  return { success: true };
}

export async function updateSection(id: string, data: { name: string; capacity: number }) {
  const supabase = await createClient();
  const { error } = await supabase.from('sections').update(data).eq('id', id);
  if (error) return { error: mapDatabaseError(error) };
  revalidatePath('/academic-structure');
  return { success: true };
}

export async function deleteSection(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('sections').delete().eq('id', id);
  if (error) return { error: mapDatabaseError(error) };
  revalidatePath('/academic-structure');
  return { success: true };
}

export async function getAcademicYears() {
  const supabase = await createClient();
  const branch_id = await getContextBranchId();
  const { data, error } = await supabase.from('academic_years').select('id, name').eq('branch_id', branch_id);
  if (error) return { error: mapDatabaseError(error) };
  return { data };
}

export async function getClasses() {
  const supabase = await createClient();
  const branch_id = await getContextBranchId();
  const { data, error } = await supabase.from('classes').select('id, name').eq('branch_id', branch_id);
  if (error) return { error: mapDatabaseError(error) };
  return { data };
}
