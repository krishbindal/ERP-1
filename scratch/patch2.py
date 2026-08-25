import re

with open("supabase/migrations/20260826000000_phase_5_homework.sql", "r") as f:
    sql = f.read()

# Fix staff_branch_profiles profile_id issue
# 1. create_homework_assignment
sql = sql.replace(
    """    SELECT id INTO v_author_profile_id
    FROM public.staff_branch_profiles
    WHERE profile_id = auth.uid() AND branch_id = p_branch_id AND status = 'ACTIVE';""",
    """    SELECT sbp.id INTO v_author_profile_id
    FROM public.staff_branch_profiles sbp
    JOIN public.staff s ON sbp.staff_id = s.id
    WHERE s.profile_id = auth.uid() AND sbp.branch_id = p_branch_id AND sbp.status = 'ACTIVE';"""
)

# 2. grade_submission
sql = sql.replace(
    """    SELECT id INTO v_grader_profile_id FROM public.staff_branch_profiles
    WHERE profile_id = auth.uid() AND branch_id = v_assignment.branch_id AND status = 'ACTIVE';""",
    """    SELECT sbp.id INTO v_grader_profile_id FROM public.staff_branch_profiles sbp
    JOIN public.staff s ON sbp.staff_id = s.id
    WHERE s.profile_id = auth.uid() AND sbp.branch_id = v_assignment.branch_id AND sbp.status = 'ACTIVE';"""
)

# 3. return_submission
# (actually the replace above should catch both if the text matches exactly, let's check)

with open("supabase/migrations/20260826000000_phase_5_homework.sql", "w") as f:
    f.write(sql)
