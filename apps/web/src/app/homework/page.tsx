export const dynamic = 'force-dynamic';
import { createClient } from '@/lib/supabase/server';
import { verifyPageBranchContext, getAppContext } from '@/lib/branch-context';
import { BranchAccessError } from '@/components/BranchAccessError';
import { TeacherDashboard } from './components/TeacherDashboard';
import { StudentDashboard } from './components/StudentDashboard';

export default async function HomeworkPage(props: { searchParams: Promise<{ branchId?: string }> }) {
  const searchParams = await props.searchParams;
  const explicitBranchId = searchParams.branchId;

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
  const isStudent = context.roles.includes('student');
  const isGuardian = context.roles.includes('guardian');

  if (!isAdmin && !isTeacher && !isStudent && !isGuardian) {
    return <BranchAccessError errorState="ACCESS_DENIED" feature="homework" />;
  }

  // Fetch current academic year
  const { data: years, error: yrErr } = await supabase
    .from('academic_years')
    .select('*')
    .eq('branch_id', branchId)
    .order('start_date', { ascending: false });

  if (yrErr) throw new Error(yrErr.message);
  if (!years || years.length === 0) {
    return <div className="p-8">No academic years found. Please configure the academic structure first.</div>;
  }
  
  const currentYear = years[0];

  const isStaff = isAdmin || isTeacher;

  if (isStaff) {
    // For teachers/admins, fetch assignments they can see
    const { data: assignments, error: assignErr } = await supabase
      .from('homework_assignments')
      .select('*, sections!homework_assignments_section_id_fkey(name), subjects!homework_assignments_subject_id_fkey(name)')
      .eq('branch_id', branchId)
      .eq('academic_year_id', currentYear.id)
      .order('due_at', { ascending: true });

    if (assignErr) throw new Error(assignErr.message);

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Homework Management</h1>
        <TeacherDashboard 
          branchId={branchId}
          assignments={assignments || []} 
        />
      </div>
    );
  } else {
    // For students/guardians, fetch published/closed assignments
    const { data: assignments, error: assignErr } = await supabase
      .from('homework_assignments')
      .select('*, sections!homework_assignments_section_id_fkey(name), subjects!homework_assignments_subject_id_fkey(name)')
      .eq('branch_id', branchId)
      .eq('academic_year_id', currentYear.id)
      .order('due_at', { ascending: true });

    if (assignErr) throw new Error(assignErr.message);

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Homework</h1>
        <StudentDashboard 
          branchId={branchId}
          assignments={assignments || []}
        />
      </div>
    );
  }
}
