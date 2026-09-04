import { RoomsTable } from './components/RoomsTable';
import { BellSchedulesTable } from './components/BellSchedulesTable';
import { PeriodsTable } from './components/PeriodsTable';
import { createClient } from '@/lib/supabase/server';
import { BranchAccessError } from './components/BranchAccessError';

import {  verifyPageBranchContext } from '@/lib/branch-context';
import { Room, BellSchedule, Period } from './components/types';

export default async function SchedulingPage(props: { searchParams: Promise<{ tab?: string; branchId?: string }> }) {
  const searchParams = await props.searchParams;
  const tab = searchParams.tab || 'rooms';
  const explicitBranchId = searchParams.branchId;

  const supabase = await createClient();
  
    const { branchId, isAuthorized, isReadOnly, errorState } = await verifyPageBranchContext(explicitBranchId);

  if (errorState || !branchId || !isAuthorized) return <BranchAccessError errorState={errorState || 'ACCESS_DENIED'} />;

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
    if (!isReadOnly) {
      const [periodsRes, schedRes] = await Promise.all([
        supabase.from('periods').select('*, bell_schedules(name)').eq('branch_id', branchId).order('start_time', { ascending: true }),
        supabase.from('bell_schedules').select('*').eq('branch_id', branchId).order('name', { ascending: true }),
      ]);
      if (periodsRes.error) throw new Error(periodsRes.error.message);
      if (schedRes.error) throw new Error(schedRes.error.message);
      periods = (periodsRes.data as Period[]) || [];
      schedules = (schedRes.data as BellSchedule[]) || [];
    } else {
      const { data, error } = await supabase.from('periods').select('*, bell_schedules(name)').eq('branch_id', branchId).order('start_time', { ascending: true });
      if (error) throw new Error(error.message);
      periods = (data as Period[]) || [];
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Scheduling</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Configure rooms, bell schedules, and periods for instructional operations.
        </p>
      </div>
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8">
          <a
            href={`?tab=rooms${explicitBranchId ? '&branchId=' + explicitBranchId : ''}`}
            className={`${
              tab === 'rooms'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border font-medium'
            } whitespace-nowrap py-3 px-1 border-b-2 text-sm transition-colors`}
          >
            Rooms
          </a>
          <a
            href={`?tab=schedules${explicitBranchId ? '&branchId=' + explicitBranchId : ''}`}
            className={`${
              tab === 'schedules'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border font-medium'
            } whitespace-nowrap py-3 px-1 border-b-2 text-sm transition-colors`}
          >
            Bell Schedules
          </a>
          <a
            href={`?tab=periods${explicitBranchId ? '&branchId=' + explicitBranchId : ''}`}
            className={`${
              tab === 'periods'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border font-medium'
            } whitespace-nowrap py-3 px-1 border-b-2 text-sm transition-colors`}
          >
            Periods
          </a>
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


