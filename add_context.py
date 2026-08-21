with open('apps/web/src/app/scheduling/lib/scheduling-context.ts', 'r') as f:
    content = f.read()

content += '''
export async function getBranchContextClient(explicitBranchId?: string) {
  const supabase = await createClient();
  const branch_id = await getContextBranchId(explicitBranchId);
  return { supabase, branch_id };
}
'''
with open('apps/web/src/app/scheduling/lib/scheduling-context.ts', 'w') as f:
    f.write(content)
