"use server";

import { schedulingMutation, branchMutation } from '../lib/action-helpers';

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
  return schedulingMutation(explicitBranchId, '/scheduling/substitutions', ({ supabase, branch_id, academic_year_id }) =>
    supabase.from('timetable_substitutions').insert({
      ...data,
      branch_id,
      academic_year_id,
    })
  );
}

export async function cancelSubstitution(id: string, explicitBranchId?: string) {
  return branchMutation(explicitBranchId, '/scheduling/substitutions', ({ supabase, branch_id }) =>
    supabase
      .from('timetable_substitutions')
      .update({ status: 'CANCELLED' })
      .eq('id', id)
      .eq('branch_id', branch_id)
  );
}
