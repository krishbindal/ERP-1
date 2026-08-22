"use server";

import { branchAction } from '@/lib/server-actions';
import { getActiveAcademicYearId } from '@/app/scheduling/lib/scheduling-context';
import { CalendarEvent, resolveInstructionalDay, getInstructionalDaysForRange } from './resolver';

const TABLE_CALENDAR_EVENTS = 'calendar_events';
const COL_BRANCH_ID = 'branch_id';
const COL_ACADEMIC_YEAR_ID = 'academic_year_id';
const STATUS_ACTIVE = 'ACTIVE';
const ROUTE_ACADEMIC_STRUCTURE = '/academic-structure';

// ============================================================================
// READ OPERATIONS
// ============================================================================

export async function getCalendarEvents(explicitBranchId?: string, activeOnly = true) {
  return branchAction(explicitBranchId, async (ctx) => {
    const academic_year_id = await getActiveAcademicYearId(ctx.supabase, ctx.branchId);
    let query = ctx.supabase
      .from(TABLE_CALENDAR_EVENTS)
      .select('*')
      .eq(COL_BRANCH_ID, ctx.branchId)
      .eq(COL_ACADEMIC_YEAR_ID, academic_year_id);
      
    if (activeOnly) {
      query = query.eq('status', STATUS_ACTIVE);
    }
    
    const { data, error } = await query.order('start_date', { ascending: true });
    
    if (error) return { error };
    return { error: null, data: data as CalendarEvent[] };
  });
}

export async function getCalendarEvent(id: string, explicitBranchId?: string) {
  return branchAction(explicitBranchId, async (ctx) => {
    const { data, error } = await ctx.supabase
      .from(TABLE_CALENDAR_EVENTS)
      .select('*')
      .eq('id', id)
      .eq(COL_BRANCH_ID, ctx.branchId)
      .single();
      
    if (error) return { error };
    return { error: null, data: data as CalendarEvent };
  });
}

export async function getInstructionalDay(dateStr: string, explicitBranchId?: string) {
  return branchAction(explicitBranchId, async (ctx) => {
    const academic_year_id = await getActiveAcademicYearId(ctx.supabase, ctx.branchId);
    
    // Fetch academic year operating days
    const { data: yearData, error: yearError } = await ctx.supabase
      .from('academic_years')
      .select('operating_days')
      .eq('id', academic_year_id)
      .eq(COL_BRANCH_ID, ctx.branchId)
      .single();
      
    if (yearError) return { error: yearError };
    
    // Fetch active events overlapping this date
    const { data: events, error: eventsError } = await ctx.supabase
      .from(TABLE_CALENDAR_EVENTS)
      .select('*')
      .eq(COL_BRANCH_ID, ctx.branchId)
      .eq(COL_ACADEMIC_YEAR_ID, academic_year_id)
      .eq('status', STATUS_ACTIVE)
      .lte('start_date', dateStr)
      .gte('end_date', dateStr);
      
    if (eventsError) return { error: eventsError };
    
    const result = resolveInstructionalDay(dateStr, yearData.operating_days, events as CalendarEvent[]);
    return { error: null, data: result };
  });
}

export async function getInstructionalDaysForRangeAction(startStr: string, endStr: string, explicitBranchId?: string) {
  return branchAction(explicitBranchId, async (ctx) => {
    const academic_year_id = await getActiveAcademicYearId(ctx.supabase, ctx.branchId);
    
    const { data: yearData, error: yearError } = await ctx.supabase
      .from('academic_years')
      .select('operating_days')
      .eq('id', academic_year_id)
      .eq(COL_BRANCH_ID, ctx.branchId)
      .single();
      
    if (yearError) return { error: yearError };
    
    // Fetch active events overlapping this range
    const { data: events, error: eventsError } = await ctx.supabase
      .from(TABLE_CALENDAR_EVENTS)
      .select('*')
      .eq(COL_BRANCH_ID, ctx.branchId)
      .eq(COL_ACADEMIC_YEAR_ID, academic_year_id)
      .eq('status', STATUS_ACTIVE)
      .lte('start_date', endStr)
      .gte('end_date', startStr);
      
    if (eventsError) return { error: eventsError };
    
    const result = getInstructionalDaysForRange(startStr, endStr, yearData.operating_days, events as CalendarEvent[]);
    return { error: null, data: result };
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

export async function createCalendarEvent(
  data: Omit<CalendarEvent, 'id'>, 
  explicitBranchId?: string
) {
  return branchAction(explicitBranchId, async (ctx) => {
    const academic_year_id = await getActiveAcademicYearId(ctx.supabase, ctx.branchId);
    
    return ctx.supabase
      .from(TABLE_CALENDAR_EVENTS)
      .insert({
        ...data,
        branch_id: ctx.branchId,
        academic_year_id
      });
  }, ROUTE_ACADEMIC_STRUCTURE); // Arbitrary existing placeholder route
}

export async function updateCalendarEvent(
  id: string,
  data: Partial<Omit<CalendarEvent, 'id'>>,
  explicitBranchId?: string
) {
  return branchAction(explicitBranchId, async (ctx) => {
    return ctx.supabase
      .from(TABLE_CALENDAR_EVENTS)
      .update(data)
      .eq('id', id)
      .eq(COL_BRANCH_ID, ctx.branchId);
  }, ROUTE_ACADEMIC_STRUCTURE);
}

export async function archiveCalendarEvent(id: string, explicitBranchId?: string) {
  return branchAction(explicitBranchId, async (ctx) => {
    return ctx.supabase
      .from(TABLE_CALENDAR_EVENTS)
      .update({ status: 'ARCHIVED' })
      .eq('id', id)
      .eq(COL_BRANCH_ID, ctx.branchId);
  }, ROUTE_ACADEMIC_STRUCTURE);
}
