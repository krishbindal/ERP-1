import { createClient } from '@/lib/supabase/server';
import { verifyPageBranchContext, getAppContext } from '@/lib/branch-context';
import { BranchAccessError } from '@/components/BranchAccessError';
import { AttendanceManager } from './components/AttendanceManager';

export default async function AttendancePage(props: { searchParams: Promise<{ branchId?: string; date?: string; sectionId?: string }> }) {
  const searchParams = await props.searchParams;
  const explicitBranchId = searchParams.branchId;
  const date = searchParams.date || new Date().toISOString().split('T')[0];
  const sectionId = searchParams.sectionId || null;

  const supabase = await createClient();
  const context = await getAppContext();
  const { branchId, isAuthorized, errorState } = await verifyPageBranchContext(explicitBranchId);

  if (errorState !== null && !branchId) {
    return <BranchAccessError errorState={errorState} feature="attendance" />;
  }
  
  if (!isAuthorized || !branchId || !context) {
    return <BranchAccessError errorState="ACCESS_DENIED" feature="attendance" />;
  }

  const isAdmin = context.roles.includes('branchadmin') || context.roles.includes('superadmin');
  
  // 1. Fetch current academic year
  const { data: years, error: yrErr } = await supabase
    .from('academic_years')
    .select('*')
    .eq('branch_id', branchId)
    .order('start_date', { ascending: false });

  if (yrErr) throw new Error(yrErr.message);
  if (!years || years.length === 0) {
    return <div className="p-8">No academic years found. Please configure the academic structure first.</div>;
  }
  
  const currentYear = years[0]; // Assuming latest is current for simplicity

  // 2. Fetch sections for dropdown
  const { data: sections, error: secErr } = await supabase
    .from('sections')
    .select('*, classes(name)')
    .eq('branch_id', branchId)
    .order('name', { ascending: true });

  if (secErr) throw new Error(secErr.message);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let enrolledStudents: any[] = [];
  let attendanceSession = null;
  let attendanceRecords = [];

  // 3. Fetch data if section and date selected
  if (sectionId && date) {
    // 3a. Fetch Enrollments
    const { data: enrollments, error: enrErr } = await supabase
      .from('enrollments')
      .select('roll_number, students(id, first_name, last_name)')
      .eq('section_id', sectionId)
      .eq('status', 'ACTIVE')
      .order('roll_number', { ascending: true });
      
    if (enrErr) throw new Error(enrErr.message);
    enrolledStudents = enrollments || [];

    // 3b. Fetch Attendance Session
    const { data: session, error: sessErr } = await supabase
      .from('attendance_sessions')
      .select('*')
      .eq('section_id', sectionId)
      .eq('date', date)
      .single();

    if (sessErr && sessErr.code !== 'PGRST116') { // PGRST116 is not found, which is fine
      throw new Error(sessErr.message);
    }

    if (session) {
      attendanceSession = session;
      
      // 3c. Fetch Attendance Records
      const { data: records, error: recErr } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('session_id', session.id);
        
      if (recErr) throw new Error(recErr.message);
      attendanceRecords = records || [];
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Attendance</h1>
      <AttendanceManager 
        academicYearId={currentYear.id}
        branchId={branchId}
        sections={sections || []}
        selectedDate={date}
        selectedSectionId={sectionId}
        enrolledStudents={enrolledStudents}
        initialSession={attendanceSession}
        initialRecords={attendanceRecords}
        isAdmin={isAdmin}
      />
    </div>
  );
}
