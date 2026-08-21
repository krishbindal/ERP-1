"use server";

import { revalidatePath } from 'next/cache';
import { mapDatabaseError } from '@/lib/db-error-mapper';
import { getSchedulingContext, getBranchContextClient } from '../lib/scheduling-context';

export async function createTimetableEntry(
  data: {
    class_id: string;
    section_id: string;
    subject_id: string;
    period_id: string;
    room_id: string;
    staff_branch_profile_id: string;
    day_of_week: number;
    status: string;
  },
  explicitBranchId?: string
) {
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

  const { error } = await supabase.from('timetable_entries').insert({
    ...data,
    branch_id,
    academic_year_id,
  });

  if (error) { console.error("Timetable mutation error:", error); return { error: mapDatabaseError(error) }; }
  revalidatePath('/scheduling/timetable');
  return { success: true };
}

export async function updateTimetableEntry(
  id: string,
  data: {
    class_id: string;
    section_id: string;
    subject_id: string;
    period_id: string;
    room_id: string;
    staff_branch_profile_id: string;
    day_of_week: number;
    status: string;
  },
  explicitBranchId?: string
) {
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
    .from('timetable_entries')
    .update(data)
    .eq('id', id)
    .eq('branch_id', branch_id);

  if (error) { console.error("Timetable mutation error:", error); return { error: mapDatabaseError(error) }; }
  revalidatePath('/scheduling/timetable');
  return { success: true };
}

export async function archiveTimetableEntry(id: string, explicitBranchId?: string) {
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
    .from('timetable_entries')
    .update({ status: 'ARCHIVED' })
    .eq('id', id)
    .eq('branch_id', branch_id);

  if (error) { console.error("Timetable mutation error:", error); return { error: mapDatabaseError(error) }; }
  revalidatePath('/scheduling/timetable');
  return { success: true };
}
