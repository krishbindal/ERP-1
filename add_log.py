import os
with open('apps/web/e2e/storage.spec.ts', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace(
    "const { data: staffProfiles } = await adminClient.from('staff_branch_profiles').select('branch_id').eq('staff_id', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee22').limit(1);",
    "const { data: staffProfiles, error: staffErr } = await adminClient.from('staff_branch_profiles').select('branch_id').eq('staff_id', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee22').limit(1);\n    if (staffErr) console.error(staffErr);"
)

with open('apps/web/e2e/storage.spec.ts', 'w', encoding='utf-8') as f:
    f.write(text)
print("done")
