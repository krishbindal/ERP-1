import { AcademicYearsTable } from './components/AcademicYearsTable';
import ClassesTable from './components/ClassesTable';
import { SectionsTable } from './components/SectionsTable';
import { createClient } from '@/lib/supabase/server';
import { getCurrentAppBranch } from '@/lib/branch-context';
import { AcademicYear, ClassWithYear, SectionWithClass } from './components/types';

export default async function AcademicStructurePage(props: { searchParams: Promise<{ tab?: string }> }) {
  const searchParams = await props.searchParams;
  const tab = searchParams.tab || 'years';
  
  const supabase = await createClient();
  const currentBranch = await getCurrentAppBranch();
  const branchId = currentBranch?.id;

  const { data: user } = await supabase.auth.getUser();
  
  let isReadOnly = false;
  if (user?.user?.id && branchId) {
    const { data: membership, error: membershipError } = await supabase
      .from('branch_memberships')
      .select('id, user_role_assignments(roles(name))')
      .eq('user_id', user.user.id)
      .eq('branch_id', branchId)
      .single();

    if (membershipError) {
      throw new Error(membershipError.message);
    }

    const assignments = (membership as unknown as { user_role_assignments: { roles: { name: string } }[] })?.user_role_assignments;
    const roleName = assignments?.[0]?.roles?.name;
    isReadOnly = roleName === 'Teacher';
  }

  let years: AcademicYear[] = [];
  let classes: ClassWithYear[] = [];
  let sections: SectionWithClass[] = [];

  if (branchId) {
    if (tab === 'years') {
      const { data, error } = await supabase.from('academic_years').select('*').eq('branch_id', branchId).order('start_date', { ascending: false });
      if (error) throw new Error(error.message);
      years = (data as unknown as AcademicYear[]) || [];
    } else if (tab === 'classes') {
      const { data, error } = await supabase.from('classes').select('*, academic_years(name)').eq('branch_id', branchId).order('level', { ascending: true });
      if (error) throw new Error(error.message);
      classes = (data as unknown as ClassWithYear[]) || [];
    } else if (tab === 'sections') {
      const { data, error } = await supabase.from('sections').select('*, classes(name, academic_years(name))').order('name', { ascending: true });
      if (error) throw new Error(error.message);
      sections = (data as unknown as SectionWithClass[]) || [];
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Academic Structure</h1>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <a href="?tab=years" className={`${tab === 'years' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Academic Years</a>
          <a href="?tab=classes" className={`${tab === 'classes' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Classes</a>
          <a href="?tab=sections" className={`${tab === 'sections' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Sections</a>
        </nav>
      </div>
      <div>
        {!branchId ? (
          <div className="text-gray-500">No branch context. Ensure you are accessing a valid branch application.</div>
        ) : (
          <>
            {tab === 'years' && <AcademicYearsTable data={years} isReadOnly={isReadOnly} />}
            {tab === 'classes' && <ClassesTable data={classes} isReadOnly={isReadOnly} />}
            {tab === 'sections' && <SectionsTable data={sections} isReadOnly={isReadOnly} />}
          </>
        )}
      </div>
    </div>
  );
}
