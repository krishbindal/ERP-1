import { createClient } from '@/lib/supabase/server';
import { verifyPageBranchContext } from '@/lib/branch-context';
import { BranchAccessError } from '@/components/BranchAccessError';
import { AcademicStructureNav } from '../components/AcademicStructureNav';
import { OperatingDaysEditor } from './components/OperatingDaysEditor';
import { CalendarEventsTable } from './components/CalendarEventsTable';
import { getCalendarEvents } from '@/lib/calendar/actions';
import { getActiveAcademicYearId } from '@/app/scheduling/lib/scheduling-context';

export default async function CalendarPage(props: { searchParams: Promise<{ branchId?: string; academicYearId?: string }> }) {
  const searchParams = await props.searchParams;
  const explicitBranchId = searchParams.branchId;
  const explicitAcademicYearId = searchParams.academicYearId;

  const supabase = await createClient();
  
  const { branchId, isAuthorized, isReadOnly, errorState } = await verifyPageBranchContext(explicitBranchId);

  if (errorState !== null && !branchId) {
    return <BranchAccessError errorState={errorState} feature="academic structure" />;
  }
  
  if (!isAuthorized || !branchId) {
    return <BranchAccessError errorState="ACCESS_DENIED" feature="academic structure" />;
  }

  // Fetch active academic year if not provided
  const activeYearId = explicitAcademicYearId || await getActiveAcademicYearId(supabase, branchId);
  
  const { data: yearData, error: yearError } = await supabase
    .from('academic_years')
    .select('operating_days')
    .eq('id', activeYearId)
    .eq('branch_id', branchId)
    .single();

  if (yearError) {
    throw new Error('Failed to load active academic year context.');
  }

  // Fetch calendar events
  const { data: events, error: eventsError } = await getCalendarEvents(branchId, true, explicitAcademicYearId);
  
  if (eventsError) {
    throw new Error('Failed to load calendar events.');
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Academic Structure</h1>
      <AcademicStructureNav currentTab="calendar" explicitBranchId={explicitBranchId} />
      
      <div className="space-y-6">
        <OperatingDaysEditor 
          initialDays={yearData.operating_days || []} 
          isReadOnly={isReadOnly} 
          explicitBranchId={branchId}
          explicitAcademicYearId={explicitAcademicYearId}
        />
        
        <CalendarEventsTable 
          events={events || []} 
          isReadOnly={isReadOnly} 
          explicitBranchId={branchId}
          explicitAcademicYearId={explicitAcademicYearId}
        />
      </div>
    </div>
  );
}
