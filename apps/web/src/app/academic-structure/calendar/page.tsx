import { createClient } from '@/lib/supabase/server';
import { verifyPageBranchContext } from '@/lib/branch-context';
import { AcademicStructureNav } from '../components/AcademicStructureNav';
import { OperatingDaysEditor } from './components/OperatingDaysEditor';
import { CalendarEventsTable } from './components/CalendarEventsTable';
import { getCalendarEvents } from '@/lib/calendar/actions';
import { getActiveAcademicYearId } from '@/app/scheduling/lib/scheduling-context';

export default async function CalendarPage(props: { searchParams: Promise<{ branchId?: string }> }) {
  const searchParams = await props.searchParams;
  const explicitBranchId = searchParams.branchId;

  const supabase = await createClient();
  
  const { branchId, isAuthorized, isReadOnly, errorState } = await verifyPageBranchContext(explicitBranchId);

  if (errorState === 'NO_CONTEXT') return <div className="text-gray-500">No context available.</div>;
  if (errorState === 'NO_BRANCH_SELECTED') return <div className="text-gray-500">Please select a branch to view its academic structure.</div>;
  if (errorState === 'ACCESS_DENIED' || !branchId || !isAuthorized) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">You do not have permission to view this branch&apos;s academic structure.</p>
        </div>
      </div>
    );
  }

  // Fetch active academic year
  const activeYearId = await getActiveAcademicYearId(supabase, branchId);
  
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
  const { data: events, error: eventsError } = await getCalendarEvents(branchId, true);
  
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
        />
        
        <CalendarEventsTable 
          events={events || []} 
          isReadOnly={isReadOnly} 
          explicitBranchId={branchId}
        />
      </div>
    </div>
  );
}
