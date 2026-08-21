import re

with open('apps/web/src/app/scheduling/substitutions/actions.ts', 'r') as f:
    content = f.read()

replacement = '''
  let supabase: any;
  let branch_id: string;

  try {
    const ctx = await getBranchContextClient(explicitBranchId);
    supabase = ctx.supabase;
    branch_id = ctx.branch_id;
  } catch (e) {
    return { error: (e as Error).message };
  }
'''

content = content.replace("import { getSchedulingContext } from '../lib/scheduling-context';", "import { getSchedulingContext, getBranchContextClient } from '../lib/scheduling-context';")

pattern = re.compile(r"  const supabase = await createClient\(\);\n  let branch_id: string;\n\n  try \{\n    branch_id = await getContextBranchId\(explicitBranchId\);\n  \} catch \(e\) \{\n    return \{ error: \(e as Error\)\.message \};\n  \}", re.DOTALL)
content = pattern.sub(replacement.strip('\n'), content)

with open('apps/web/src/app/scheduling/substitutions/actions.ts', 'w') as f:
    f.write(content)
