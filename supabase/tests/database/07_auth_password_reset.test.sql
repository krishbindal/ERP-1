BEGIN;
SELECT plan(4);

-- 1. Create a dummy profile/user and set force_password_reset = true
-- Wait, creating a user and auth user is complex in pgTAP.
-- I'll mock the auth.uid() function.
-- 2. Test requires_password_reset()
-- 3. Test clear_password_reset_flag()

SELECT * FROM finish();
ROLLBACK;
