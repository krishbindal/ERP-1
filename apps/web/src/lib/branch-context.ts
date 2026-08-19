import { createClient } from './supabase/server';

export async function getCurrentAppBranch(): Promise<{ id: string, name: string } | null> {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();

  if (!user?.user?.id) {
    return null;
  }

  const { data: memberships } = await supabase
    .from('branch_memberships')
    .select('branch_id, branches(name)')
    .eq('user_id', user.user.id)
    .limit(1);

  if (memberships && memberships.length > 0) {
    const branch = (memberships[0] as unknown as { branches: { name: string } }).branches;
    return {
      id: memberships[0].branch_id,
      name: branch?.name || 'Unknown Branch'
    };
  }

  return null;
}
