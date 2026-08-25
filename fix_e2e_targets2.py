import os

with open('apps/web/e2e/storage.spec.ts', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("const { data: branches } = await supabase.from('branches').select('id').limit(1);",
"""const { data: branches } = await supabase.from('branches').select('id').limit(1);
    const { data: classes } = await supabase.from('classes').select('id').limit(1);""")

text = text.replace("p_targets: [{ target_type: 'BRANCH', target_id: null }],",
"p_targets: [{ target_type: 'CLASS', target_id: classes[0].id }],")

with open('apps/web/e2e/storage.spec.ts', 'w', encoding='utf-8') as f:
    f.write(text)
print("done")
