"use server";

import { branchAction } from '@/lib/server-actions';
import { CalendarEvent, CalendarEventType, resolveInstructionalDay, getInstructionalDaysForRange } from './resolver';
import { SupabaseClient } from '@supabase/supabase-js';

const TABLE_CALENDAR_EVENTS = 'calendar_events';
const COL_BRANCH_ID = 'branch_id';
const COL_ACADEMIC_YEAR_ID = 'academic_year_id';
const STATUS_ACTIVE = 'ACTIVE';
const ROUTE_CALENDAR = '/academic-structure/calendar';

// ============================================================================
// READ OPERATIONS
// ============================================================================

export async function getCalendarEvents(explicitBranchId?: string, activeOnly = true, explicitAcademicYearId?: string) {
  return branchAction(explicitBranchId, async (ctx) => {
    const academic_year_id = explicitAcademicYearId; if (!academic_year_id) { throw new Error('academicYearId is required'); }
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

async function fetchCalendarContext(
  supabase: SupabaseClient,
  branchId: string,
  startStr: string,
  endStr: string,
  explicitAcademicYearId?: string
) {
  const academic_year_id = await resolveAcademicYearId(supabase, branchId, explicitAcademicYearId);
  
  // Fetch academic year operating days
  const { data: yearData, error: yearError } = await supabase
    .from('academic_years')
    .select('operating_days')
    .eq('id', academic_year_id)
    .eq(COL_BRANCH_ID, branchId)
    .single();
    
  if (yearError) return { error: yearError, data: null };
  
  // Fetch active events overlapping this range
  const { data: events, error: eventsError } = await supabase
    .from(TABLE_CALENDAR_EVENTS)
    .select('*')
    .eq(COL_BRANCH_ID, branchId)
    .eq(COL_ACADEMIC_YEAR_ID, academic_year_id)
    .eq('status', STATUS_ACTIVE)
    .lte('start_date', endStr)
    .gte('end_date', startStr);
    
  if (eventsError) return { error: eventsError, data: null };
  
  return { 
    error: null, 
    data: { 
      operating_days: yearData.operating_days, 
      events: events as CalendarEvent[] 
    } 
  };
}

export async function getInstructionalDay(dateStr: string, explicitBranchId?: string, explicitAcademicYearId?: string) {
  return branchAction(explicitBranchId, async (ctx) => {
    const { data, error } = await fetchCalendarContext(ctx.supabase, ctx.branchId, dateStr, dateStr, explicitAcademicYearId);
    if (error) return { error };
    
    const result = resolveInstructionalDay(dateStr, data.operating_days, data.events);
    return { error: null, data: result };
  });
}

export async function getInstructionalDaysForRangeAction(startStr: string, endStr: string, explicitBranchId?: string, explicitAcademicYearId?: string) {
  return branchAction(explicitBranchId, async (ctx) => {
    const { data, error } = await fetchCalendarContext(ctx.supabase, ctx.branchId, startStr, endStr, explicitAcademicYearId);
    if (error) return { error };
    
    const result = getInstructionalDaysForRange(startStr, endStr, data.operating_days, data.events);
    return { error: null, data: result };
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

// CalendarEventType is imported from ./resolver (single source of truth)

const VALID_EVENT_TYPES: CalendarEventType[] = ['HOLIDAY', 'CLOSURE', 'MAKEUP_DAY', 'OTHER'];

export type CreateCalendarEventInput = {
  name: string;
  start_date: string;
  end_date: string;
  type: CalendarEventType;
  is_instructional: boolean;
};

export type UpdateCalendarEventInput = Partial<CreateCalendarEventInput>;

/**
 * Validates a complete event state (not a partial fragment).
 * For creates, pass the full input.
 * For updates, pass the merged result of existing + patch.
 */
function validateEventState(data: CreateCalendarEventInput) {
  if (!data.name || data.name.trim().length === 0) {
    throw new Error('Event name is required.');
  }

  if (!data.start_date || !data.end_date) {
    throw new Error('Start date and end date are required.');
  }

  if (data.start_date > data.end_date) {
    throw new Error('Start date must be before or equal to end date.');
  }

  if (!VALID_EVENT_TYPES.includes(data.type)) {
    throw new Error('Invalid event type.');
  }

  if ((data.type === 'HOLIDAY' || data.type === 'CLOSURE') && data.is_instructional === true) {
    throw new Error(`${data.type} cannot be an instructional day.`);
  }
  if (data.type === 'MAKEUP_DAY' && data.is_instructional === false) {
    throw new Error('MAKEUP_DAY must be an instructional day.');
  }
}

/**
 * Resolves and verifies that an academic year ID belongs to the given branch.
 * Returns the verified academic year ID.
 */
async function resolveAcademicYearId(
  supabase: SupabaseClient,
  branchId: string,
  explicitAcademicYearId?: string
): Promise<string> {
  if (!explicitAcademicYearId) { throw new Error('academicYearId is required'); }

  // Verify the explicit ID belongs to this branch
  const { data, error } = await supabase
    .from('academic_years')
    .select('id')
    .eq('id', explicitAcademicYearId)
    .eq('branch_id', branchId)
    .single();

  if (error || !data) {
    throw new Error('Academic year not found or does not belong to this branch.');
  }

  return explicitAcademicYearId;
}

export async function createCalendarEvent(
  data: CreateCalendarEventInput, 
  explicitBranchId?: string,
  explicitAcademicYearId?: string
) {
  return branchAction(explicitBranchId, async (ctx) => {
    validateEventState(data);
    const academic_year_id = await resolveAcademicYearId(ctx.supabase, ctx.branchId, explicitAcademicYearId);
    
    return ctx.supabase
      .from(TABLE_CALENDAR_EVENTS)
      .insert({
        ...data,
        branch_id: ctx.branchId,
        academic_year_id
      });
  }, ROUTE_CALENDAR);
}

export async function updateCalendarEvent(
  id: string,
  data: UpdateCalendarEventInput,
  explicitBranchId?: string
) {
  return branchAction(explicitBranchId, async (ctx) => {
    // Fetch the current record to validate the merged result
    const { data: existing, error: fetchError } = await ctx.supabase
      .from(TABLE_CALENDAR_EVENTS)
      .select('name, start_date, end_date, type, is_instructional')
      .eq('id', id)
      .eq(COL_BRANCH_ID, ctx.branchId)
      .single();

    if (fetchError || !existing) {
      return { error: fetchError || new Error('Event not found.') };
    }

    // Merge patch onto existing record and validate the final state
    const merged: CreateCalendarEventInput = {
      name: data.name ?? existing.name,
      start_date: data.start_date ?? existing.start_date,
      end_date: data.end_date ?? existing.end_date,
      type: data.type ?? existing.type,
      is_instructional: data.is_instructional ?? existing.is_instructional,
    };
    validateEventState(merged);

    return ctx.supabase
      .from(TABLE_CALENDAR_EVENTS)
      .update(data)
      .eq('id', id)
      .eq(COL_BRANCH_ID, ctx.branchId);
  }, ROUTE_CALENDAR);
}

export async function archiveCalendarEvent(id: string, explicitBranchId?: string) {
  return branchAction(explicitBranchId, async (ctx) => {
    return ctx.supabase
      .from(TABLE_CALENDAR_EVENTS)
      .update({ status: 'ARCHIVED' })
      .eq('id', id)
      .eq(COL_BRANCH_ID, ctx.branchId);
  }, ROUTE_CALENDAR);
}

const VALID_OPERATING_DAYS = [1, 2, 3, 4, 5, 6, 7];

export async function updateOperatingDays(operatingDays: number[], explicitBranchId?: string, explicitAcademicYearId?: string) {
  return branchAction(explicitBranchId, async (ctx) => {
    // Input validation
    if (!Array.isArray(operatingDays) || operatingDays.length === 0) {
      throw new Error('At least one operating day must be selected.');
    }
    if (!operatingDays.every(d => VALID_OPERATING_DAYS.includes(d))) {
      throw new Error('Invalid operating day values. Must be integers 1-7.');
    }

    const academic_year_id = await resolveAcademicYearId(ctx.supabase, ctx.branchId, explicitAcademicYearId);
    
    return ctx.supabase
      .from('academic_years')
      .update({ operating_days: operatingDays })
      .eq('id', academic_year_id)
      .eq(COL_BRANCH_ID, ctx.branchId);
  }, ROUTE_CALENDAR);
}



