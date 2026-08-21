import { RoomsTable } from './components/RoomsTable';
import { BellSchedulesTable } from './components/BellSchedulesTable';
import { PeriodsTable } from './components/PeriodsTable';
import { createClient } from '@/lib/supabase/server';
import {  verifyPageBranchContext } from '@/lib/branch-context';
import { Room, BellSchedule, Period } from './components/types';

export default async function SchedulingPage(props: { searchParams: Promise<{ tab?: string; branchId?: string }> }) {
  const searchParams = await props.searchParams;
  const tab = searchParams.tab || 'rooms';
  const explicitBranchId = searchParams.branchId;

  const supabase = await createClient();
  
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

  let rooms: Room[] = [];
  let schedules: BellSchedule[] = [];
  let periods: Period[] = [];

  if (tab === 'rooms') {
    const { data, error } = await supabase.from('rooms').select('*').eq('branch_id', branchId).order('name', { ascending: true });
    if (error) throw new Error(error.message);
    rooms = (data as Room[]) || [];
  } else if (tab === 'schedules') {
    const { data, error } = await supabase.from('bell_schedules').select('*').eq('branch_id', branchId).order('name', { ascending: true });
    if (error) throw new Error(error.message);
    schedules = (data as BellSchedule[]) || [];
  } else if (tab === 'periods') {
    const { data, error } = await supabase.from('periods').select('*, bell_schedules(name)').eq('branch_id', branchId).order('start_time', { ascending: true });
    if (error) throw new Error(error.message);
    periods = (data as Period[]) || [];

    if (!isReadOnly) {
      const { data: schedData, error: schedError } = await supabase.from('bell_schedules').select('*').eq('branch_id', branchId).order('name', { ascending: true });
      if (schedError) throw new Error(schedError.message);
      schedules = (schedData as BellSchedule[]) || [];
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Scheduling</h1>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <a href={`?tab=rooms${explicitBranchId ? '&branchId=' + explicitBranchId : ''}`} className={`${tab === 'rooms' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Rooms</a>
          <a href={`?tab=schedules${explicitBranchId ? '&branchId=' + explicitBranchId : ''}`} className={`${tab === 'schedules' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Bell Schedules</a>
          <a href={`?tab=periods${explicitBranchId ? '&branchId=' + explicitBranchId : ''}`} className={`${tab === 'periods' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Periods</a>
        </nav>
      </div>
      <div>
        {tab === 'rooms' && <RoomsTable data={rooms} isReadOnly={isReadOnly} explicitBranchId={branchId} />}
        {tab === 'schedules' && <BellSchedulesTable data={schedules} isReadOnly={isReadOnly} explicitBranchId={branchId} />}
        {tab === 'periods' && <PeriodsTable data={periods} schedules={schedules} isReadOnly={isReadOnly} explicitBranchId={branchId} />}
      </div>
    </div>
  );
}


