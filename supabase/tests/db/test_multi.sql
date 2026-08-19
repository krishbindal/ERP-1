BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(1);
SELECT throws_ok(
    $$ SELECT set_config('request.jwt.claims', '{"sub": "123"}', true); SELECT 1/0; $$,
    '22012',
    'division by zero',
    'Multi-statement works'
);
SELECT * FROM finish();
ROLLBACK;
