export const dynamic = 'force-dynamic';
import { createClient } from '@/lib/supabase/server';
import { verifyPageBranchContext, getAppContext } from '@/lib/branch-context';
import { BranchAccessError } from '@/components/BranchAccessError';

export default async function AttendanceHistoryPage(props: { searchParams: Promise<{ branchId?: string }> }) {
  const searchParams = await props.searchParams;
  const explicitBranchId = searchParams.branchId;

  const supabase = await createClient();
  const context = await getAppContext();
  const { branchId, isAuthorized, errorState } = await verifyPageBranchContext(explicitBranchId);

  if (errorState !== null && !branchId) {
    return <BranchAccessError errorState={errorState} feature="attendance history" />;
  }
  
  if (!isAuthorized || !branchId || !context) {
    return <BranchAccessError errorState="ACCESS_DENIED" feature="attendance history" />;
  }


    const isParent = context.roles.includes('parent') || context.roles.includes('guardian');
  const isStudent = context.roles.includes('student');

  if (!isParent && !isStudent) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Attendance History</h1>
        <p className="text-gray-500">Historical view is designed for students and parents.</p>
      </div>
    );
  }

  // Get relevant students
  let studentIds: string[] = [];
  if (isStudent) {
    // A student can only see themselves
    const { data: profile } = await supabase.from('students').select('id').eq('profile_id', context.userId).single();
    if (profile) studentIds.push(profile.id);
  } else if (isParent) {
    // A parent can see their children
    const { data: profile } = await supabase.from('guardians').select('id').eq('profile_id', context.userId).single();
    if (profile) {
      const { data: children } = await supabase.from('student_guardians').select('student_id').eq('guardian_id', profile.id);
      if (children) studentIds = children.map(c => c.student_id);
    }
  }

  if (studentIds.length === 0) {
    return <div className="p-8">No linked student records found.</div>;
  }

  // Fetch only PUBLISHED attendance records for these students
  const { data: records, error } = await supabase
    .from('attendance_records')
    .select(`
      status,
      notes,
      attendance_sessions!inner(
        date,
        published_at
      ),
      students!inner(
        first_name,
        last_name
      )
    `)
    .in('student_id', studentIds)
    .not('attendance_sessions.published_at', 'is', null)
    .in('status', ['ABSENT', 'LATE']) // spec: "list/calendar of published Absences and Lates"
    .order('attendance_sessions(date)', { ascending: false });

  if (error) throw new Error(error.message);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Attendance History (Absences & Lates)</h1>
      
      {!records || records.length === 0 ? (
        <div className="bg-white p-6 rounded shadow text-gray-500">
          No published absences or lates found.
        </div>
      ) : (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.map((record, i) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const r = record as any;
                return (
                <tr key={i}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {r.attendance_sessions.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {r.students.first_name} {r.students.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${r.status === 'ABSENT' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}



