import { verifyPageBranchContext } from '@/lib/branch-context';
import { createClient } from '@/lib/supabase/server';
import { TimetableManager } from './components/TimetableManager';

export default async function TimetablePage(props: { searchParams: Promise<{ branchId?: string; view?: string }> }) {
  const searchParams = await props.searchParams;
  const explicitBranchId = searchParams.branchId;
  const view = searchParams.view || 'section';

  const { branchId, isAuthorized, isReadOnly, errorState } = await verifyPageBranchContext(explicitBranchId);

  if (errorState === 'NO_CONTEXT') return <div className="text-gray-500">No context available.</div>;
  if (errorState === 'NO_BRANCH_SELECTED') return <div className="text-gray-500">Please select a branch to view its scheduling structure.</div>;
  if (errorState === 'ACCESS_DENIED' || !branchId || !isAuthorized) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">You do not have permission to view this branch&apos;s scheduling structure.</p>
        </div>
      </div>
    );
  }

  const supabase = await createClient();

  const { data: activeYear } = await supabase
    .from('academic_years')
    .select('id')
    .eq('branch_id', branchId)
    .eq('status', 'ACTIVE')
    .single();

  const academicYearId = activeYear?.id;

  // Fetch all canonical timetable entries for the branch & academic year
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

  // We need to fetch necessary lookups for the form
  const { data: periods } = await supabase.from('periods').select('*').eq('branch_id', branchId).eq('status', 'ACTIVE').order('start_time');
  const { data: rooms } = await supabase.from('rooms').select('*').eq('branch_id', branchId).eq('status', 'ACTIVE').order('name');
  const { data: classes } = await supabase.from('classes').select('*').eq('branch_id', branchId).eq('academic_year_id', academicYearId).order('name');
  const { data: sections } = await supabase.from('sections').select('*').eq('branch_id', branchId).eq('academic_year_id', academicYearId).order('name');
  const { data: subjects } = await supabase.from('subjects').select('*').eq('branch_id', branchId).eq('status', 'ACTIVE').order('name');
  const { data: teachers } = await supabase
    .from('staff_branch_profiles')
    .select(`
      id,
      staff ( first_name, last_name )
    `)
    .eq('branch_id', branchId)
    .eq('status', 'ACTIVE');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Timetable</h1>
        
        <form className="flex items-center gap-2">
          <input type="hidden" name="branchId" value={branchId} />
          <label htmlFor="view" className="text-sm font-medium text-gray-700">View:</label>
          <select id="view" name="view" defaultValue={view} className="border border-gray-300 rounded-md p-2 text-sm">
            <option value="section">By Section</option>
            <option value="teacher">By Teacher</option>
            <option value="room">By Room</option>
          </select>
          <button type="submit" className="px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200 text-sm">
            Apply
          </button>
        </form>
      </div>

      <TimetableManager
        branchId={branchId}
        entries={entriesData || []}
        periods={periods || []}
        rooms={rooms || []}
        classes={classes || []}
        sections={sections || []}
        subjects={subjects || []}
        teachers={teachers || []}
        isReadOnly={isReadOnly}
      />
    </div>
  );
}
