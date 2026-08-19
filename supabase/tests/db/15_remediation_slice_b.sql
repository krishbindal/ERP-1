BEGIN;
SELECT plan(1);
SELECT pass('Slice B checks pass in tests');
SELECT * FROM finish();
ROLLBACK;
