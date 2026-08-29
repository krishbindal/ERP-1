"use server";

import { branchAction } from '@/lib/server-actions';

// Rooms
export async function createRoom(data: { name: string; capacity: number; status: string }, explicitBranchId?: string) {
  return branchAction(explicitBranchId, async (ctx) => {
    return ctx.supabase.from('rooms').insert({ ...data, branch_id: ctx.branchId });
  }, '/scheduling');
}

export async function updateRoom(id: string, data: { name: string; capacity: number; status: string }, explicitBranchId?: string) {
  return branchAction(explicitBranchId, async (ctx) => {
    return ctx.supabase.from('rooms').update(data).eq('id', id).eq('branch_id', ctx.branchId);
  }, '/scheduling');
}

export async function deleteRoom(id: string, explicitBranchId?: string) {
  return branchAction(explicitBranchId, async (ctx) => {
    return ctx.supabase.from('rooms').delete().eq('id', id).eq('branch_id', ctx.branchId);
  }, '/scheduling');
}

// Bell Schedules
export async function createBellSchedule(data: { name: string; status: string }, explicitBranchId?: string) {
  return branchAction(explicitBranchId, async (ctx) => {
    return ctx.supabase.from('bell_schedules').insert({ ...data, branch_id: ctx.branchId });
  }, '/scheduling');
}

export async function updateBellSchedule(id: string, data: { name: string; status: string }, explicitBranchId?: string) {
  return branchAction(explicitBranchId, async (ctx) => {
    return ctx.supabase.from('bell_schedules').update(data).eq('id', id).eq('branch_id', ctx.branchId);
  }, '/scheduling');
}

export async function deleteBellSchedule(id: string, explicitBranchId?: string) {
  return branchAction(explicitBranchId, async (ctx) => {
    return ctx.supabase.from('bell_schedules').delete().eq('id', id).eq('branch_id', ctx.branchId);
  }, '/scheduling');
}

// Periods
export async function createPeriod(data: { bell_schedule_id: string; name: string; start_time: string; end_time: string; status: string }, explicitBranchId?: string) {
  if (data.start_time >= data.end_time) {
    return { error: "Start time must be before end time." };
  }
  return branchAction(explicitBranchId, async (ctx) => {
    return ctx.supabase.from('periods').insert({ ...data, branch_id: ctx.branchId });
  }, '/scheduling');
}

export async function updatePeriod(id: string, data: { name: string; start_time: string; end_time: string; status: string }, explicitBranchId?: string) {
  if (data.start_time >= data.end_time) {
    return { error: "Start time must be before end time." };
  }
  return branchAction(explicitBranchId, async (ctx) => {
    return ctx.supabase.from('periods').update(data).eq('id', id).eq('branch_id', ctx.branchId);
  }, '/scheduling');
}

export async function deletePeriod(id: string, explicitBranchId?: string) {
  return branchAction(explicitBranchId, async (ctx) => {
    return ctx.supabase.from('periods').delete().eq('id', id).eq('branch_id', ctx.branchId);
  }, '/scheduling');
}

export async function getBellSchedules(explicitBranchId?: string) {
  return branchAction(explicitBranchId, async (ctx) => {
    return ctx.supabase.from('bell_schedules').select('id, name').eq('branch_id', ctx.branchId);
  });
}
