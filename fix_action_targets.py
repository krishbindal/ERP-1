import os

with open('apps/web/src/app/communication/actions.ts', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("""p_organization_id: org_id,
      p_branch_id: branch_id,
      p_type: 'ANNOUNCEMENT',
      p_subject: subject,
      p_body: body,
      p_scheduled_for: null,
      p_expires_at: null""",
"""p_branch_id: branch_id,
      p_type: 'ANNOUNCEMENT',
      p_subject: subject,
      p_body: body,
      p_targets: [{ target_type: 'BRANCH', target_id: null }],
      p_scheduled_for: null,
      p_expires_at: null""")

with open('apps/web/src/app/communication/actions.ts', 'w', encoding='utf-8') as f:
    f.write(text)
print("done")
