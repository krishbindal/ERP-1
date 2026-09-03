-- Harden temporary-credential SECURITY DEFINER functions.

CREATE OR REPLACE FUNCTION public.requires_password_reset()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
    SELECT COALESCE(
        (
            SELECT uc.force_password_reset
            FROM public.user_credentials AS uc
            WHERE uc.profile_id = auth.uid()
            LIMIT 1
        ),
        false
    );
$$;

CREATE OR REPLACE FUNCTION public.clear_password_reset_flag()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    UPDATE public.user_credentials
    SET force_password_reset = false,
        updated_at = now()
    WHERE profile_id = auth.uid();
END;
$$;

REVOKE ALL ON FUNCTION public.requires_password_reset() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.clear_password_reset_flag() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.requires_password_reset() TO authenticated;
GRANT EXECUTE ON FUNCTION public.clear_password_reset_flag() TO authenticated;
