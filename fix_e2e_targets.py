import os

with open('apps/web/e2e/storage.spec.ts', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("""p_organization_id: orgs[0].id,
      p_branch_id: branches[0].id,
      p_type: 'ANNOUNCEMENT',
      p_subject: 'Test Attachment',
      p_body: 'This is a test',
      p_scheduled_for: null,
      p_expires_at: null""",
"""p_branch_id: branches[0].id,
      p_type: 'ANNOUNCEMENT',
      p_subject: 'Test Attachment',
      p_body: 'This is a test',
      p_targets: [{ target_type: 'BRANCH', target_id: null }],
      p_scheduled_for: null,
      p_expires_at: null""")

with open('apps/web/e2e/storage.spec.ts', 'w', encoding='utf-8') as f:
    f.write(text)
print("done")
