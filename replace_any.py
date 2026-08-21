import re

def refactor_action_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # We want to change:
    # let supabase: any;
    # let branch_id: string;
    # (and academic_year_id)
    # try { ... } catch (e) { return ... }
    # const { error } = await supabase...
    # if (error) return ...
    # return { success: true }
    
    # Actually, replacing "any" with "Awaited<ReturnType<typeof getBranchContextClient>>['supabase']" is much easier and safer.
    
    content = content.replace('let supabase: any;', "let supabase: Awaited<ReturnType<typeof getBranchContextClient>>['supabase'];")

    with open(filepath, 'w') as f:
        f.write(content)

refactor_action_file('apps/web/src/app/scheduling/timetable/actions.ts')
refactor_action_file('apps/web/src/app/scheduling/substitutions/actions.ts')
refactor_action_file('apps/web/src/app/scheduling/actions.ts')
