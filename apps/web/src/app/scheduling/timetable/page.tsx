export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { verifyPageBranchContext } from '@/lib/branch-context';
import { BranchAccessError } from '@/components/BranchAccessError';
import { fetchTimetablePageData } from './page-data';
import { TimetableManager } from './components/TimetableManager';
import { AcademicSessionSelector } from '@/components/AcademicSessionSelector';
import { createClient } from '@/lib/supabase/server';

export default async function TimetablePage(props: Readonly<{ searchParams: Promise<{ branchId?: string; view?: string; session?: string }> }>) {
  const searchParams = await props.searchParams;
  const explicitBranchId = searchParams.branchId;
    const sessionId = searchParams.session || '';

  const { branchId, isAuthorized, isReadOnly, errorState } = await verifyPageBranchContext(explicitBranchId);

  if (errorState || !branchId || !isAuthorized) {
    return <BranchAccessError errorState={errorState || 'ACCESS_DENIED'} feature="timetable" />;
  }

  const supabase = await createClient();
  const { data: years, error: yrErr } = await supabase
    .from('academic_years')
    .select('*')
    .eq('branch_id', branchId)
    .order('start_date', { ascending: false });

  if (yrErr) throw new Error(yrErr.message);

  let timetableProps: { entriesData: import('./components/TimetableGrid').TimetableEntry[]; periods: import('./components/TimetableGrid').Period[]; rooms: { id: string; name: string }[]; classes: { id: string; name: string }[]; sections: { id: string; name: string; class_id: string }[]; subjects: { id: string; name: string }[]; teachers: { id: string; staff?: { first_name: string; last_name: string } | { first_name: string; last_name: string }[] | undefined; }[] } | null = null;

  if (sessionId) {
    // All queries executed in 2 parallel waves via fetchTimetablePageData
    const {
      entriesData,
      periods,
      rooms,
      teachers,
      classes,
      sections,
      subjects,
    } = await fetchTimetablePageData(branchId, sessionId);
    
    timetableProps = { entriesData, periods, rooms, teachers, classes, sections, subjects };
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Timetable Management</h1>
        <AcademicSessionSelector years={years || []} currentSessionId={sessionId} branchId={branchId} />
      </div>

      {!sessionId ? (
        <div className="p-12 text-center text-gray-500 bg-gray-50 rounded border border-gray-200">
          Please select an Academic Session above to view the timetable.
        </div>
      ) : (
        <TimetableManager
          academicYearId={sessionId}
          branchId={branchId}
          entries={timetableProps?.entriesData || []}
          periods={timetableProps?.periods || []}
          rooms={timetableProps?.rooms || []}
          teachers={timetableProps?.teachers || []}
          classes={timetableProps?.classes || []}
          sections={timetableProps?.sections || []}
          subjects={timetableProps?.subjects || []}
          isReadOnly={isReadOnly}
        />
      )}
    </div>
  );
}






