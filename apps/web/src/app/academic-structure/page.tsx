import { AcademicYearsTable } from './components/AcademicYearsTable';
import { ClassesTable } from './components/ClassesTable';
import { SectionsTable } from './components/SectionsTable';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export default async function AcademicStructurePage(props: { searchParams: Promise<{ tab?: string }> }) {
  const searchParams = await props.searchParams;
  const tab = searchParams.tab || 'years';
  
  const supabase = await createClient();
  const cookieStore = await cookies();
  const branchId = cookieStore.get('active_branch_id')?.value;

  // We need to determine if user can mutate.
  // One way is checking the user's role in staff_profiles.
  const { data: user } = await supabase.auth.getUser();
  
  let isReadOnly = false;
  if (user?.user?.id && branchId) {
    const { data: membership } = await supabase
      .from('branch_memberships')
      .select('id, user_role_assignments(roles(name))')
      .eq('user_id', user.user.id)
      .eq('branch_id', branchId)
      .single();

    const roleName = (membership as any)?.user_role_assignments?.[0]?.roles?.name;
    isReadOnly = roleName === 'Teacher';
  }

  let years = [];
  let classes = [];
  let sections = [];

  if (branchId) {
    if (tab === 'years') {
      const { data } = await supabase.from('academic_years').select('*').eq('branch_id', branchId).order('start_date', { ascending: false });
      years = data || [];
    } else if (tab === 'classes') {
      const { data } = await supabase.from('classes').select('*, academic_years(name)').eq('branch_id', branchId).order('level', { ascending: true });
      classes = data || [];
    } else if (tab === 'sections') {
      const { data } = await supabase.from('sections').select('*, classes(name)').eq('branch_id', branchId).order('name', { ascending: true });
      sections = data || [];
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
          <div className="text-gray-500">Please select a branch to view academic structure.</div>
        ) : (
          <>
            {tab === 'years' && <AcademicYearsTable data={years} isReadOnly={isReadOnly} branchId={branchId} />}
            {tab === 'classes' && <ClassesTable data={classes} isReadOnly={isReadOnly} branchId={branchId} />}
            {tab === 'sections' && <SectionsTable data={sections} isReadOnly={isReadOnly} branchId={branchId} />}
          </>
        )}
      </div>
    </div>
  );
}
