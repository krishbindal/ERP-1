export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { verifyPageBranchContext } from '@/lib/branch-context';
import { BranchAccessError } from '../components/BranchAccessError';
import { fetchSchedulingPageData } from '../lib/page-data';
import { getInstructionalDay } from '@/lib/calendar/actions';
import type { TimetableEntry } from '../timetable/components/TimetableGrid';

import { SubstitutionManager } from './components/SubstitutionManager';

export default async function SubstitutionsPage(props: Readonly<{ searchParams: Promise<{ branchId?: string; view?: string; date?: string }> }>) {
  const searchParams = await props.searchParams;
  const explicitBranchId = searchParams.branchId;
  const view = searchParams.view || 'section';
  const selectedDate = searchParams.date || ''; // Default to empty to prevent SSR timezone skew

  const { branchId, isAuthorized, isReadOnly, errorState } = await verifyPageBranchContext(explicitBranchId);

  if (errorState || !branchId || !isAuthorized) return <BranchAccessError errorState={errorState || 'ACCESS_DENIED'} />;

  const { supabase, academicYearId, entriesData, periods, rooms, teachers } = await fetchSchedulingPageData(branchId);

  // Calendar Context & active substitutions for the selected date (fetched concurrently)
  let instructionalDay = null;
  let subsData: Array<Record<string, unknown>> = [];

  if (selectedDate) {
    const [calResult, subsResult] = await Promise.all([
      getInstructionalDay(selectedDate, branchId, academicYearId),
      supabase
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
        .eq('status', 'ACTIVE'),
    ]);

    if (!calResult.error) {
      instructionalDay = calResult.data;
    }
    subsData = subsResult.data || [];
  }

  // Merge substitutions over canonical entries
  const effectiveEntries: TimetableEntry[] = (entriesData || []).map(entry => {
    const sub = (subsData || []).find(s => s.timetable_entry_id === entry.id);
    if (sub) {
      return {
        ...entry,
        is_substitution: true, // Custom flag to highlight substitution
        substitution_id: sub.id as string,
        staff_branch_profiles: (sub.staff_branch_profiles || entry.staff_branch_profiles) as TimetableEntry['staff_branch_profiles'],
        rooms: (sub.rooms || entry.rooms) as TimetableEntry['rooms'],
      };
    }
    return entry;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Substitutions</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            View and manage teacher and room substitutions for instructional dates.
          </p>
        </div>
        
        <form className="flex items-center gap-2 self-start sm:self-auto">
          <input type="hidden" name="branchId" value={branchId} />
          <input type="hidden" name="view" value={view} />
          <label htmlFor="date" className="text-sm font-medium text-foreground">Date:</label>
          <input id="date" 
            type="date" 
            name="date" 
            defaultValue={selectedDate} 
            className="border border-input rounded-md px-2.5 py-1.5 text-sm bg-surface text-foreground shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
          />
          <button type="submit" className="px-3 py-1.5 bg-secondary hover:bg-muted text-secondary-foreground border border-border rounded-md text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
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
