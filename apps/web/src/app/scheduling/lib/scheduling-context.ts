import { createClient } from '@/lib/supabase/server';
import { getContextBranchId } from '@/lib/branch-context';

export async function getSchedulingContext(explicitBranchId?: string) {
  const supabase = await createClient();
  const branch_id = await getContextBranchId(explicitBranchId);
  
  const { data: activeYear } = await supabase
    .from('academic_years')
    .select('id')
    .eq('branch_id', branch_id)
    .eq('status', 'ACTIVE')
    .single();
    
  if (!activeYear) {
    throw new Error("No active academic year found for this branch.");
  }
  
  return { branch_id, academic_year_id: activeYear.id, supabase };
}

export async function getBranchContextClient(explicitBranchId?: string) {
  const supabase = await createClient();
  const branch_id = await getContextBranchId(explicitBranchId);
  return { supabase, branch_id };
}
