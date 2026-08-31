/* eslint-disable @typescript-eslint/no-explicit-any */
export const dynamic = 'force-dynamic';
import { createClient } from '@/lib/supabase/server';
import { verifyPageBranchContext, getAppContext } from '@/lib/branch-context';
import { BranchAccessError } from '@/components/BranchAccessError';
import { HomeworkForm } from '../components/HomeworkForm';

export default async function EditHomeworkPage(props: { params: Promise<{ id: string }>, searchParams: Promise<{ branchId?: string }> }) {
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

  if (!isAdmin && !isTeacher) {
    return <BranchAccessError errorState="ACCESS_DENIED" feature="homework" />;
  }

  // Fetch assignment
  const { data: assignment, error: assignErr } = await supabase
    .from('homework_assignments')
    .select('*')
    .eq('id', params.id)
    .single();

  if (assignErr || !assignment) {
    return <div>Not found</div>;
  }

  // Only allow editing DRAFT
  if (assignment.status !== 'DRAFT') {
    return <div className="p-8 text-red-600">Cannot edit a published or closed assignment.</div>;
  }

  const currentYearId = assignment.academic_year_id;

  let availableSections: any[] = [];
  let availableSubjects: any[] = [];

  if (isAdmin) {
    const { data: sections } = await supabase.from('sections').select('id, name, class_id').eq('branch_id', branchId);
    const { data: subjects } = await supabase.from('subjects').select('id, name');
    availableSections = sections || [];
    availableSubjects = subjects || [];
  } else {
    // Teacher: only fetch sections/subjects they are assigned to
    const { data: profile } = await supabase
      .from('staff_branch_profiles')
      .select('id')
      .eq('user_id', context.userId)
      .eq('branch_id', branchId)
      .single();

    if (profile) {
      const { data: assignments } = await supabase
        .from('teacher_subject_assignments')
        .select('section_id, subject_id, sections(name, class_id), subjects(name)')
        .eq('staff_branch_profile_id', profile.id)
        .eq('status', 'ACTIVE');
      
      if (assignments) {
        // deduplicate
        const secMap = new Map();
        const subMap = new Map();
        assignments.forEach(a => {
          if (a.sections && !secMap.has(a.section_id)) secMap.set(a.section_id, { id: a.section_id, name: (a.sections as any).name, class_id: (a.sections as any).class_id });
          if (a.subjects && !subMap.has(a.subject_id)) subMap.set(a.subject_id, { id: a.subject_id, name: (a.subjects as any).name });
        });
        availableSections = Array.from(secMap.values());
        availableSubjects = Array.from(subMap.values());
      }
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Edit Homework Assignment</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <HomeworkForm 
          branchId={branchId}
          academicYearId={currentYearId}
          sections={availableSections}
          subjects={availableSubjects}
          initialData={assignment}
        />
      </div>
    </div>
  );
}
