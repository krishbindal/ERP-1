"use server";

import { revalidatePath } from 'next/cache';
import { mapDatabaseError } from '@/lib/db-error-mapper';
import { getSchedulingContext, getBranchContextClient } from '../lib/scheduling-context';

export async function createSubstitution(
  data: {
    timetable_entry_id: string;
    substitution_date: string;
    substitute_staff_id: string;
    substitute_room_id?: string | null;
    reason?: string;
  },
  explicitBranchId?: string
) {
  // NOSONAR
  let branch_id: string;
  let academic_year_id: string;
  let supabase: Awaited<ReturnType<typeof getBranchContextClient>>['supabase'];

  try {
    const ctx = await getSchedulingContext(explicitBranchId);
    branch_id = ctx.branch_id;
    academic_year_id = ctx.academic_year_id;
    supabase = ctx.supabase;
  } catch (e) {
    return { error: (e as Error).message };
  }

  const { error } = await supabase.from('timetable_substitutions').insert({
    ...data,
    branch_id,
    academic_year_id,
  });

  if (error) { console.error("Substitution mutation error:", error); return { error: mapDatabaseError(error) }; }
  revalidatePath('/scheduling/substitutions');
  return { success: true };
}

export async function cancelSubstitution(id: string, explicitBranchId?: string) {
  // NOSONAR
  let supabase: Awaited<ReturnType<typeof getBranchContextClient>>['supabase'];
  let branch_id: string;

  try {
    const ctx = await getBranchContextClient(explicitBranchId);
    supabase = ctx.supabase;
    branch_id = ctx.branch_id;
  } catch (e) {
    return { error: (e as Error).message };
  }

  const { error } = await supabase
    .from('timetable_substitutions')
    .update({ status: 'CANCELLED' })
    .eq('id', id)
    .eq('branch_id', branch_id);

  if (error) { console.error("Substitution mutation error:", error); return { error: mapDatabaseError(error) }; }
  revalidatePath('/scheduling/substitutions');
  return { success: true };
}
