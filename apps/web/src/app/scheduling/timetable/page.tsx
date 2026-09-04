export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { verifyPageBranchContext } from '@/lib/branch-context';
import { BranchAccessError } from '../components/BranchAccessError';
import { fetchTimetablePageData } from './page-data';
import { TimetableManager } from './components/TimetableManager';

export default async function TimetablePage(props: Readonly<{ searchParams: Promise<{ branchId?: string; view?: string }> }>) {
  const searchParams = await props.searchParams;
  const explicitBranchId = searchParams.branchId;
  const view = searchParams.view || 'section';

  const { branchId, isAuthorized, isReadOnly, errorState } = await verifyPageBranchContext(explicitBranchId);

  if (errorState || !branchId || !isAuthorized) {
    return <BranchAccessError errorState={errorState || 'ACCESS_DENIED'} />;
  }

  // All 8 queries executed in 2 parallel waves via fetchTimetablePageData
  const {
    entriesData,
    periods,
    rooms,
    teachers,
    classes,
    sections,
    subjects,
  } = await fetchTimetablePageData(branchId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Timetable</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage and view weekly scheduled periods across sections, teachers, and rooms.
          </p>
        </div>

        <form className="flex items-center gap-2 self-start sm:self-auto">
          <input type="hidden" name="branchId" value={branchId} />
          <label htmlFor="view" className="text-sm font-medium text-foreground">
            View:
          </label>
          <select
            id="view"
            name="view"
            defaultValue={view}
            className="border border-input rounded-md px-2.5 py-1.5 text-sm bg-surface text-foreground shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="section">By Section</option>
            <option value="teacher">By Teacher</option>
            <option value="room">By Room</option>
          </select>
          <button
            type="submit"
            className="px-3 py-1.5 bg-secondary hover:bg-muted text-secondary-foreground border border-border rounded-md text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Apply
          </button>
        </form>
      </div>

      {/* Timetable manager and grid rendered within an accessible container */}
      <div className="w-full">
        <TimetableManager
          branchId={branchId}
          entries={entriesData}
          periods={periods}
          rooms={rooms}
          classes={classes}
          sections={sections}
          subjects={subjects}
          teachers={teachers}
          isReadOnly={isReadOnly}
        />
      </div>
    </div>
  );
}
