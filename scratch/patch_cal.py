import re

with open("supabase/migrations/20260825000000_phase_5_attendance.sql", "r") as f:
    sql = f.read()

# I want to inject the calendar logic right after `IF NOT public.auth_user_has_branch_permission(...) THEN ... END IF;` in `rpc_save_attendance`

calendar_logic = """
    -- Calendar and Academic Year bounds validation
    DECLARE
        v_operating_days INTEGER[];
        v_override_instructional BOOLEAN;
        v_is_instructional BOOLEAN;
        v_ay_start DATE;
        v_ay_end DATE;
    BEGIN
        SELECT operating_days, start_date, end_date INTO v_operating_days, v_ay_start, v_ay_end
        FROM public.academic_years
        WHERE id = p_academic_year_id AND branch_id = p_branch_id;

        IF v_operating_days IS NULL THEN
            RAISE EXCEPTION 'Academic year not found in branch';
        END IF;

        IF p_date < v_ay_start OR p_date > v_ay_end THEN
            RAISE EXCEPTION 'Date is outside academic year';
        END IF;

        SELECT is_instructional INTO v_override_instructional
        FROM public.calendar_events
        WHERE academic_year_id = p_academic_year_id
          AND p_date >= start_date AND p_date <= end_date
          AND status = 'ACTIVE'
        ORDER BY 
          is_instructional ASC,
          (end_date - start_date) ASC,
          id ASC
        LIMIT 1;

        IF v_override_instructional IS NOT NULL THEN
            v_is_instructional := v_override_instructional;
        ELSE
            v_is_instructional := EXTRACT(ISODOW FROM p_date) = ANY(v_operating_days);
        END IF;

        IF NOT v_is_instructional THEN
            RAISE EXCEPTION 'Cannot record attendance on a non-instructional day';
        END IF;
    END;
"""

new_sql = sql.replace(
    """    IF NOT public.auth_user_has_branch_permission(p_branch_id, 'attendance.session.manage') THEN
        RAISE EXCEPTION 'Not authorized to manage attendance in this branch';
    END IF;""",
    """    IF NOT public.auth_user_has_branch_permission(p_branch_id, 'attendance.session.manage') THEN
        RAISE EXCEPTION 'Not authorized to manage attendance in this branch';
    END IF;
""" + calendar_logic
)

with open("supabase/migrations/20260825000000_phase_5_attendance.sql", "w") as f:
    f.write(new_sql)
