import os

with open('apps/web/e2e/storage.spec.ts', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("""const { data: msg, error: msgErr } = await supabase.from('communication_messages').insert({
      organization_id: orgs[0].id,
      branch_id: branches[0].id,
      sender_id: user.id, // Auth UID is the profile ID
      subject: 'Test Attachment',
      body: 'This is a test',
      status: 'DRAFT',
      type: 'ANNOUNCEMENT'
    }).select('id').single();""",
"""const { data: msgId, error: msgErr } = await supabase.rpc('rpc_create_message', {
      p_organization_id: orgs[0].id,
      p_branch_id: branches[0].id,
      p_type: 'ANNOUNCEMENT',
      p_subject: 'Test Attachment',
      p_body: 'This is a test',
      p_scheduled_for: null,
      p_expires_at: null
    });
    const msg = { id: msgId };
""")

with open('apps/web/e2e/storage.spec.ts', 'w', encoding='utf-8') as f:
    f.write(text)

with open('apps/web/src/app/communication/actions.ts', 'r', encoding='utf-8') as f:
    text = f.read()
text = text.replace("""const { data: msg, error: msgError } = await supabase
    .from('communication_messages')
    .insert({
      organization_id: org_id,
      branch_id: branch_id,
      sender_id: user.id,
      subject,
      body,
      status: 'DRAFT',
      type: 'ANNOUNCEMENT'
    }).select('id').single();""",
"""const { data: msgId, error: msgError } = await supabase.rpc('rpc_create_message', {
      p_organization_id: org_id,
      p_branch_id: branch_id,
      p_type: 'ANNOUNCEMENT',
      p_subject: subject,
      p_body: body,
      p_scheduled_for: null,
      p_expires_at: null
    });
    const msg = { id: msgId };
""")
with open('apps/web/src/app/communication/actions.ts', 'w', encoding='utf-8') as f:
    f.write(text)
print("done")
