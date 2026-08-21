import { verifyPageBranchContext } from '@/lib/branch-context';
import { createClient } from '@/lib/supabase/server';
import { SubstitutionManager } from './components/SubstitutionManager';

export default async function SubstitutionsPage(props: { searchParams: Promise<{ branchId?: string; view?: string; date?: string }> }) {
  const searchParams = await props.searchParams;
  const explicitBranchId = searchParams.branchId;
  const view = searchParams.view || 'section';
  const selectedDate = searchParams.date || new Date().toISOString().split('T')[0]; // Default to today

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

  // 1. Fetch canonical timetable entries
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

  // 2. Fetch active substitutions for the selected date
  const { data: subsData } = await supabase
    .from('timetable_substitutions')
    .select(`
      *,
      staff_branch_profiles!fk_substitution_teacher (
        staff ( first_name, last_name )
      ),
      rooms!fk_substitution_room ( name )
    `)
    .eq('branch_id', branchId)
    .eq('academic_year_id', academicYearId)
    .eq('substitution_date', selectedDate)
    .eq('status', 'ACTIVE');

  // 3. Merge substitutions over canonical entries
  const effectiveEntries = (entriesData || []).map(entry => {
    const sub = (subsData || []).find(s => s.timetable_entry_id === entry.id);
    if (sub) {
      return {
        ...entry,
        is_substitution: true, // Custom flag to maybe highlight it
        substitution_id: sub.id,
        staff_branch_profiles: sub.staff_branch_profiles || entry.staff_branch_profiles,
        rooms: sub.rooms || entry.rooms,
      };
    }
    return entry;
  });

  // Data for the form
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Substitutions</h1>
        
        <form className="flex items-center gap-2">
          <input type="hidden" name="branchId" value={branchId} />
          <input type="hidden" name="view" value={view} />
          <label htmlFor="date" className="text-sm font-medium text-gray-700">Date:</label>
          <input id="date" 
            type="date" 
            name="date" 
            defaultValue={selectedDate} 
            className="border border-gray-300 rounded-md p-2 text-sm" 
          />
          <button type="submit" className="px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200 text-sm">
            View
          </button>
        </form>
      </div>

      <SubstitutionManager
        branchId={branchId}
        entries={effectiveEntries}
        periods={periods || []}
        rooms={rooms || []}
        canonicalEntries={entriesData || []}
        teachers={teachers || []}
        selectedDate={selectedDate}
        isReadOnly={isReadOnly}
      />
    </div>
  );
}
