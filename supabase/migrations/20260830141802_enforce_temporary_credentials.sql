-- Migration: enforce_temporary_credentials

-- 1. Read function for middleware
CREATE OR REPLACE FUNCTION public.requires_password_reset()
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
    SELECT COALESCE(
        (SELECT force_password_reset 
         FROM public.user_credentials 
         WHERE profile_id = auth.uid()
         LIMIT 1), 
        false
    );
$$;

-- 2. Clear function after successful reset
CREATE OR REPLACE FUNCTION public.clear_password_reset_flag()
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.user_credentials
    SET force_password_reset = false,
        updated_at = now()
    WHERE profile_id = auth.uid();
END;
$$;

GRANT EXECUTE ON FUNCTION public.requires_password_reset() TO authenticated;
GRANT EXECUTE ON FUNCTION public.clear_password_reset_flag() TO authenticated;
