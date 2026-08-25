with open('supabase/tests/database/09_communication.test.sql', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("SELECT has_function('public', 'fn_resolve_message_recipients', ARRAY['uuid'], 'Canonical recipient resolution exists');",
"""SELECT has_function('public', 'fn_resolve_message_recipients', ARRAY['uuid'], 'Canonical recipient resolution exists');
SELECT function_privs_are('public', 'fn_resolve_message_recipients', ARRAY['uuid'], 'authenticated', ARRAY[]::text[], 'Authenticated cannot resolve recipients directly');
SELECT function_privs_are('public', 'rpc_process_scheduled_messages', ARRAY[]::text[], 'authenticated', ARRAY[]::text[], 'Authenticated cannot process scheduled messages directly');
""")

with open('supabase/tests/database/09_communication.test.sql', 'w', encoding='utf-8') as f:
    f.write(text)
