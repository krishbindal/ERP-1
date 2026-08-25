import os

with open('apps/web/e2e/storage.spec.ts', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("const { data: branches } = await supabase.from('branches').select('id').limit(1);",
"""const { data: staffProfiles } = await supabase.from('staff_branch_profiles').select('branch_id').eq('staff_id', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee22').limit(1);
    const branch_id = staffProfiles[0].branch_id;
    const { data: classes } = await supabase.from('classes').select('id').eq('branch_id', branch_id).limit(1);""")

text = text.replace("p_branch_id: branches[0].id,", "p_branch_id: branch_id,")

with open('apps/web/e2e/storage.spec.ts', 'w', encoding='utf-8') as f:
    f.write(text)
print("done")
