export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { verifyPageBranchContext } from '@/lib/branch-context';
import { BranchAccessError } from '../components/BranchAccessError';
import { fetchSchedulingPageData } from '../lib/page-data';

import { TimetableManager } from './components/TimetableManager';

export default async function TimetablePage(props: Readonly<{ searchParams: Promise<{ branchId?: string; view?: string }> }>) {
  const searchParams = await props.searchParams;
  const explicitBranchId = searchParams.branchId;
  const view = searchParams.view || 'section';

  const { branchId, isAuthorized, isReadOnly, errorState } = await verifyPageBranchContext(explicitBranchId);

  if (errorState || !branchId || !isAuthorized) return <BranchAccessError errorState={errorState || 'ACCESS_DENIED'} />;

  const { supabase, academicYearId, entriesData, periods, rooms, teachers } = await fetchSchedulingPageData(branchId);

  const { data: classes } = await supabase.from('classes').select('*').eq('branch_id', branchId).eq('academic_year_id', academicYearId).order('name');
  const { data: sections } = await supabase.from('sections').select('*').eq('branch_id', branchId).eq('academic_year_id', academicYearId).order('name');
  const { data: subjects } = await supabase.from('subjects').select('*').eq('branch_id', branchId).eq('status', 'ACTIVE').order('name');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Timetable</h1>
        
        <form className="flex items-center gap-2">
          <input type="hidden" name="branchId" value={branchId} />
          <label htmlFor="view" className="text-sm font-medium text-gray-700">View:</label>
          <select id="view" name="view" defaultValue={view} className="border border-gray-300 rounded-md p-2 text-sm">
            <option value="section">By Section</option>
            <option value="teacher">By Teacher</option>
            <option value="room">By Room</option>
          </select>
          <button type="submit" className="px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200 text-sm">
            Apply
          </button>
        </form>
      </div>

      <TimetableManager
        branchId={branchId}
        entries={entriesData || []}
        periods={periods || []}
        rooms={rooms || []}
        classes={classes || []}
        sections={sections || []}
        subjects={subjects || []}
        teachers={teachers || []}
        isReadOnly={isReadOnly}
      />
    </div>
  );
}
