"use server";

import { branchAction } from '@/lib/server-actions';
import { getActiveAcademicYearId } from '../lib/scheduling-context';

export async function createSubstitution(
  data: {
    timetable_entry_id: string;
    substitution_date: string;
    substitute_staff_id: string;
    substitute_room_id?: string;
    reason: string;
    status?: string;
  },
  explicitBranchId?: string
) {
  return branchAction(explicitBranchId, async (ctx) => {
    const academic_year_id = await getActiveAcademicYearId(ctx.supabase, ctx.branchId);
    return ctx.supabase.from('timetable_substitutions').insert({
      ...data,
      branch_id: ctx.branchId,
      academic_year_id,
      status: data.status || 'ACTIVE',
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
