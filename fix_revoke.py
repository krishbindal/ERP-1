with open('supabase/migrations/20260827000035_phase_5_communication_rpc_fix.sql', 'r', encoding='utf-8') as f:
    text = f.read()
text = text.replace('REVOKE EXECUTE ON FUNCTION public.fn_resolve_message_recipients(UUID) FROM PUBLIC;',
'REVOKE EXECUTE ON FUNCTION public.fn_resolve_message_recipients(UUID) FROM PUBLIC, authenticated;')
with open('supabase/migrations/20260827000035_phase_5_communication_rpc_fix.sql', 'w', encoding='utf-8') as f:
    f.write(text)

with open('supabase/tests/database/09_communication.test.sql', 'r', encoding='utf-8') as f:
    text = f.read()
text = text.replace('SELECT plan(19);', 'SELECT plan(21);')
with open('supabase/tests/database/09_communication.test.sql', 'w', encoding='utf-8') as f:
    f.write(text)
