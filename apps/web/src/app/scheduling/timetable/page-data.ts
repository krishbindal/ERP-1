import { createClient } from '@/lib/supabase/server';
import type { TimetableEntry, Period } from './components/TimetableGrid';

export interface StaffName {
  first_name: string;
  last_name: string;
}

export interface SchedulingTeacher {
  id: string;
  staff?: StaffName | StaffName[];
}

export interface SchedulingPageData {
  supabase: Awaited<ReturnType<typeof createClient>>;
  academicYearId?: string;
  entriesData: TimetableEntry[];
  periods: Period[];
  rooms: Array<{ id: string; name: string }>;
  teachers: SchedulingTeacher[];
}

export interface TimetablePageData extends SchedulingPageData {
  classes: Array<{ id: string; name: string }>;
  sections: Array<{ id: string; name: string; class_id: string }>;
  subjects: Array<{ id: string; name: string }>;
}

/**
 * Fetches the active academic year, periods, rooms, teachers, and timetable entries in parallel.
 * Replaces the sequential 5-query waterfall with 2 parallelized stages (Stage 1: independent entities,
 * Stage 2: academic-year-scoped entries).
 */
export async function fetchSchedulingPageData(branchId: string): Promise<SchedulingPageData> {
  const supabase = await createClient();

  // Wave 1: Fetch independent branch-scoped datasets concurrently
  const [activeYearRes, periodsRes, roomsRes, teachersRes] = await Promise.all([
    supabase
      .from('academic_years')
      .select('id')
      .eq('branch_id', branchId)
      .eq('status', 'ACTIVE')
      .maybeSingle(),
    supabase
      .from('periods')
      .select('*')
      .eq('branch_id', branchId)
      .eq('status', 'ACTIVE')
      .order('start_time'),
    supabase
      .from('rooms')
      .select('*')
      .eq('branch_id', branchId)
      .eq('status', 'ACTIVE')
      .order('name'),
    supabase
      .from('staff_branch_profiles')
      .select(`
        id,
        staff ( first_name, last_name )
      `)
      .eq('branch_id', branchId)
      .eq('status', 'ACTIVE'),
  ]);

  const academicYearId = activeYearRes.data?.id;

  // Wave 2: Fetch timetable entries once academic year is resolved
  let entriesData: TimetableEntry[] = [];
  if (academicYearId) {
    const { data } = await supabase
      .from('timetable_entries')
      .select(`
        *,
        classes ( name ),
        sections ( name ),
        subjects ( name ),
        periods ( name, start_time, end_time ),
        rooms ( name ),
        staff_branch_profiles (
          staff ( first_name, last_name )
        )
      `)
      .eq('branch_id', branchId)
      .eq('academic_year_id', academicYearId)
      .eq('status', 'ACTIVE');
    entriesData = (data as unknown as TimetableEntry[]) || [];
  }

  return {
    supabase,
    academicYearId,
    entriesData,
    periods: (periodsRes.data as unknown as Period[]) || [],
    rooms: (roomsRes.data as unknown as Array<{ id: string; name: string }>) || [],
    teachers: (teachersRes.data as unknown as SchedulingTeacher[]) || [],
  };
}

/**
 * Fetches all timetable page datasets with maximum query parallelization.
 * Collapses an 8-query sequential waterfall into 2 parallel waves:
 * Wave 1 (5 parallel queries): academic year, periods, rooms, teachers, subjects
 * Wave 2 (3 parallel queries): timetable entries, classes, sections (scoped to academic year)
 */
export async function fetchTimetablePageData(branchId: string): Promise<TimetablePageData> {
  const supabase = await createClient();

  // Wave 1: Fetch all queries that do NOT depend on academicYearId concurrently
  const [activeYearRes, periodsRes, roomsRes, teachersRes, subjectsRes] = await Promise.all([
    supabase
      .from('academic_years')
      .select('id')
      .eq('branch_id', branchId)
      .eq('status', 'ACTIVE')
      .maybeSingle(),
    supabase
      .from('periods')
      .select('*')
      .eq('branch_id', branchId)
      .eq('status', 'ACTIVE')
      .order('start_time'),
    supabase
      .from('rooms')
      .select('*')
      .eq('branch_id', branchId)
      .eq('status', 'ACTIVE')
      .order('name'),
    supabase
      .from('staff_branch_profiles')
      .select(`
        id,
        staff ( first_name, last_name )
      `)
      .eq('branch_id', branchId)
      .eq('status', 'ACTIVE'),
    supabase
      .from('subjects')
      .select('*')
      .eq('branch_id', branchId)
      .eq('status', 'ACTIVE')
      .order('name'),
  ]);

  const academicYearId = activeYearRes.data?.id;

  // Wave 2: Concurrently fetch all datasets that require the resolved academicYearId
  let entriesData: TimetableEntry[] = [];
  let classes: Array<{ id: string; name: string; [key: string]: unknown }> = [];
  let sections: Array<{ id: string; name: string; class_id: string; [key: string]: unknown }> = [];

  if (academicYearId) {
    const [entriesRes, classesRes, sectionsRes] = await Promise.all([
      supabase
        .from('timetable_entries')
        .select(`
          *,
          classes ( name ),
          sections ( name ),
          subjects ( name ),
          periods ( name, start_time, end_time ),
          rooms ( name ),
          staff_branch_profiles (
            staff ( first_name, last_name )
          )
        `)
        .eq('branch_id', branchId)
        .eq('academic_year_id', academicYearId)
        .eq('status', 'ACTIVE'),
      supabase
        .from('classes')
        .select('*')
        .eq('branch_id', branchId)
        .eq('academic_year_id', academicYearId)
        .order('name'),
      supabase
        .from('sections')
        .select('*')
        .eq('branch_id', branchId)
        .eq('academic_year_id', academicYearId)
        .order('name'),
    ]);

    entriesData = (entriesRes.data as unknown as TimetableEntry[]) || [];
    classes = (classesRes.data as unknown as Array<{ id: string; name: string }>) || [];
    sections = (sectionsRes.data as unknown as Array<{ id: string; name: string; class_id: string }>) || [];
  }

  return {
    supabase,
    academicYearId,
    entriesData,
    periods: (periodsRes.data as unknown as Period[]) || [],
    rooms: (roomsRes.data as unknown as Array<{ id: string; name: string }>) || [],
    teachers: (teachersRes.data as unknown as SchedulingTeacher[]) || [],
    classes,
    sections,
    subjects: (subjectsRes.data as unknown as Array<{ id: string; name: string }>) || [],
  };
}
