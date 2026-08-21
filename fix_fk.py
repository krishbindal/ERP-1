with open('supabase/migrations/20260823000000_group_2c_scheduling_hardening.sql', 'r') as f:
    content = f.read()

content += "\n\n-- 4. FIX POSTGREST JOINS FOR TIMETABLE_ENTRIES\n-- ==========================================\n"
content += "ALTER TABLE public.timetable_entries\n"
content += "  ADD CONSTRAINT fk_timetable_class\n"
content += "  FOREIGN KEY (class_id, academic_year_id, branch_id)\n"
content += "  REFERENCES public.classes(id, academic_year_id, branch_id)\n"
content += "  ON DELETE RESTRICT;\n"

with open('supabase/migrations/20260823000000_group_2c_scheduling_hardening.sql', 'w') as f:
    f.write(content)
