with open('apps/web/src/app/scheduling/substitutions/actions.ts', 'r') as f:
    content = f.read()

replacement = '''import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { mapDatabaseError } from '@/lib/db-error-mapper';
import { getContextBranchId } from '@/lib/branch-context';
import { getSchedulingContext } from '../lib/scheduling-context';

export async function createSubstitution(
  data: {
    timetable_entry_id: string;
    substitution_date: string;
    substitute_staff_id: string;
    substitute_room_id?: string | null;
    reason?: string;
  },
  explicitBranchId?: string
) {
  let branch_id: string;
  let academic_year_id: string;
  let supabase: any;

  try {
    const ctx = await getSchedulingContext(explicitBranchId);
    branch_id = ctx.branch_id;
    academic_year_id = ctx.academic_year_id;
    supabase = ctx.supabase;
  } catch (e) {
    return { error: (e as Error).message };
  }

  const { error } = await supabase.from('timetable_substitutions').insert({
    ...data,
    branch_id,
    academic_year_id,
  });

  if (error) { console.error("Substitution mutation error:", error); return { error: mapDatabaseError(error) }; }
  revalidatePath('/scheduling/substitutions');
  return { success: true };
}'''

import re
pattern = re.compile(r"import \{ createClient \}.*?return \{ success: true \};\n\}", re.DOTALL)
content = pattern.sub(replacement, content)

with open('apps/web/src/app/scheduling/substitutions/actions.ts', 'w') as f:
    f.write(content)
