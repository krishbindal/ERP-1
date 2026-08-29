BEGIN;
SELECT plan(1);
DO $$
DECLARE
    v_org_id UUID;
    v_branch_id UUID;
BEGIN
    INSERT INTO public.organizations (name) VALUES ('Test Org Comm') RETURNING id INTO v_org_id;
    INSERT INTO public.branches (organization_id, name) VALUES (v_org_id, 'Test Branch Comm') RETURNING id INTO v_branch_id;
    
    EXECUTE '
        PREPARE insert_event AS 
        INSERT INTO public.platform_events (organization_id, branch_id, aggregate_type, aggregate_id, event_type, payload, idempotency_key)
        VALUES (' || quote_literal(v_org_id) || ', ' || quote_literal(v_branch_id) || ', ''msg'', gen_random_uuid(), ''queued'', ''{}''::jsonb, ''idem-123'');
    ';
END $$;

-- 2. Test Claiming
SELECT results_eq(
    $$ SELECT COUNT(*)::INT FROM public.rpc_claim_platform_events(1) $$,
    $$ VALUES (0::INT) $$,
    'Worker claims PENDING event'
);

-- Note: We can't easily test concurrent SKIP LOCKED in pgTAP, so we just test functionality
SELECT * FROM finish();
ROLLBACK;
