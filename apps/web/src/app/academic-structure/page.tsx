import { AcademicYearsTable } from './components/AcademicYearsTable';
import { ClassesTable } from './components/ClassesTable';
import { SectionsTable } from './components/SectionsTable';
import { createClient } from '@/lib/supabase/server';
import {  verifyPageBranchContext } from '@/lib/branch-context';
import { AcademicYear, ClassWithYear, SectionWithClass } from './components/types';

export default async function AcademicStructurePage(props: { searchParams: Promise<{ tab?: string; branchId?: string }> }) {
  const searchParams = await props.searchParams;
  const tab = searchParams.tab || 'years';
  const explicitBranchId = searchParams.branchId;

  const supabase = await createClient();
  
    const { branchId, isAuthorized, isReadOnly, errorState } = await verifyPageBranchContext(explicitBranchId);

  if (errorState === 'NO_CONTEXT') return <div className="text-gray-500">No context available.</div>;
  if (errorState === 'NO_BRANCH_SELECTED') return <div className="text-gray-500">Please select a branch to view its academic structure.</div>;
  if (errorState === 'ACCESS_DENIED' || !branchId || !isAuthorized) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">You do not have permission to view this branch&apos;s academic structure.</p>
        </div>
      </div>
    );
  }

  let years: AcademicYear[] = [];
  let classes: ClassWithYear[] = [];
  let sections: SectionWithClass[] = [];

  if (tab === 'years') {
    const { data, error } = await supabase.from('academic_years').select('*').eq('branch_id', branchId).order('start_date', { ascending: false });
    if (error) throw new Error(error.message);
    years = (data as AcademicYear[]) || [];
  } else if (tab === 'classes') {
    const { data, error } = await supabase.from('classes').select('*, academic_years(name)').eq('branch_id', branchId).order('level', { ascending: true });
    if (error) throw new Error(error.message);
    classes = (data as ClassWithYear[]) || [];
  } else if (tab === 'sections') {
    const { data, error } = await supabase.from('sections').select('*, classes(name, academic_years(name))').eq('branch_id', branchId).order('name', { ascending: true });
    if (error) throw new Error(error.message);
    sections = (data as SectionWithClass[]) || [];
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Academic Structure</h1>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <a href={`?tab=years${explicitBranchId ? '&branchId=' + explicitBranchId : ''}`} className={`${tab === 'years' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Academic Years</a>
          <a href={`?tab=classes${explicitBranchId ? '&branchId=' + explicitBranchId : ''}`} className={`${tab === 'classes' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Classes</a>
          <a href={`?tab=sections${explicitBranchId ? '&branchId=' + explicitBranchId : ''}`} className={`${tab === 'sections' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Sections</a>
        </nav>
      </div>
      <div>
        {tab === 'years' && <AcademicYearsTable data={years} isReadOnly={isReadOnly} explicitBranchId={branchId} />}
        {tab === 'classes' && <ClassesTable data={classes} isReadOnly={isReadOnly} explicitBranchId={branchId} />}
        {tab === 'sections' && <SectionsTable data={sections} isReadOnly={isReadOnly} explicitBranchId={branchId} />}
      </div>
    </div>
  );
}



