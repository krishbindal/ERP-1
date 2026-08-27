import { AcademicYearsTable } from './components/AcademicYearsTable';
import { ClassesTable } from './components/ClassesTable';
import { SectionsTable } from './components/SectionsTable';
import { createClient } from '@/lib/supabase/server';
import { verifyPageBranchContext } from '@/lib/branch-context';
import { BranchAccessError } from '@/components/BranchAccessError';
import { AcademicYear, ClassWithYear, SectionWithClass } from './components/types';
import { AcademicStructureNav } from './components/AcademicStructureNav';

export default async function AcademicStructurePage(props: { searchParams: Promise<{ tab?: string; branchId?: string }> }) {
  const searchParams = await props.searchParams;
  const tab = (searchParams.tab || 'years') as 'years' | 'classes' | 'sections';
  const explicitBranchId = searchParams.branchId;

  const supabase = await createClient();
  
  const { branchId, isAuthorized, isReadOnly, errorState } = await verifyPageBranchContext(explicitBranchId);

  if (errorState !== null && !branchId) {
    return <BranchAccessError errorState={errorState} feature="academic structure" />;
  }
  
  if (!isAuthorized || !branchId) {
    return <BranchAccessError errorState="ACCESS_DENIED" feature="academic structure" />;
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
      <AcademicStructureNav currentTab={tab} explicitBranchId={explicitBranchId} />
      <div>
        {tab === 'years' && <AcademicYearsTable data={years} isReadOnly={isReadOnly} explicitBranchId={branchId} />}
        {tab === 'classes' && <ClassesTable data={classes} isReadOnly={isReadOnly} explicitBranchId={branchId} />}
        {tab === 'sections' && <SectionsTable data={sections} isReadOnly={isReadOnly} explicitBranchId={branchId} />}
      </div>
    </div>
  );
}
