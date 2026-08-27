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
const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
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
  await supabase.from('profiles').insert({ id: fId, first_name: 'Fail', last_name: 'Fail' }).select('id');
  
  const { data: msgFail } = await supabase.from('communication_messages').insert({
      organization_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01',
      branch_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02',
      sender_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeea003',
      subject: 'Fail', body: 'Fail', status: 'QUEUED'
  }).select('id').single();
  
  await supabase.from('communication_recipients').insert({
    message_id: msgFail.id, recipient_id: fId, status: 'QUEUED'
  });
  
  const { data: evFailData } = await supabase.from('platform_events').insert({
    organization_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01',
    aggregate_type: 'communication_message', aggregate_id: msgFail.id,
    event_type: 'message.queued', payload: { message_id: msgFail.id }, status: 'PENDING',
    idempotency_key: msgFail.id + '_q2'
  }).select('id').single();
  const eventId2 = evFailData.id;
  
  await invokeWorker('Bearer ' + supabaseKey);
  const { data: ev2 } = await supabase.from('platform_events').select('*').eq('id', eventId2).single();
  strictEqual(ev2.status, 'PENDING', 'Event is PENDING after 1 failure');
  strictEqual(ev2.attempts, 1, 'Attempts incremented to 1');
  
  // Verify attempt recorded but NOT successful
  const { data: failAttempts1 } = await supabase.from('communication_delivery_attempts').select('*').eq('platform_event_id', eventId2);
  ok(failAttempts1 && failAttempts1.length > 0, 'Failed delivery attempt recorded');
  ok(failAttempts1[0].success_delivery_timestamp === null, 'Delivery was not successful');

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
  const { data: msgPart } = await supabase.from('communication_messages').insert({
      organization_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01',
      branch_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02',
      sender_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeea003',
      subject: 'Part', body: 'Part', status: 'QUEUED'
  }).select('id').single();
  
  const { data: successUser } = await supabase.auth.admin.createUser({ email: 'success.part@test.com', password: 'password123', email_confirm: true });
  await supabase.from('profiles').insert({ id: successUser.user.id, first_name: 'Success', last_name: 'Part' });
  
  await supabase.from('communication_recipients').insert([
    { message_id: msgPart.id, recipient_id: fId, status: 'QUEUED' }, // Fail user
    { message_id: msgPart.id, recipient_id: successUser.user.id, status: 'QUEUED' } // Success user
  ]);
  
  const { data: evPartData } = await supabase.from('platform_events').insert({
    organization_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01',
    aggregate_type: 'communication_message', aggregate_id: msgPart.id,
    event_type: 'message.queued', payload: { message_id: msgPart.id }, status: 'PENDING',
    idempotency_key: msgPart.id + '_qP'
  }).select('id').single();
  
  await invokeWorker('Bearer ' + supabaseKey);
  const { data: evPart } = await supabase.from('platform_events').select('*').eq('id', evPartData.id).single();
  strictEqual(evPart.status, 'PENDING', 'Partial failure results in PENDING for retry');
  
  const { data: partAttempts } = await supabase.from('communication_delivery_attempts').select('*').eq('platform_event_id', evPartData.id);
  const successAttempt = partAttempts.find(a => a.recipient_id === successUser.user.id);
  const failAttempt = partAttempts.find(a => a.recipient_id === fId);
  ok(successAttempt && successAttempt.success_delivery_timestamp !== null, 'Success recipient delivered');
  ok(failAttempt && failAttempt.success_delivery_timestamp === null, 'Fail recipient failed');

  console.log('--- I. Idempotency & J. Concurrency ---');
  const { data: msgIdemp } = await supabase.from('communication_messages').insert({
      organization_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01',
      branch_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02',
      sender_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeea003',
      subject: 'Idemp', body: 'Idemp', status: 'QUEUED'
  }).select('id').single();
  
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
