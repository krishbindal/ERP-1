"use server";

import { schedulingMutation, branchMutation } from '../lib/action-helpers';

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
  return schedulingMutation(explicitBranchId, '/scheduling/timetable', ({ supabase, branch_id, academic_year_id }) =>
    supabase.from('timetable_entries').insert({
      ...data,
      branch_id,
      academic_year_id,
    })
  );
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
  return branchMutation(explicitBranchId, '/scheduling/timetable', ({ supabase, branch_id }) =>
    supabase
      .from('timetable_entries')
      .update(data)
      .eq('id', id)
      .eq('branch_id', branch_id)
  );
}

export async function archiveTimetableEntry(id: string, explicitBranchId?: string) {
  return branchMutation(explicitBranchId, '/scheduling/timetable', ({ supabase, branch_id }) =>
    supabase
      .from('timetable_entries')
      .update({ status: 'ARCHIVED' })
      .eq('id', id)
      .eq('branch_id', branch_id)
  );
}
