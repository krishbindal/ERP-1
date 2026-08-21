"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { mapDatabaseError } from '@/lib/db-error-mapper';
import {  getContextBranchId } from '@/lib/branch-context';



// Rooms
export async function createRoom(data: { name: string; capacity: number; status: string }, explicitBranchId?: string) {
  const supabase = await createClient();
    let branch_id: string;
  try {
    branch_id = await getContextBranchId(explicitBranchId);
  } catch (e) {
    return { error: (e as Error).message };
  }
  const { error } = await supabase.from('rooms').insert({ ...data, branch_id });
  if (error) return { error: mapDatabaseError(error) };
  revalidatePath('/scheduling');
  return { success: true };
}

export async function updateRoom(id: string, data: { name: string; capacity: number; status: string }, explicitBranchId?: string) {
  const supabase = await createClient();
    try {
    await getContextBranchId(explicitBranchId);
  } catch (e) {
    return { error: (e as Error).message };
  }
  const { error } = await supabase.from('rooms').update(data).eq('id', id);
  if (error) return { error: mapDatabaseError(error) };
  revalidatePath('/scheduling');
  return { success: true };
}

export async function deleteRoom(id: string, explicitBranchId?: string) {
  const supabase = await createClient();
    try {
    await getContextBranchId(explicitBranchId);
  } catch (e) {
    return { error: (e as Error).message };
  }
  const { error } = await supabase.from('rooms').delete().eq('id', id);
  if (error) return { error: mapDatabaseError(error) };
  revalidatePath('/scheduling');
  return { success: true };
}

// Bell Schedules
export async function createBellSchedule(data: { name: string; status: string }, explicitBranchId?: string) {
  const supabase = await createClient();
    let branch_id: string;
  try {
    branch_id = await getContextBranchId(explicitBranchId);
  } catch (e) {
    return { error: (e as Error).message };
  }
  const { error } = await supabase.from('bell_schedules').insert({ ...data, branch_id });
  if (error) return { error: mapDatabaseError(error) };
  revalidatePath('/scheduling');
  return { success: true };
}

export async function updateBellSchedule(id: string, data: { name: string; status: string }, explicitBranchId?: string) {
  const supabase = await createClient();
    try {
    await getContextBranchId(explicitBranchId);
  } catch (e) {
    return { error: (e as Error).message };
  }
  const { error } = await supabase.from('bell_schedules').update(data).eq('id', id);
  if (error) return { error: mapDatabaseError(error) };
  revalidatePath('/scheduling');
  return { success: true };
}

export async function deleteBellSchedule(id: string, explicitBranchId?: string) {
  const supabase = await createClient();
    try {
    await getContextBranchId(explicitBranchId);
  } catch (e) {
    return { error: (e as Error).message };
  }
  const { error } = await supabase.from('bell_schedules').delete().eq('id', id);
  if (error) return { error: mapDatabaseError(error) };
  revalidatePath('/scheduling');
  return { success: true };
}

// Periods
export async function createPeriod(data: { bell_schedule_id: string; name: string; start_time: string; end_time: string; status: string }, explicitBranchId?: string) {
  const supabase = await createClient();
    let branch_id: string;
  try {
    branch_id = await getContextBranchId(explicitBranchId);
  } catch (e) {
    return { error: (e as Error).message };
  }
  
  if (data.start_time >= data.end_time) {
    return { error: "Start time must be before end time." };
  }

  const { error } = await supabase.from('periods').insert({ ...data, branch_id });
  if (error) return { error: mapDatabaseError(error) };
  revalidatePath('/scheduling');
  return { success: true };
}

export async function updatePeriod(id: string, data: { name: string; start_time: string; end_time: string; status: string }, explicitBranchId?: string) {
  const supabase = await createClient();
    try {
    await getContextBranchId(explicitBranchId);
  } catch (e) {
    return { error: (e as Error).message };
  }

  if (data.start_time >= data.end_time) {
    return { error: "Start time must be before end time." };
  }

  const { error } = await supabase.from('periods').update(data).eq('id', id);
  if (error) return { error: mapDatabaseError(error) };
  revalidatePath('/scheduling');
  return { success: true };
}

export async function deletePeriod(id: string, explicitBranchId?: string) {
  const supabase = await createClient();
    try {
    await getContextBranchId(explicitBranchId);
  } catch (e) {
    return { error: (e as Error).message };
  }
  const { error } = await supabase.from('periods').delete().eq('id', id);
  if (error) return { error: mapDatabaseError(error) };
  revalidatePath('/scheduling');
  return { success: true };
}

export async function getBellSchedules(explicitBranchId?: string) {
  const supabase = await createClient();
    let branch_id: string;
  try {
    branch_id = await getContextBranchId(explicitBranchId);
  } catch (e) {
    return { error: (e as Error).message };
  }
  const { data, error } = await supabase.from('bell_schedules').select('id, name').eq('branch_id', branch_id);
  if (error) return { error: mapDatabaseError(error) };
  return { data };
}

