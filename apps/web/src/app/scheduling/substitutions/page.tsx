export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { verifyPageBranchContext } from '@/lib/branch-context';
import { BranchAccessError } from '../components/BranchAccessError';
import { fetchSchedulingPageData } from '../timetable/page-data';
import { getInstructionalDay } from '@/lib/calendar/actions';
import type { TimetableEntry } from '../timetable/components/TimetableGrid';
import { SubstitutionManager } from './components/SubstitutionManager';
import { AcademicSessionSelector } from '@/components/AcademicSessionSelector';
import { createClient } from '@/lib/supabase/server';

export default async function SubstitutionsPage(props: Readonly<{ searchParams: Promise<{ branchId?: string; view?: string; date?: string; session?: string }> }>) {
  const searchParams = await props.searchParams;
  const explicitBranchId = searchParams.branchId;
  const view = searchParams.view || 'section';
  
  const selectedDate = searchParams.date || ''; // Default to empty to prevent SSR timezone skew
  let sessionId = searchParams.session || '';

  const { branchId, isAuthorized, isReadOnly, errorState } = await verifyPageBranchContext(explicitBranchId);

  if (errorState || !branchId || !isAuthorized) return <BranchAccessError errorState={errorState || 'ACCESS_DENIED'} />;

  const supabase = await createClient();
  const { data: years, error: yrErr } = await supabase
    .from('academic_years')
    .select('*')
    .eq('branch_id', branchId)
    .order('start_date', { ascending: false });

  if (yrErr) throw new Error(yrErr.message);

  if (!sessionId && years && years.length > 0) {
    sessionId = years[0].id;
  }

  let entriesData: import('../timetable/components/TimetableGrid').TimetableEntry[] = [];
  let periods: { id: string; name?: string; start_time?: string; end_time?: string; bell_schedule_id?: string; status?: string }[] = [];
  let rooms: { id: string; name?: string; capacity?: number | null; status?: string }[] = [];
  let teachers: { id: string; staff?: { first_name: string; last_name: string } | { first_name: string; last_name: string }[] | undefined }[] = [];

  let instructionalDay = null;
  let subsData: Array<Record<string, unknown>> = [];

  if (sessionId) {
    const schedulingData = await fetchSchedulingPageData(branchId, sessionId);
    entriesData = schedulingData.entriesData;
    periods = schedulingData.periods;
    rooms = schedulingData.rooms;
    teachers = schedulingData.teachers;

    if (selectedDate) {
      const [calResult, subsResult] = await Promise.all([
        getInstructionalDay(selectedDate, branchId, sessionId),
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
          .eq('academic_year_id', sessionId)
          .eq('substitution_date', selectedDate)
          .eq('status', 'ACTIVE'),
      ]);

      if (!calResult.error) {
        instructionalDay = calResult.data;
      }
      subsData = subsResult.data || [];
    }
  }

  // Merge substitutions over canonical entries
  const effectiveEntries: TimetableEntry[] = (entriesData || []).map((entry: TimetableEntry) => {
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
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Substitutions</h1>
        <AcademicSessionSelector years={years || []} currentSessionId={sessionId} branchId={branchId} />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <p className="text-sm text-muted-foreground mt-0.5">
            View and manage teacher and room substitutions for instructional dates.
          </p>
        </div>
        
        <form className="flex items-center gap-2 self-start sm:self-auto">
          {explicitBranchId && <input type="hidden" name="branchId" value={explicitBranchId} />}
          <input type="hidden" name="view" value={view} />
          {sessionId && <input type="hidden" name="session" value={sessionId} />}
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

      {!sessionId ? (
        <div className="p-12 text-center text-gray-500 bg-gray-50 rounded border border-gray-200">
          Please select an Academic Session above to manage substitutions.
        </div>
      ) : (
        <SubstitutionManager
          branchId={branchId}
          entries={effectiveEntries}
          // @ts-expect-error Type mismatch
          periods={periods || []}
          // @ts-expect-error Type mismatch
          rooms={rooms || []}
          canonicalEntries={entriesData || []}
          teachers={teachers || []}
          selectedDate={selectedDate}
          isReadOnly={isReadOnly}
          instructionalDay={instructionalDay}
        />
      )}
    </div>
  );
}












