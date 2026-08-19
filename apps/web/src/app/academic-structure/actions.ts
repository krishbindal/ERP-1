"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { mapDbError } from '@/lib/db-error-mapper';

// Academic Years
export async function createAcademicYear(data: { branch_id: string; name: string; start_date: string; end_date: string; status: string }) {
  const supabase = await createClient();
  const { error } = await supabase.from('academic_years').insert(data);
  if (error) return { error: mapDbError(error) };
  revalidatePath('/academic-structure');
  return { success: true };
}

export async function updateAcademicYear(id: string, data: { name: string; start_date: string; end_date: string; status: string }) {
  const supabase = await createClient();
  const { error } = await supabase.from('academic_years').update(data).eq('id', id);
  if (error) return { error: mapDbError(error) };
  revalidatePath('/academic-structure');
  return { success: true };
}

export async function deleteAcademicYear(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('academic_years').delete().eq('id', id);
  if (error) return { error: mapDbError(error) };
  revalidatePath('/academic-structure');
  return { success: true };
}

// Classes
export async function createClass(data: { branch_id: string; academic_year_id: string; name: string; level: number }) {
  const supabase = await createClient();
  const { error } = await supabase.from('classes').insert(data);
  if (error) return { error: mapDbError(error) };
  revalidatePath('/academic-structure');
  return { success: true };
}

export async function updateClass(id: string, data: { name: string; level: number }) {
  const supabase = await createClient();
  const { error } = await supabase.from('classes').update(data).eq('id', id);
  if (error) return { error: mapDbError(error) };
  revalidatePath('/academic-structure');
  return { success: true };
}

export async function deleteClass(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('classes').delete().eq('id', id);
  if (error) return { error: mapDbError(error) };
  revalidatePath('/academic-structure');
  return { success: true };
}

// Sections
export async function createSection(data: { branch_id: string; class_id: string; name: string; capacity: number }) {
  const supabase = await createClient();
  const { error } = await supabase.from('sections').insert(data);
  if (error) return { error: mapDbError(error) };
  revalidatePath('/academic-structure');
  return { success: true };
}

export async function updateSection(id: string, data: { name: string; capacity: number }) {
  const supabase = await createClient();
  const { error } = await supabase.from('sections').update(data).eq('id', id);
  if (error) return { error: mapDbError(error) };
  revalidatePath('/academic-structure');
  return { success: true };
}

export async function deleteSection(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('sections').delete().eq('id', id);
  if (error) return { error: mapDbError(error) };
  revalidatePath('/academic-structure');
  return { success: true };
}

export async function getAcademicYears(branch_id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from('academic_years').select('id, name').eq('branch_id', branch_id);
  return { data };
}

export async function getClasses(branch_id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from('classes').select('id, name').eq('branch_id', branch_id);
  return { data };
}
