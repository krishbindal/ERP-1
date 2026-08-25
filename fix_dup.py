import os
with open('apps/web/e2e/storage.spec.ts', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("    const { data: classes } = await supabase.from('classes').select('id').limit(1);\n", "")

with open('apps/web/e2e/storage.spec.ts', 'w', encoding='utf-8') as f:
    f.write(text)
print("done")
