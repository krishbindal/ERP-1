export const dynamic = 'force-dynamic';
import { createClient } from '@/lib/supabase/server';
import { verifyPageBranchContext, getAppContext } from '@/lib/branch-context';
import { BranchAccessError } from '@/components/BranchAccessError';
import { TeacherDashboard } from './components/TeacherDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { AcademicSessionSelector } from '@/components/AcademicSessionSelector';

export default async function HomeworkPage(props: { searchParams: Promise<{ branchId?: string; session?: string }> }) {
  const searchParams = await props.searchParams;
  const explicitBranchId = searchParams.branchId;
  let sessionId = searchParams.session;

  const supabase = await createClient();
  const context = await getAppContext();
  const { branchId, isAuthorized, errorState } = await verifyPageBranchContext(explicitBranchId);

  if (errorState !== null && !branchId) {
    return <BranchAccessError errorState={errorState} feature="homework" />;
  }
  
  if (!isAuthorized || !branchId || !context) {
    return <BranchAccessError errorState="ACCESS_DENIED" feature="homework" />;
  }

  const isAdmin = context.roles.includes('branchadmin') || context.roles.includes('superadmin');
  const isTeacher = context.roles.includes('teacher');
  const isStaff = isAdmin || isTeacher;

  // Fetch all academic years for selector
  const { data: years, error: yrErr } = await supabase
    .from('academic_years')
    .select('*')
    .eq('branch_id', branchId)
    .order('start_date', { ascending: false });

  if (yrErr) throw new Error(yrErr.message);

  if (!sessionId && years && years.length > 0) { sessionId = years[0].id; }

  
  let assignments: { id: string; title: string; due_date: string; status: string; sections?: { name: string } | { name: string }[] | undefined; subjects?: { name: string } | { name: string }[] | undefined; }[] = [];
  
  if (sessionId) {
    const { data: fetchedAssignments, error: assignErr } = await supabase
      .from('homework_assignments')
      .select('*, sections!homework_assignments_section_id_fkey(name), subjects!homework_assignments_subject_id_fkey(name)')
      .eq('branch_id', branchId)
      .eq('academic_year_id', sessionId)
      .order('due_at', { ascending: true });

    if (assignErr) throw new Error(assignErr.message);
    assignments = fetchedAssignments || [];
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Homework</h1>
        <AcademicSessionSelector years={years || []} currentSessionId={sessionId} branchId={branchId} />
      </div>

      {!sessionId ? (
        <div className="p-12 text-center text-gray-500 bg-gray-50 rounded border border-gray-200">
          Please select an Academic Session above to view homework assignments.
        </div>
      ) : (
        isStaff ? (
          <TeacherDashboard branchId={branchId} assignments={assignments} />
        ) : (
          <StudentDashboard branchId={branchId} assignments={assignments} />
        )
      )}
    </div>
  );
}







