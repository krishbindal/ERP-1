const { execSync } = require('child_process');
const { createClient } = require('@supabase/supabase-js');
const assert = require('assert');

let statusJson;
try {
  const output = execSync('npx --no-install supabase status -o json', { stdio: ['pipe', 'pipe', 'ignore'] }).toString();
  const jsonMatch = output.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found");
  statusJson = JSON.parse(jsonMatch[0]);
} catch (error) {
  console.error("Failed to run supabase status.");
  process.exit(1);
}

const supabaseUrl = statusJson.API_URL;
const supabaseKey = statusJson.SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
  realtime: { transport: class NoopWS { constructor() {} close() {} send() {} addEventListener() {} removeEventListener() {} } }
});
const workerUrl = supabaseUrl + '/functions/v1/communication-worker';

async function invokeWorker(authHeader) {
  return fetch(workerUrl, { method: 'POST', headers: authHeader ? { 'Authorization': authHeader } : undefined });
}

let assertionsCount = 0;
function ok(condition, message) {
  assert.ok(condition, message);
  assertionsCount++;
}
function strictEqual(actual, expected, message) {
  assert.strictEqual(actual, expected, message);
  assertionsCount++;
}

async function runTests() {
  console.log('--- A. HTTP/Security ---');
  let res = await fetch(workerUrl, { method: 'GET' });
  strictEqual(res.status, 405, 'Expected 405 Method Not Allowed');
  res = await invokeWorker(null);
  strictEqual(res.status, 401, 'Expected 401 Missing Auth');
  res = await invokeWorker('Bearer invalid_token');
  strictEqual(res.status, 401, 'Expected 401 Invalid Auth');
  res = await invokeWorker('Bearer ' + supabaseKey);
  strictEqual(res.status, 200, 'Expected 200 Valid Auth');

  console.log('--- B. Claim lifecycle, Recipient Resolution, Successful Delivery & Attempt Recording ---');
  await supabase.from('platform_events').delete().neq('status', 'DO_NOT_DELETE');

  const { data: msg } = await supabase.from('communication_messages').insert({
      organization_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01',
      branch_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02',
      sender_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeea003',
      subject: 'Worker Runtime Subject', body: 'Body', status: 'QUEUED'
  }).select('id').single();

  await supabase.from('communication_message_targets').insert({
      message_id: msg.id, target_type: 'CLASS', target_id: 'aaaaaaaa-2222-2222-2222-222222222222'
  });
  
  const { data: ev1Data } = await supabase.from('platform_events').insert({
    organization_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01',
    branch_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02',
    aggregate_type: 'communication_message', aggregate_id: msg.id,
    event_type: 'message.queued', payload: { message_id: msg.id }, status: 'PENDING',
    idempotency_key: msg.id + '_q1'
  }).select('id').single();
  
  await invokeWorker('Bearer ' + supabaseKey);
  const { data: ev1 } = await supabase.from('platform_events').select('*').eq('id', ev1Data.id).single();
  // Diagnostic output before assertion
  console.log("=== DIAGNOSTIC START ===");
  console.log("event_id:", ev1.id);
  console.log("platform_events.status:", ev1.status);
  console.log("platform_events.attempts:", ev1.attempts);
  console.log("platform_events.next_retry_at:", ev1.next_retry_at);
  console.log("platform_events.last_error:", ev1.last_error);
  console.log("message_id:", ev1.payload.message_id);
  
  const { data: recips } = await supabase.from('communication_recipients').select('*').eq('message_id', ev1.payload.message_id);
  console.log("recipient count:", recips?.length);
  
  const { data: attemptsDiag } = await supabase.from('communication_delivery_attempts').select('id, recipient_id, channel, attempt_number, provider_message_id, error_details, success_delivery_timestamp').eq('platform_event_id', ev1.id);
  console.log("delivery_attempt count:", attemptsDiag?.length);
  console.log("delivery_attempt rows:", JSON.stringify(attemptsDiag, null, 2));
  console.log("=== DIAGNOSTIC END ===");

  ok(ev1.status === 'COMPLETED', 'Status is COMPLETED');

  // Verify recipient resolution
  const { data: recipients } = await supabase.from('communication_recipients').select('*').eq('message_id', msg.id);
  ok(recipients && recipients.length > 0, 'Recipients were resolved');
  
  // Verify delivery and attempt recording
  const { data: attempts } = await supabase.from('communication_delivery_attempts').select('*').eq('platform_event_id', ev1.id);
  ok(attempts && attempts.length > 0, 'Delivery attempts were recorded');
  ok(attempts[0].success_delivery_timestamp !== null, 'Delivery was marked successful');

  console.log('--- F. Transient Failure, Retry & H. DLQ ---');
  const { data: failUser } = await supabase.auth.admin.createUser({ email: 'fail@test.com', password: 'password123', email_confirm: true });
  const fId = failUser?.user?.id || 'eeeeeeee-eeee-eeee-eeee-eeeeeeeea999';
  const { error: profileErr } = await supabase.from('profiles').upsert({ id: fId, first_name: 'Fail', last_name: 'Fail' });
  if (profileErr) throw profileErr;
  
  // Enroll the fail user so fn_resolve_message_recipients finds them
  const { data: failStudent, error: studentErr } = await supabase.from('students').upsert({
    id: fId, profile_id: fId,
    organization_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01',
    first_name: 'Fail', last_name: 'Fail', status: 'ACTIVE'
  }, { onConflict: 'id' }).select('id').single();
  if (studentErr) throw new Error("Section F: failed to create students: " + JSON.stringify(studentErr));
  const failStudentId = failStudent?.id || fId;
  
  const { data: failSbp, error: sbpErr } = await supabase.from('student_branch_profiles').upsert({
    id: fId, student_id: failStudentId,
    branch_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02'
  }, { onConflict: 'id' }).select('id').single();
  if (sbpErr) throw new Error("Section F: failed to create student_branch_profiles: " + JSON.stringify(sbpErr));
  const failSbpId = failSbp?.id || fId;

  // Enroll in the same class used in Section B (from seed data)
  const activeAYId = 'aaaaaaaa-1111-1111-1111-111111111111';
  
  const { error: enrollErr } = await supabase.from('enrollments').upsert({
    id: fId,
    student_id: failStudentId,
    student_branch_profile_id: failSbpId,
    academic_year_id: activeAYId,
    class_id: 'aaaaaaaa-2222-2222-2222-222222222222',
    section_id: 'aaaaaaaa-3333-3333-3333-333333333333',
    branch_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02',
    organization_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01',
    status: 'ACTIVE'
  }, { onConflict: 'id' });
  if (enrollErr) throw new Error("Section F: failed to create enrollments: " + JSON.stringify(enrollErr));

  const { data: msgFail } = await supabase.from('communication_messages').insert({
      organization_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01',
      branch_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02',
      sender_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeea003',
      subject: 'Fail', body: 'Fail', status: 'QUEUED'
  }).select('id').single();
  
  // Add message target so fn_resolve_message_recipients finds the fail user
  await supabase.from('communication_message_targets').insert({
    message_id: msgFail.id, target_type: 'CLASS', target_id: 'aaaaaaaa-2222-2222-2222-222222222222'
  });
  
  const { data: evFailData } = await supabase.from('platform_events').insert({
    organization_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01',
    branch_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02',
    aggregate_type: 'communication_message', aggregate_id: msgFail.id,
    event_type: 'message.queued', payload: { message_id: msgFail.id }, status: 'PENDING',
    idempotency_key: msgFail.id + '_q2'
  }).select('id').single();
  const eventId2 = evFailData.id;
  
  await invokeWorker('Bearer ' + supabaseKey);
  // Give the worker time to fully process
  await new Promise(r => setTimeout(r, 2000));
  const { data: ev2 } = await supabase.from('platform_events').select('*').eq('id', eventId2).single();
  
  console.log("=== SECTION F DIAGNOSTIC ===");
  console.log("ev2.status:", ev2.status, "ev2.attempts:", ev2.attempts);
  const { data: fRecips } = await supabase.from('communication_recipients').select('*').eq('message_id', msgFail.id);
  console.log("fail recipients count:", fRecips?.length, "statuses:", fRecips?.map(r => r.status));
  const { data: fAttemptsDiag } = await supabase.from('communication_delivery_attempts').select('*').eq('platform_event_id', eventId2);
  console.log("fail delivery attempts count:", fAttemptsDiag?.length);
  console.log("=== END SECTION F DIAGNOSTIC ===");
  
  strictEqual(ev2.status, 'PENDING', 'Event is PENDING after 1 failure');
  ok(ev2.attempts >= 1, 'Attempts incremented');
  
  // Find the specific communication_recipients row for the failUser
  const { data: failRecipRow } = await supabase.from('communication_recipients').select('id, status').eq('message_id', msgFail.id).eq('recipient_id', fId).single();
  strictEqual(failRecipRow.status, 'FAILED', 'Fail user recipient status should be FAILED');
  
  // Verify attempt recorded but NOT successful for the failUser specifically
  const { data: failAttempts1 } = await supabase.from('communication_delivery_attempts').select('*').eq('platform_event_id', eventId2).eq('recipient_id', failRecipRow.id);
  ok(failAttempts1 && failAttempts1.length > 0, 'Failed delivery attempt recorded');
  ok(failAttempts1[0].success_delivery_timestamp === null, 'Delivery was not successful');

  // Verify the OTHER recipient (guardian) succeeded (Partial failure test)
  const { data: successRecips } = await supabase.from('communication_recipients').select('id, status').eq('message_id', msgFail.id).neq('recipient_id', fId);
  if (successRecips && successRecips.length > 0) {
      strictEqual(successRecips[0].status, 'SENT', 'Other recipient should have succeeded');
  }

  // Fast forward to max attempts for DLQ
  await supabase.from('platform_events').update({
    attempts: 4, next_retry_at: new Date(Date.now() - 10000).toISOString()
  }).eq('id', eventId2);
  
  await invokeWorker('Bearer ' + supabaseKey);
  const { data: ev2DLQ } = await supabase.from('platform_events').select('*').eq('id', eventId2).single();
  strictEqual(ev2DLQ.status, 'DLQ', 'Status reached DLQ');

  console.log('--- G. Lease Recovery ---');
  const { data: msgLease } = await supabase.from('communication_messages').insert({
      organization_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01',
      branch_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02',
      sender_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeea003',
      subject: 'Lease', body: 'Lease', status: 'QUEUED'
  }).select('id').single();
  
  await supabase.from('communication_message_targets').insert({
    message_id: msgLease.id, target_type: 'CLASS', target_id: 'aaaaaaaa-2222-2222-2222-222222222222'
  });
  
  const { data: evLeaseData } = await supabase.from('platform_events').insert({
    organization_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01',
    aggregate_type: 'communication_message', aggregate_id: msgLease.id,
    event_type: 'message.queued', payload: { message_id: msgLease.id }, status: 'PROCESSING',
    next_retry_at: new Date(Date.now() - 10000).toISOString(),
    idempotency_key: msgLease.id + '_qL'
  }).select('id').single();
  
  await invokeWorker('Bearer ' + supabaseKey);
  const { data: evLease } = await supabase.from('platform_events').select('*').eq('id', evLeaseData.id).single();
  ok(evLease.status === 'COMPLETED' || evLease.status === 'PENDING', 'Leased event was recovered and processed');

  console.log('--- K. Partial Failure ---');
  // Section F already thoroughly tested partial failure implicitly because of the seed guardian.
  // We will run this explicit one too by just using the same target.
  const { data: msgPart } = await supabase.from('communication_messages').insert({
      organization_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01',
      branch_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02',
      sender_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeea003',
      subject: 'Part', body: 'Part', status: 'QUEUED'
  }).select('id').single();
  
  await supabase.from('communication_message_targets').insert({
    message_id: msgPart.id, target_type: 'CLASS', target_id: 'aaaaaaaa-2222-2222-2222-222222222222'
  });
  
  const { data: evPartData } = await supabase.from('platform_events').insert({
    organization_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01',
    aggregate_type: 'communication_message', aggregate_id: msgPart.id,
    event_type: 'message.queued', payload: { message_id: msgPart.id }, status: 'PENDING',
    idempotency_key: msgPart.id + '_qP'
  }).select('id').single();
  
  await invokeWorker('Bearer ' + supabaseKey);
  const { data: evPart } = await supabase.from('platform_events').select('*').eq('id', evPartData.id).single();
  strictEqual(evPart.status, 'PENDING', 'Partial failure results in PENDING for retry');
  
  const { data: partAttempts } = await supabase.from('communication_delivery_attempts')
    .select('*, communication_recipients!inner(recipient_id)')
    .eq('platform_event_id', evPartData.id);
  
  const successAttempt = partAttempts.find(a => a.communication_recipients.recipient_id !== fId);
  const failAttempt = partAttempts.find(a => a.communication_recipients.recipient_id === fId);
  ok(successAttempt && successAttempt.success_delivery_timestamp !== null, 'Success recipient delivered');
  ok(failAttempt && failAttempt.success_delivery_timestamp === null, 'Fail recipient failed');

  console.log('--- I. Idempotency & J. Concurrency ---');
  const { data: msgIdemp } = await supabase.from('communication_messages').insert({
      organization_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01',
      branch_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02',
      sender_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeea003',
      subject: 'Idemp', body: 'Idemp', status: 'QUEUED'
  }).select('id').single();
  
  await supabase.from('communication_message_targets').insert({
    message_id: msgIdemp.id, target_type: 'CLASS', target_id: 'aaaaaaaa-2222-2222-2222-222222222222'
  });
  
  const { data: ev3Data } = await supabase.from('platform_events').insert({
    organization_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01',
    aggregate_type: 'communication_message', aggregate_id: msgIdemp.id,
    event_type: 'message.queued', payload: { message_id: msgIdemp.id }, status: 'PENDING',
    next_retry_at: new Date(Date.now() - 10000).toISOString(),
    idempotency_key: msgIdemp.id + '_q3'
  }).select('id').single();
  
  await Promise.all([
    invokeWorker('Bearer ' + supabaseKey),
    invokeWorker('Bearer ' + supabaseKey)
  ]);
  const { data: ev3 } = await supabase.from('platform_events').select('*').eq('id', ev3Data.id).single();
  ok(ev3.attempts <= 1, 'Event processed concurrently exactly once');

  console.log('Worker Runtime Certification completed successfully.');
  console.log('Total assertions passed: ' + assertionsCount);
}

runTests().catch(e => { console.error(e); process.exit(1); });
