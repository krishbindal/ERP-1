BEGIN;
-- Mock service_role to avoid auth overhead for raw concurrency test
SELECT set_config('role', 'service_role', true);
SELECT set_config('request.jwt.claims', '{"role": "service_role"}', true);

SELECT public.generate_business_identifier(
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02',
    NULL,
    'test_concurrent'
);

-- Simulate transaction work holding the lock (sleep duration passed via var)
SELECT pg_sleep(:sleep_duration);
COMMIT;
