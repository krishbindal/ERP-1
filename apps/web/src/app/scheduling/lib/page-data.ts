import { createClient } from '@/lib/supabase/server';

/**
 * Fetches the active academic year and canonical timetable entries for a branch.
 * Shared between timetable/page.tsx and substitutions/page.tsx.
 */
export async function fetchSchedulingPageData(branchId: string) {
  const supabase = await createClient();

  const { data: activeYear } = await supabase
    .from('academic_years')
    .select('id')
    .eq('branch_id', branchId)
    .eq('status', 'ACTIVE')
    .single();

  const academicYearId = activeYear?.id;

  const { data: entriesData } = await supabase
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

  const { data: periods } = await supabase.from('periods').select('*').eq('branch_id', branchId).eq('status', 'ACTIVE').order('start_time');
  const { data: rooms } = await supabase.from('rooms').select('*').eq('branch_id', branchId).eq('status', 'ACTIVE').order('name');
  const { data: teachers } = await supabase
    .from('staff_branch_profiles')
    .select(`
      id,
      staff ( first_name, last_name )
    `)
    .eq('branch_id', branchId)
    .eq('status', 'ACTIVE');

  return { supabase, academicYearId, entriesData, periods, rooms, teachers };
}
