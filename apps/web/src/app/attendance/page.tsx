export const dynamic = 'force-dynamic';
import { createClient } from '@/lib/supabase/server';
import { verifyPageBranchContext, getAppContext } from '@/lib/branch-context';
import { BranchAccessError } from '@/components/BranchAccessError';
import { AttendanceManager } from './components/AttendanceManager';
import { AcademicSessionSelector } from '@/components/AcademicSessionSelector';

export default async function AttendancePage(props: { searchParams: Promise<{ branchId?: string; date?: string; sectionId?: string; session?: string }> }) {
  const searchParams = await props.searchParams;
  const explicitBranchId = searchParams.branchId;
  const date = searchParams.date || new Date().toISOString().split('T')[0];
  const sectionId = searchParams.sectionId || null;
  const sessionId = searchParams.session;

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
  const isTeacher = context.roles.includes('teacher'); 
  if (!isAdmin && !isTeacher) return <BranchAccessError errorState="ACCESS_DENIED" feature="attendance entry" />;
  
  // 1. Fetch all academic years for selector
  const { data: years, error: yrErr } = await supabase
    .from('academic_years')
    .select('*')
    .eq('branch_id', branchId)
    .order('start_date', { ascending: false });

  if (yrErr) throw new Error(yrErr.message);

  // 2. Fetch sections for dropdown, strictly filtered by selected session
  let sections: any[] = [];
  if (sessionId) {
    const { data: secs, error: secErr } = await supabase
      .from('sections')
      .select('*, classes(name)')
      .eq('branch_id', branchId)
      .eq('academic_year_id', sessionId)
      .order('name', { ascending: true });

    if (secErr) throw new Error(secErr.message);
    sections = secs || [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let enrolledStudents: any[] = [];
  let attendanceSession = null;
  let attendanceRecords: any[] = [];

  // 3. Fetch data if section and date selected
  if (sectionId && date && sessionId) {
    // 3a. Fetch Enrollments
    const { data: enrollments, error: enrErr } = await supabase
      .from('enrollments')
      .select('roll_number, students!inner(id, first_name, last_name)')
      .eq('section_id', sectionId)
      .eq('academic_year_id', sessionId)
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

    if (sessErr && sessErr.code !== 'PGRST116') { // PGRST116 is not found
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

  const selectedSection = sections?.find(s => s.id === sectionId);

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Attendance</h1>
        <AcademicSessionSelector years={years || []} currentSessionId={sessionId} branchId={branchId} />
      </div>
      
      {!sessionId ? (
        <div className="p-12 text-center text-gray-500 bg-gray-50 rounded border border-gray-200">
          Please select an Academic Session above to view attendance.
        </div>
      ) : (
        <AttendanceManager 
          academicYearId={sessionId}
          branchId={branchId}
          sections={sections}
          selectedDate={date}
          selectedSectionId={sectionId}
          enrolledStudents={enrolledStudents}
          initialSession={attendanceSession}
          initialRecords={attendanceRecords}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
