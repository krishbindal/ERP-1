import { createClient } from '@/lib/supabase/server';
import { verifyPageBranchContext } from '@/lib/branch-context';
import { BranchAccessError } from '@/components/BranchAccessError';
import { AcademicStructureNav } from '../components/AcademicStructureNav';
import { OperatingDaysEditor } from './components/OperatingDaysEditor';
import { CalendarEventsTable } from './components/CalendarEventsTable';
import { getCalendarEvents } from '@/lib/calendar/actions';
import { AcademicSessionSelector } from '@/components/AcademicSessionSelector';

export default async function CalendarPage(props: { searchParams: Promise<{ branchId?: string; session?: string }> }) {
  const searchParams = await props.searchParams;
  const explicitBranchId = searchParams.branchId;
  const sessionId = searchParams.session;

  const supabase = await createClient();
  
  const { branchId, isAuthorized, isReadOnly, errorState } = await verifyPageBranchContext(explicitBranchId);

  if (errorState !== null && !branchId) {
    return <BranchAccessError errorState={errorState} feature="academic structure" />;
  }
  
  if (!isAuthorized || !branchId) {
    return <BranchAccessError errorState="ACCESS_DENIED" feature="academic structure" />;
  }

  // Fetch all years for the selector
  const { data: years } = await supabase
    .from('academic_years')
    .select('*')
    .eq('branch_id', branchId)
    .order('start_date', { ascending: false });

  let yearData = null;
  let events: { id: string; name: string; type: string; start_date: string; end_date: string; is_instructional?: boolean; status?: string }[] = [];

  if (sessionId) {
    const { data: yr, error: yearError } = await supabase
      .from('academic_years')
      .select('operating_days')
      .eq('id', sessionId)
      .eq('branch_id', branchId)
      .single();

    if (yearError) {
      throw new Error('Failed to load active academic year context.');
    }
    yearData = yr;

    const { data: evts, error: eventsError } = await getCalendarEvents(branchId, true, sessionId);
    if (eventsError) {
      throw new Error('Failed to load calendar events.');
    }
    events = evts || [];
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Academic Structure</h1>
        <AcademicSessionSelector years={years || []} currentSessionId={sessionId} branchId={branchId} />
      </div>
      
      <AcademicStructureNav currentTab="calendar" explicitBranchId={explicitBranchId} />
      
      {!sessionId ? (
        <div className="p-12 text-center text-gray-500 bg-gray-50 rounded border border-gray-200">
          Please select an Academic Session above to view the calendar.
        </div>
      ) : (
        <div className="space-y-6">
          <OperatingDaysEditor 
            initialDays={yearData?.operating_days || []} 
            isReadOnly={isReadOnly} 
            explicitBranchId={branchId}
            explicitAcademicYearId={sessionId}
          />
          
          <CalendarEventsTable 
            // @ts-expect-error Type mismatch
        events={events} 
            isReadOnly={isReadOnly} 
            explicitBranchId={branchId}
            explicitAcademicYearId={sessionId}
          />
        </div>
      )}
    </div>
  );
}








