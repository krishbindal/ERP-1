with open('apps/web/src/app/scheduling/timetable/actions.ts', 'r') as f:
    content = f.read()

replacement = '''import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { mapDatabaseError } from '@/lib/db-error-mapper';
import { getContextBranchId } from '@/lib/branch-context';
import { getSchedulingContext } from '../lib/scheduling-context';

export async function createTimetableEntry(
  data: {
    class_id: string;
    section_id: string;
    subject_id: string;
    period_id: string;
    room_id: string;
    staff_branch_profile_id: string;
    day_of_week: number;
    status: string;
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

  const { error } = await supabase.from('timetable_entries').insert({
    ...data,
    branch_id,
    academic_year_id,
  });

  if (error) { console.error("Timetable mutation error:", error); return { error: mapDatabaseError(error) }; }
  revalidatePath('/scheduling/timetable');
  return { success: true };
}'''

# Extract the block to replace
import re
pattern = re.compile(r"import \{ createClient \}.*?return \{ success: true \};\n\}", re.DOTALL)
content = pattern.sub(replacement, content)

with open('apps/web/src/app/scheduling/timetable/actions.ts', 'w') as f:
    f.write(content)
