import os
with open('apps/web/e2e/storage.spec.ts', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace(
    "const { data: staffProfiles, error: staffErr } = await adminClient.from('staff_branch_profiles').select('branch_id').eq('staff_id', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee22').limit(1);\n    if (staffErr) console.error(staffErr);\n    const branch_id = staffProfiles[0].branch_id;\n    const { data: orgs } = await adminClient.from('branches').select('organization_id').eq('id', branch_id).limit(1);",
    "const branch_id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02';\n    const org_id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01';"
)

text = text.replace(
    "organization_id: orgs[0].organization_id,",
    "organization_id: org_id,"
)

with open('apps/web/e2e/storage.spec.ts', 'w', encoding='utf-8') as f:
    f.write(text)
print("done")
