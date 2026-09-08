/* eslint-disable @typescript-eslint/no-explicit-any */
export const dynamic = 'force-dynamic';
import { createClient } from '@/lib/supabase/server';
import { verifyPageBranchContext, getAppContext } from '@/lib/branch-context';
import { BranchAccessError } from '@/components/BranchAccessError';
import { HomeworkForm } from '../components/HomeworkForm';

export default async function NewHomeworkPage(props: { searchParams: Promise<{ branchId?: string; session?: string }> }) {
  const searchParams = await props.searchParams;
  const explicitBranchId = searchParams.branchId;
  const sessionId = searchParams.session;

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

  if (!isAdmin && !isTeacher) {
    return <BranchAccessError errorState="ACCESS_DENIED" feature="homework" />;
  }

  if (!sessionId) {
    return <div className="p-12 text-center text-gray-500 bg-gray-50 rounded border border-gray-200">
      Please select an Academic Session in the Homework dashboard before creating a new assignment.
    </div>;
  }

  let availableSections: any[] = [];
  let availableSubjects: any[] = [];

  if (isAdmin) {
    const { data: sections } = await supabase.from('sections').select('id, name, class_id').eq('branch_id', branchId).eq('academic_year_id', sessionId);
    const { data: subjects } = await supabase.from('subjects').select('id, name');
    availableSections = sections || [];
    availableSubjects = subjects || [];
  } else {
    // Teacher: only fetch sections/subjects they are assigned to
    const { data: profile } = await supabase
      .from('staff_branch_profiles')
      .select('id, staff!inner(profile_id)')
      .eq('staff.profile_id', context.userId)
      .eq('branch_id', branchId)
      .single();

    if (profile) {
      const { data: assignments } = await supabase
        .from('timetable_entries')
        .select('section_id, subject_id, sections!inner(id, name, class_id), subjects!inner(id, name)')
        .eq('teacher_id', profile.id)
        .eq('branch_id', branchId)
        .eq('academic_year_id', sessionId)
        .eq('status', 'ACTIVE');
        
      if (assignments) {
        const uniqueSecs = new Map();
        const uniqueSubs = new Map();
        assignments.forEach(a => {
          if (!uniqueSecs.has(a.section_id) && a.sections) uniqueSecs.set(a.section_id, a.sections);
          if (!uniqueSubs.has(a.subject_id) && a.subjects) uniqueSubs.set(a.subject_id, a.subjects);
        });
        availableSections = Array.from(uniqueSecs.values());
        availableSubjects = Array.from(uniqueSubs.values());
      }
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Create Homework Assignment</h1>
      <HomeworkForm 
        branchId={branchId}
        academicYearId={sessionId}
        sections={availableSections}
        subjects={availableSubjects}
      />
    </div>
  );
}
