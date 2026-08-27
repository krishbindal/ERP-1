export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { verifyPageBranchContext } from '@/lib/branch-context';
import { BranchAccessError } from '../components/BranchAccessError';
import { fetchSchedulingPageData } from '../lib/page-data';
import { getInstructionalDay } from '@/lib/calendar/actions';

import { SubstitutionManager } from './components/SubstitutionManager';

export default async function SubstitutionsPage(props: Readonly<{ searchParams: Promise<{ branchId?: string; view?: string; date?: string }> }>) {
  const searchParams = await props.searchParams;
  const explicitBranchId = searchParams.branchId;
  const view = searchParams.view || 'section';
  const selectedDate = searchParams.date || ''; // Default to empty to prevent SSR timezone skew

  const { branchId, isAuthorized, isReadOnly, errorState } = await verifyPageBranchContext(explicitBranchId);

  if (errorState || !branchId || !isAuthorized) return <BranchAccessError errorState={errorState || 'ACCESS_DENIED'} />;

  const { supabase, academicYearId, entriesData, periods, rooms, teachers } = await fetchSchedulingPageData(branchId);

  // Calendar Context
  let instructionalDay = null;
  if (selectedDate) {
    const { data: calData, error: calError } = await getInstructionalDay(selectedDate, branchId, academicYearId);
    if (!calError) {
      instructionalDay = calData;
    }
  }

  // Fetch active substitutions for the selected date
  let subsData: Array<Record<string, unknown>> = [];
  if (selectedDate) {
    const { data } = await supabase
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
    subsData = data || [];
  }

  // Merge substitutions over canonical entries
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
        instructionalDay={instructionalDay}
      />
    </div>
  );
}
