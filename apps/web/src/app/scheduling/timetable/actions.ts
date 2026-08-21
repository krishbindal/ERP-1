"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { mapDatabaseError } from '@/lib/db-error-mapper';
import { getContextBranchId } from '@/lib/branch-context';

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
  const supabase = await createClient();
  let branch_id: string;
  let academic_year_id: string;

  try {
    branch_id = await getContextBranchId(explicitBranchId);
    
    // Fetch active academic year
    const { data: activeYear } = await supabase
      .from('academic_years')
      .select('id')
      .eq('branch_id', branch_id)
      .eq('status', 'ACTIVE')
      .single();
      
    if (!activeYear) throw new Error("No active academic year found for this branch.");
    academic_year_id = activeYear.id;
  } catch (e) {
    return { error: (e as Error).message };
  }

  const { error } = await supabase.from('timetable_entries').insert({
    ...data,
    branch_id,
    academic_year_id,
  });

  if (error) return { error: mapDatabaseError(error) };
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
  const supabase = await createClient();
  let branch_id: string;

  try {
    branch_id = await getContextBranchId(explicitBranchId);
  } catch (e) {
    return { error: (e as Error).message };
  }

  const { error } = await supabase
    .from('timetable_entries')
    .update(data)
    .eq('id', id)
    .eq('branch_id', branch_id);

  if (error) return { error: mapDatabaseError(error) };
  revalidatePath('/scheduling/timetable');
  return { success: true };
}

export async function archiveTimetableEntry(id: string, explicitBranchId?: string) {
  const supabase = await createClient();
  let branch_id: string;

  try {
    branch_id = await getContextBranchId(explicitBranchId);
  } catch (e) {
    return { error: (e as Error).message };
  }

  const { error } = await supabase
    .from('timetable_entries')
    .update({ status: 'ARCHIVED' })
    .eq('id', id)
    .eq('branch_id', branch_id);

  if (error) return { error: mapDatabaseError(error) };
  revalidatePath('/scheduling/timetable');
  return { success: true };
}
