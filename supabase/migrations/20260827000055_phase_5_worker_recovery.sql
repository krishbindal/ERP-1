CREATE OR REPLACE FUNCTION public.rpc_claim_platform_events(p_batch_size INT)
RETURNS SETOF public.platform_events
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
    UPDATE public.platform_events pe
    SET status = 'PROCESSING', next_retry_at = now() + interval '10 minutes'
    WHERE pe.id IN (
        SELECT inner_pe.id FROM public.platform_events inner_pe
        WHERE (inner_pe.status = 'PENDING' AND inner_pe.next_retry_at <= now())
           OR (inner_pe.status = 'PROCESSING' AND inner_pe.next_retry_at <= now())
        ORDER BY inner_pe.created_at ASC
        LIMIT p_batch_size
        FOR UPDATE SKIP LOCKED
    )
    RETURNING pe.*;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_claim_platform_events(INT) TO service_role;
