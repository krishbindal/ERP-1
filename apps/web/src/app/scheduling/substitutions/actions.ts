"use server";

import { branchAction } from '@/lib/server-actions';

export async function createSubstitution(
  data: {
    timetable_entry_id: string;
    substitution_date: string;
    substitute_staff_id: string;
    substitute_room_id?: string;
    reason: string;
  },
  explicitBranchId?: string
) {
  return branchAction(explicitBranchId, async (ctx) => {
    // Validate that the target timetable entry belongs to the current branch
    // and resolve its academic_year_id securely
    const { data: entry, error: entryError } = await ctx.supabase
      .from('timetable_entries')
      .select('academic_year_id, branch_id')
      .eq('id', data.timetable_entry_id)
      .eq('branch_id', ctx.branchId)
      .single();

    if (entryError || !entry) {
      return { error: 'Timetable entry not found or belongs to a different branch' };
    }

    return ctx.supabase.from('timetable_substitutions').insert({
      timetable_entry_id: data.timetable_entry_id,
      substitution_date: data.substitution_date,
      substitute_staff_id: data.substitute_staff_id,
      ...(data.substitute_room_id ? { substitute_room_id: data.substitute_room_id } : {}),
      reason: data.reason,
      branch_id: ctx.branchId,
      academic_year_id: entry.academic_year_id,
      status: 'ACTIVE',
    });
  }, '/scheduling/substitutions');
}

export async function cancelSubstitution(id: string, explicitBranchId?: string) {
  return branchAction(explicitBranchId, async (ctx) => {
    return ctx.supabase
      .from('timetable_substitutions')
      .update({ status: 'CANCELLED' })
      .eq('id', id)
      .eq('branch_id', ctx.branchId);
  }, '/scheduling/substitutions');
}
