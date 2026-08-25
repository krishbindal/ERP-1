import re

with open("supabase/migrations/20260826000000_phase_5_homework.sql", "r") as f:
    sql = f.read()

# Remove homework_events completely
sql = re.sub(r'CREATE TABLE public\.homework_events \([\s\S]*?\);\nALTER TABLE public\.homework_events ENABLE ROW LEVEL SECURITY;\n', '', sql)

# Add it after homework_audit_logs RLS enabling
event_table = """
CREATE TABLE public.homework_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.homework_assignments(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at TIMESTAMPTZ
);
ALTER TABLE public.homework_events ENABLE ROW LEVEL SECURITY;
"""
sql = sql.replace("ALTER TABLE public.homework_audit_logs ENABLE ROW LEVEL SECURITY;", "ALTER TABLE public.homework_audit_logs ENABLE ROW LEVEL SECURITY;\n" + event_table)

with open("supabase/migrations/20260826000000_phase_5_homework.sql", "w") as f:
    f.write(sql)
