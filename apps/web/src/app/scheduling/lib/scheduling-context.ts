import { SupabaseClient } from '@supabase/supabase-js';

export async function getActiveAcademicYearId(supabase: SupabaseClient, branchId: string): Promise<string> {
  const { data: activeYear } = await supabase
    .from('academic_years')
    .select('id')
    .eq('branch_id', branchId)
    .eq('status', 'ACTIVE')
    .single();
    
  if (!activeYear) {
    throw new Error("No active academic year found for this branch.");
  }
  
  return activeYear.id;
}
