import { AcademicYearsTable } from './components/AcademicYearsTable';
import { ClassesTable } from './components/ClassesTable';
import { SectionsTable } from './components/SectionsTable';
import { createClient } from '@/lib/supabase/server';
import { verifyPageBranchContext } from '@/lib/branch-context';
import { BranchAccessError } from '@/components/BranchAccessError';
import { AcademicYear, ClassWithYear, SectionWithClass } from './components/types';
import { AcademicStructureNav } from './components/AcademicStructureNav';
import { AcademicSessionSelector } from '@/components/AcademicSessionSelector';

export default async function AcademicStructurePage(props: { searchParams: Promise<{ tab?: string; branchId?: string; session?: string }> }) {
  const searchParams = await props.searchParams;
  const tab = (searchParams.tab || 'years') as 'years' | 'classes' | 'sections';
  const explicitBranchId = searchParams.branchId;
  const sessionId = searchParams.session;

  const supabase = await createClient();
  
  const { branchId, isAuthorized, isReadOnly, errorState } = await verifyPageBranchContext(explicitBranchId);

  if (errorState !== null && !branchId) {
    return <BranchAccessError errorState={errorState} feature="academic structure" />;
  }
  
  if (!isAuthorized || !branchId) {
    return <BranchAccessError errorState="ACCESS_DENIED" feature="academic structure" />;
  }

  const { data: years, error: yrErr } = await supabase.from('academic_years').select('*').eq('branch_id', branchId).order('start_date', { ascending: false });
  if (yrErr) throw new Error(yrErr.message);

  if (sessionId && years) {
    if (!years.some(y => y.id === sessionId)) {
      return <div className="p-4 text-red-500">Invalid or cross-branch academic session selected.</div>;
    }
  }

  let classes: ClassWithYear[] = [];
  let sections: SectionWithClass[] = [];

  if (tab === 'classes') {
    if (sessionId) {
      const { data, error } = await supabase.from('classes').select('*, academic_years(name)').eq('branch_id', branchId).eq('academic_year_id', sessionId).order('level', { ascending: true });
      if (error) throw new Error(error.message);
      classes = (data as ClassWithYear[]) || [];
    }
  } else if (tab === 'sections') {
    if (sessionId) {
      const { data, error } = await supabase.from('sections').select('*, classes(name, academic_years(name))').eq('branch_id', branchId).eq('academic_year_id', sessionId).order('name', { ascending: true });
      if (error) throw new Error(error.message);
      sections = (data as SectionWithClass[]) || [];
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Academic Structure</h1>
        {(tab === 'classes' || tab === 'sections') && (
          <AcademicSessionSelector years={years} currentSessionId={sessionId} branchId={branchId} />
        )}
      </div>
      
      <AcademicStructureNav currentTab={tab} explicitBranchId={explicitBranchId} sessionId={sessionId} />
      
      <div>
        {tab === 'years' && <AcademicYearsTable data={years} isReadOnly={isReadOnly} explicitBranchId={branchId} />}
        
        {(tab === 'classes' || tab === 'sections') && !sessionId ? (
          <div className="p-12 text-center text-gray-500 bg-gray-50 rounded border border-gray-200">
            Please select an Academic Session above to view {tab}.
          </div>
        ) : (
          <>
            {tab === 'classes' && <ClassesTable data={classes} isReadOnly={isReadOnly} explicitBranchId={branchId} />}
            {tab === 'sections' && <SectionsTable data={sections} isReadOnly={isReadOnly} explicitBranchId={branchId} />}
          </>
        )}
      </div>
    </div>
  );
}




