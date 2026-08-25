import os
with open('supabase/migrations/20260827000035_phase_5_communication_rpc_fix.sql', 'a', encoding='utf-8') as f:
    f.write("\nGRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;\n")
print("done")
