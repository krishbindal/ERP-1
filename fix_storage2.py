with open('supabase/migrations/20260827000035_phase_5_communication_rpc_fix.sql', 'r', encoding='utf-8') as f:
    text = f.read()
text = text.replace('path_tokens[1]', "(string_to_array(name, '/'))[1]")
with open('supabase/migrations/20260827000035_phase_5_communication_rpc_fix.sql', 'w', encoding='utf-8') as f:
    f.write(text)
