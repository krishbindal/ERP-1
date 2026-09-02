/* eslint-disable @typescript-eslint/no-explicit-any */
export const dynamic = 'force-dynamic';
import { createClient } from '@/lib/supabase/server';
import { verifyPageBranchContext, getAppContext } from '@/lib/branch-context';
import { BranchAccessError } from '@/components/BranchAccessError';
import { TeacherHomeworkDetails } from '../components/TeacherHomeworkDetails';
import { StudentHomeworkDetails } from '../components/StudentHomeworkDetails';
import { notFound } from 'next/navigation';

export default async function HomeworkDetailsPage(props: { params: Promise<{ id: string }>, searchParams: Promise<{ branchId?: string }> }) {
  const params = await props.params;
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

  // Fetch assignment
  const { data: assignment, error: assignErr } = await supabase
    .from('homework_assignments')
    .select('*, sections!homework_assignments_section_id_fkey(name), subjects!homework_assignments_subject_id_fkey(name)')
    .eq('id', params.id)
    .single();

  if (assignErr || !assignment) {
    return notFound();
  }

  const isStaff = isAdmin || isTeacher;

  if (isStaff) {
    // For teachers, we also want to fetch submissions
    const { data: submissions, error: subErr } = await supabase
      .from('homework_submissions')
      .select('*, students(first_name, last_name, roll_number)')
      .eq('assignment_id', assignment.id)
      .order('updated_at', { ascending: false });

    return (
      <div className="space-y-6">
        <TeacherHomeworkDetails 
          assignment={assignment}
          submissions={submissions || []}
        />
      </div>
    );
  } else {
    // For students, fetch their own submission if it exists
    let submission = null;
    
    if (isStudent) {
      const { data: student } = await supabase.from('students').select('id').eq('profile_id', context.userId).single();
      if (student) {
        const { data: sub } = await supabase
          .from('homework_submissions')
          .select('*')
          .eq('assignment_id', assignment.id)
          .eq('student_id', student.id)
          .maybeSingle();
        submission = sub;
      }
    } else if (isGuardian) {
      // Guardian might see all their children's submissions for this assignment
      // But the UI usually maps 1-1 to a student for viewing details, or lists them.
      // We will just pass null or fetch appropriately if needed. (Skipped for simplicity unless required)
    }

    return (
      <div className="space-y-6">
        <StudentHomeworkDetails 
          assignment={assignment}
          submission={submission}
          isGuardian={isGuardian}
        />
      </div>
    );
  }
}
