import { createClient } from '@/lib/supabase/server';

export type Student = {
  id: string;
  organization_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth?: string;
  gender?: string;
  status: string;
}

export type Guardian = {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  status: string;
}

export class StudentsService {
  /**
   * Atomics creation of a student and initial enrollment
   * Calls the security invoker RPC function to respect RLS natively
   */
  static async createStudentWithPlacement(
    organizationId: string,
    branchId: string,
    data: {
      firstName: string;
      lastName: string;
      middleName?: string;
      dateOfBirth?: string;
      gender?: string;
    }
  ): Promise<{ id: string } | { error: Error }> {
    const supabase = await createClient();
    const { data: result, error } = await supabase.rpc('create_student_with_initial_placement', {
      p_organization_id: organizationId,
      p_branch_id: branchId,
      p_first_name: data.firstName,
      p_last_name: data.lastName,
      p_date_of_birth: data.dateOfBirth,
      p_gender: data.gender,
      p_middle_name: data.middleName
    })

    if (error) {
      console.error('Failed to create student:', error)
      return { error }
    }
    
    return { id: result }
  }

  /**
   * Fetch a single student. RLS will ensure we only see them if they have an active enrollment in a branch we can access.
   */
  static async getStudent(id: string): Promise<{ data?: Student, error?: Error }> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .single()
      
    if (error) return { error }
    return { data }
  }

  /**
   * List all visible students for a specific academic session.
   * We query the enrollments table to ensure the student is actively placed in this session.
   */
  static async listStudents(branchId: string, academicYearId: string): Promise<{ data?: Student[], error?: Error }> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('enrollments')
      .select('students!inner(*)')
      .eq('branch_id', branchId)
      .eq('academic_year_id', academicYearId)
      .eq('status', 'ACTIVE')
      .order('students(last_name)', { ascending: true });
      
    if (error) return { error };
    
    // Flatten the enrollments->students structure
    const studentsData = data.map((e: any) => e.students) as Student[];
    return { data: studentsData };
  }

  /**
   * Create a guardian
   */
  static async createGuardian(
    organizationId: string,
    firstName: string,
    lastName: string
  ): Promise<{ data?: Guardian, error?: Error }> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('guardians')
      .insert({
        organization_id: organizationId,
        first_name: firstName,
        last_name: lastName
      })
      .select()
      .single()
      
    if (error) return { error }
    return { data }
  }

  /**
   * Link an existing guardian to a student
   */
  static async linkGuardianToStudent(
    studentId: string,
    guardianId: string,
    relationship: string
  ): Promise<{ error?: Error }> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('student_guardians')
      .insert({
        student_id: studentId,
        guardian_id: guardianId,
        relationship: relationship
      })
      
    if (error) return { error }
    return {}
  }
}
