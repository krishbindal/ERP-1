"use server";

import { branchAction } from '@/lib/server-actions';
import { getActiveAcademicYearId } from '../lib/scheduling-context';

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
  return branchAction(explicitBranchId, async (ctx) => {
    const academic_year_id = await getActiveAcademicYearId(ctx.supabase, ctx.branchId);
    return ctx.supabase.from('timetable_entries').insert({
      ...data,
      branch_id: ctx.branchId,
      academic_year_id,
    });
  }, '/scheduling/timetable');
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
  return branchAction(explicitBranchId, async (ctx) => {
    return ctx.supabase
      .from('timetable_entries')
      .update(data)
      .eq('id', id)
      .eq('branch_id', ctx.branchId);
  }, '/scheduling/timetable');
}

export async function archiveTimetableEntry(id: string, explicitBranchId?: string) {
  return branchAction(explicitBranchId, async (ctx) => {
    return ctx.supabase
      .from('timetable_entries')
      .update({ status: 'ARCHIVED' })
      .eq('id', id)
      .eq('branch_id', ctx.branchId);
  }, '/scheduling/timetable');
}
