import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// --- ADAPTER INTERFACES ---

interface DeliveryResult {
  success: boolean;
  provider_message_id: string | null;
  error_details: any;
}

interface EmailAdapter {
  send(email: string, subject: string, body: string): Promise<DeliveryResult>;
}

interface PushAdapter {
  send(token: string, title: string, body: string): Promise<DeliveryResult>;
}

// --- MOCK ADAPTERS ---

class MockEmailAdapter implements EmailAdapter {
  async send(email: string, subject: string, body: string): Promise<DeliveryResult> {
    if (email.includes("fail")) {
      return { success: false, provider_message_id: null, error_details: { code: "MOCK_FAIL", message: "Simulated failure" } };
    }
    return { success: true, provider_message_id: `mock-email-${crypto.randomUUID()}`, error_details: null };
  }
}

class MockPushAdapter implements PushAdapter {
  async send(token: string, title: string, body: string): Promise<DeliveryResult> {
    if (token.includes("invalid")) {
      return { success: false, provider_message_id: null, error_details: { code: "MOCK_FAIL", message: "Invalid token" } };
    }
    return { success: true, provider_message_id: `mock-push-${crypto.randomUUID()}`, error_details: null };
  }
}

// --- PRODUCTION ADAPTERS ---

class ProductionEmailAdapter implements EmailAdapter {
  async send(email: string, subject: string, body: string): Promise<DeliveryResult> {
    // Awaiting Upstream Integration
    throw new Error("ProductionEmailAdapter pending third-party connection. Awaiting Upstream Integration.");
  }
}

class ProductionPushAdapter implements PushAdapter {
  async send(token: string, title: string, body: string): Promise<DeliveryResult> {
    // Awaiting Upstream Integration
    throw new Error("ProductionPushAdapter pending third-party connection. Awaiting Upstream Integration.");
  }
}

// --- FACTORY ---
function getEmailAdapter(): EmailAdapter {
  // Fail closed. Production never silently falls back to mocks.
  const useMock = Deno.env.get("USE_MOCK_PROVIDERS") === "true";
  return useMock ? new MockEmailAdapter() : new ProductionEmailAdapter();
}

function getPushAdapter(): PushAdapter {
  // Fail closed. Production never silently falls back to mocks.
  const useMock = Deno.env.get("USE_MOCK_PROVIDERS") === "true";
  return useMock ? new MockPushAdapter() : new ProductionPushAdapter();
}

// --- WORKER LOGIC ---

Deno.serve(async (req) => {
  const authHeader = req.headers.get("Authorization");
  const expectedKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
  }

  if (authHeader !== `Bearer ${expectedKey}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    expectedKey ?? "",
    { auth: { persistSession: false } }
  );

  const BATCH_SIZE = 10;
  
  try {
    // 1. Claim Events (SQL now handles PROCESSING timeout/recovery)
    const { data: events, error: claimError } = await supabase.rpc("rpc_claim_platform_events", {
      p_batch_size: BATCH_SIZE
    });

    if (claimError) {
      console.error("Claim error:", claimError);
      throw claimError;
    }
    
    if (!events || events.length === 0) {
      return new Response(JSON.stringify({ message: "No events to process" }), { status: 200 });
    }

    const emailAdapter = getEmailAdapter();
    const pushAdapter = getPushAdapter();

    for (const event of events) {
      if (event.event_type === "message.queued") {
        // 2. Prepare/Resolve Recipients
        const { data: recipients, error: resolveError } = await supabase.rpc("rpc_prepare_message_dispatch", {
          p_event_id: event.id
        });

        if (resolveError) {
          console.error("Resolve error for event:", event.id, resolveError);
          // If we can't resolve, mark as failed/DLQ immediately.
          await supabase.rpc("rpc_finalize_event", {
            p_event_id: event.id,
            p_all_recipients_success: false
          });
          continue;
        }

        let allSuccess = true;

        if (!recipients || recipients.length === 0) {
          // Empty recipient semantics: Do not silently convert 0 recipients to success.
          allSuccess = false;
        }

        // Fetch message subject/body
        const { data: messageData, error: msgError } = await supabase
          .from('communication_messages')
          .select('subject, body')
          .eq('id', event.payload.message_id)
          .single();

        const subject = messageData?.subject || 'No Subject';
        const body = messageData?.body || 'No Body';

        if (msgError) {
            console.error("Failed to fetch message details", msgError);
            allSuccess = false;
        } else if (recipients && recipients.length > 0) {
            // 3. Process Deliveries
            for (const recipient of recipients) {
                let recipientSuccess = true;
                
                // For now, V1 always sends email if available.
                if (recipient.email) {
                    try {
                        const emailResult = await emailAdapter.send(recipient.email, subject, body);
                        const { error: recordError } = await supabase.rpc("rpc_record_delivery_attempt", {
                            p_event_id: event.id,
                            p_recipient_id: recipient.v_recipient_id,
                            p_channel: "EMAIL",
                            p_provider: emailResult.provider_message_id?.startsWith('mock-') ? 'MOCK_EMAIL' : 'PROD_EMAIL',
                            p_success: emailResult.success,
                            p_provider_message_id: emailResult.provider_message_id,
                            p_error_details: emailResult.error_details
                        });
                        if (!emailResult.success || recordError) recipientSuccess = false;
                    } catch (e: any) {
                        recipientSuccess = false;
                        await supabase.rpc("rpc_record_delivery_attempt", {
                            p_event_id: event.id,
                            p_recipient_id: recipient.v_recipient_id,
                            p_channel: "EMAIL",
                            p_provider: "UNKNOWN",
                            p_success: false,
                            p_provider_message_id: null,
                            p_error_details: { error: e.message }
                        });
                    }
                }

                if (recipient.push_token) {
                    try {
                        const pushResult = await pushAdapter.send(recipient.push_token, subject, body);
                        const { error: recordError2 } = await supabase.rpc("rpc_record_delivery_attempt", {
                            p_event_id: event.id,
                            p_recipient_id: recipient.v_recipient_id,
                            p_channel: "PUSH",
                            p_provider: pushResult.provider_message_id?.startsWith('mock-') ? 'MOCK_PUSH' : 'PROD_PUSH',
                            p_success: pushResult.success,
                            p_provider_message_id: pushResult.provider_message_id,
                            p_error_details: pushResult.error_details
                        });
                        if (!pushResult.success || recordError2) recipientSuccess = false;
                    } catch (e: any) {
                        recipientSuccess = false;
                        await supabase.rpc("rpc_record_delivery_attempt", {
                            p_event_id: event.id,
                            p_recipient_id: recipient.v_recipient_id,
                            p_channel: "PUSH",
                            p_provider: "UNKNOWN",
                            p_success: false,
                            p_provider_message_id: null,
                            p_error_details: { error: e.message }
                        });
                    }
                }

                if (!recipientSuccess) {
                    allSuccess = false;
                }
            }
        }

        // 4. Finalize Event Status
        await supabase.rpc("rpc_finalize_event", {
            p_event_id: event.id,
            p_all_recipients_success: allSuccess
        });
      }
    }

    return new Response(JSON.stringify({ processed: events.length }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    console.error("Worker error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
