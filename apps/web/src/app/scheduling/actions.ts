"use server";

import { getBranchContextClient } from './lib/scheduling-context';
import { mapDatabaseError } from '@/lib/db-error-mapper';
import { branchMutation } from './lib/action-helpers';

// Rooms
export async function createRoom(data: { name: string; capacity: number; status: string }, explicitBranchId?: string) {
  return branchMutation(explicitBranchId, '/scheduling', ({ supabase, branch_id }) =>
    supabase.from('rooms').insert({ ...data, branch_id })
  );
}

export async function updateRoom(id: string, data: { name: string; capacity: number; status: string }, explicitBranchId?: string) {
  return branchMutation(explicitBranchId, '/scheduling', ({ supabase, branch_id }) =>
    supabase.from('rooms').update(data).eq('id', id).eq('branch_id', branch_id)
  );
}

export async function deleteRoom(id: string, explicitBranchId?: string) {
  return branchMutation(explicitBranchId, '/scheduling', ({ supabase, branch_id }) =>
    supabase.from('rooms').delete().eq('id', id).eq('branch_id', branch_id)
  );
}

// Bell Schedules
export async function createBellSchedule(data: { name: string; status: string }, explicitBranchId?: string) {
  return branchMutation(explicitBranchId, '/scheduling', ({ supabase, branch_id }) =>
    supabase.from('bell_schedules').insert({ ...data, branch_id })
  );
}

export async function updateBellSchedule(id: string, data: { name: string; status: string }, explicitBranchId?: string) {
  return branchMutation(explicitBranchId, '/scheduling', ({ supabase, branch_id }) =>
    supabase.from('bell_schedules').update(data).eq('id', id).eq('branch_id', branch_id)
  );
}

export async function deleteBellSchedule(id: string, explicitBranchId?: string) {
  return branchMutation(explicitBranchId, '/scheduling', ({ supabase, branch_id }) =>
    supabase.from('bell_schedules').delete().eq('id', id).eq('branch_id', branch_id)
  );
}

// Periods
export async function createPeriod(data: { bell_schedule_id: string; name: string; start_time: string; end_time: string; status: string }, explicitBranchId?: string) {
  if (data.start_time >= data.end_time) {
    return { error: "Start time must be before end time." };
  }
  return branchMutation(explicitBranchId, '/scheduling', ({ supabase, branch_id }) =>
    supabase.from('periods').insert({ ...data, branch_id })
  );
}

export async function updatePeriod(id: string, data: { name: string; start_time: string; end_time: string; status: string }, explicitBranchId?: string) {
  if (data.start_time >= data.end_time) {
    return { error: "Start time must be before end time." };
  }
  return branchMutation(explicitBranchId, '/scheduling', ({ supabase, branch_id }) =>
    supabase.from('periods').update(data).eq('id', id).eq('branch_id', branch_id)
  );
}

export async function deletePeriod(id: string, explicitBranchId?: string) {
  return branchMutation(explicitBranchId, '/scheduling', ({ supabase, branch_id }) =>
    supabase.from('periods').delete().eq('id', id).eq('branch_id', branch_id)
  );
}

export async function getBellSchedules(explicitBranchId?: string) {
  let supabase: Awaited<ReturnType<typeof getBranchContextClient>>['supabase'];
  let branch_id: string;

  try {
    const ctx = await getBranchContextClient(explicitBranchId);
    supabase = ctx.supabase;
    branch_id = ctx.branch_id;
  } catch (e) {
    return { error: (e as Error).message };
  }
  const { data, error } = await supabase.from('bell_schedules').select('id, name').eq('branch_id', branch_id);
  if (error) return { error: mapDatabaseError(error) };
  return { data };
}
