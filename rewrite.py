import re

files_and_nouns = [
    ('apps/web/src/app/academic-structure/page.tsx', 'academic structure', 'academic structure'),
    ('apps/web/src/app/admin/app-config/page.tsx', 'app config', 'app config'),
    ('apps/web/src/app/scheduling/page.tsx', 'scheduling structure', 'scheduling structure')
]

for filepath, no_branch_noun, denied_noun in files_and_nouns:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # ensure import
    if 'verifyPageBranchContext' not in content:
        content = content.replace("import { getAppContext, auth_has_org_access }", "import { getAppContext, verifyPageBranchContext }")
        content = content.replace("import { getAppContext } from", "import { getAppContext, verifyPageBranchContext } from")
    
    # Define the block to replace
    # We want to replace everything from "const context = await getAppContext();" 
    # to the end of "if (!isAuthorized) { ... }"
    
    start_pattern = r"const context = await getAppContext\(\);"
    end_pattern = r"if \(!isAuthorized\) \{[\s\S]*?\n  \}"
    
    match_start = re.search(start_pattern, content)
    match_end = re.search(end_pattern, content)
    
    if match_start and match_end:
        start_idx = match_start.start()
        end_idx = match_end.end()
        
        replacement = f'''const {{ branchId, isAuthorized, isReadOnly, errorState }} = await verifyPageBranchContext(explicitBranchId);

  if (errorState === 'NO_CONTEXT') return <div className="text-gray-500">No context available.</div>;
  if (errorState === 'NO_BRANCH_SELECTED') return <div className="text-gray-500">Please select a branch to view its {no_branch_noun}.</div>;
  if (errorState === 'ACCESS_DENIED' || !branchId || !isAuthorized) {{
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">You do not have permission to view this branch&apos;s {denied_noun}.</p>
        </div>
      </div>
    );
  }}'''
        
        content = content[:start_idx] + replacement + content[end_idx:]
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
            print(f"Updated {filepath}")
