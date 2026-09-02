BEGIN;
SELECT set_config('role', 'service_role', true);
SELECT set_config('request.jwt.claims', '{"role": "service_role"}', true);

-- Use thread_id or client_id to use different sequences
SELECT public.generate_business_identifier(
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02',
    NULL,
    'test_concurrent_' || :client_id
);

SELECT pg_sleep(:sleep_duration);
COMMIT;
