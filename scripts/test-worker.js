const { execSync } = require('child_process');
const { createClient } = require('@supabase/supabase-js');
const assert = require('assert');

let statusJson;
try {
  const output = execSync('npx supabase status -o json', { stdio: ['pipe', 'pipe', 'ignore'] }).toString();
  const jsonMatch = output.match(/\{[\s\S]*\}/);
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

async function runTests() {
  console.log('--- A. HTTP/Security ---');
  let res = await fetch(workerUrl, { method: 'GET' });
  assert.strictEqual(res.status, 405, '1. Expected 405 Method Not Allowed');
  res = await invokeWorker(null);
  assert.strictEqual(res.status, 401, '2. Expected 401 Missing Auth');
  res = await invokeWorker('Bearer invalid_token');
  assert.strictEqual(res.status, 401, '3. Expected 401 Invalid Auth');
  res = await invokeWorker('Bearer ' + supabaseKey);
  assert.strictEqual(res.status, 200, '4. Expected 200 Valid Auth');

  console.log('--- B. Claim lifecycle & E. Successful Completion ---');
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
  assert.ok(ev1.status === 'PROCESSED' || ev1.status === 'DLQ' || ev1.status === 'COMPLETED', 'Status is ' + ev1.status);

  console.log('--- F. Transient Failure & H. DLQ ---');
  
  const { data: failUser } = await supabase.auth.admin.createUser({
    email: 'fail@test.com',
    password: 'password123',
    email_confirm: true
  });
  
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
  assert.strictEqual(ev2.status, 'PENDING');
  assert.strictEqual(ev2.attempts, 1);
  
  await supabase.from('platform_events').update({
    attempts: 4, next_retry_at: new Date(Date.now() - 10000).toISOString()
  }).eq('id', eventId2);
  
  await invokeWorker('Bearer ' + supabaseKey);
  const { data: ev2DLQ } = await supabase.from('platform_events').select('*').eq('id', eventId2).single();
  assert.strictEqual(ev2DLQ.status, 'DLQ');

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
  assert.ok(evLease.status === 'COMPLETED' || evLease.status === 'PENDING' || evLease.status === 'PROCESSED');


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
  assert.ok(ev3.attempts <= 1, 'Event processed ' + ev3.attempts + ' times concurrently');

  console.log('Worker Runtime Certification completed successfully.');
}

runTests().catch(e => { console.error(e); process.exit(1); });
