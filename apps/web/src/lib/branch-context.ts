import { createClient } from './supabase/server';

export async function getCurrentAppBranch(): Promise<{ id: string, name: string } | null> {
  const supabase = await createClient();
  const { data: user, error: authError } = await supabase.auth.getUser();

  if (authError || !user?.user?.id) {
    return null;
  }

  const { data: memberships, error: membershipError } = await supabase
    .from('branch_memberships')
    .select('branch_id, branches(name)')
    .eq('user_id', user.user.id);

  if (membershipError) {
    throw new Error(membershipError.message);
  }

  if (!memberships || memberships.length === 0) {
    // Check if user is Super Admin
    if (user.user.app_metadata?.is_super_admin === true) {
      const { data: orgMembership } = await supabase
        .from('organization_memberships')
        .select('organization_id')
        .eq('user_id', user.user.id)
        .maybeSingle();

      if (orgMembership) {
        const { data: branch } = await supabase
          .from('branches')
          .select('id, name')
          .eq('organization_id', orgMembership.organization_id)
          .limit(1)
          .maybeSingle();
        
        if (branch) {
          return { id: branch.id, name: branch.name };
        }
      }
    }
    return null;
  }
  
  const branch = (memberships[0] as unknown as { branches: { name: string } }).branches;
  return {
    id: memberships[0].branch_id,
    name: branch?.name || 'Unknown Branch'
  };
}
