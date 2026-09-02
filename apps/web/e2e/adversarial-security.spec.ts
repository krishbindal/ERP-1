import { test, expect, BrowserContext } from '@playwright/test';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const BRANCH_A1 = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02'; // Teacher is in this branch
const BRANCH_A2 = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee03'; // Teacher is NOT in this branch

// Helper to extract JWT for API requests
async function getAuthToken(context: BrowserContext) {
  const cookies = await context.cookies();
  const tokenCookies = cookies.filter((c: { name: string, value: string }) => c.name.includes('-auth-token'));
  tokenCookies.sort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name));
  const fullCookieValue = tokenCookies.map((c: { name: string, value: string }) => decodeURIComponent(c.value)).join('');
  
  if (!fullCookieValue) return null;
  
  let decodedCookieValue = fullCookieValue;
  if (fullCookieValue.startsWith('base64-')) {
    decodedCookieValue = Buffer.from(fullCookieValue.replace('base64-', ''), 'base64').toString('utf-8');
  }

  try {
    const sessionData = JSON.parse(decodedCookieValue);
    return sessionData.access_token;
  } catch {
    return null;
  }
}

test.describe('Adversarial Server-Boundary Security', () => {

  test.describe('Teacher Role Mutations', () => {
    test.use({ storageState: 'playwright/.auth/teacher.json' });

    test('Teacher cannot mutate attendance for unauthorized branch', async ({ request, context }) => {
      const token = await getAuthToken(context);
      
      const payload = {
        p_branch_id: BRANCH_A2,
        p_academic_year_id: 'aaaaaaaa-1111-1111-1111-111111111111',
        p_section_id: 'aaaaaaaa-3333-3333-3333-333333333333',
        p_date: '2026-08-11',
        p_records: [{ student_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee51', status: 'PRESENT' }]
      };

      const res = await request.post(`${SUPABASE_URL}/rest/v1/rpc/rpc_save_attendance`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': ANON_KEY,
          'Content-Type': 'application/json'
        },
        data: payload
      });
      
      expect(res.status()).toBe(400);
      const text = await res.text();
      expect(text).toContain('Insufficient permissions');
    });

    test('Teacher cannot mutate homework for unauthorized branch', async ({ request, context }) => {
      const token = await getAuthToken(context);
      
      const payload = {
        p_branch_id: BRANCH_A2,
        p_academic_year_id: 'aaaaaaaa-1111-1111-1111-111111111111',
        p_class_id: 'aaaaaaaa-2222-2222-2222-222222222222',
        p_section_id: 'aaaaaaaa-3333-3333-3333-333333333333',
        p_subject_id: 'aaaaaaaa-4444-4444-4444-444444444444',
        p_title: 'Hacked Homework',
        p_description: 'Malicious payload',
        p_issue_at: new Date().toISOString(),
        p_due_at: new Date(Date.now() + 86400000).toISOString(),
        p_max_marks: 10
      };

      const res = await request.post(`${SUPABASE_URL}/rest/v1/rpc/rpc_create_homework_assignment`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': ANON_KEY,
          'Content-Type': 'application/json'
        },
        data: payload
      });

      expect(res.status()).toBe(400);
      const text = await res.text();
      expect(text).toContain('Insufficient permissions');
      
      // Verify no homework was created in BRANCH_A2
      const checkRes = await request.get(`${SUPABASE_URL}/rest/v1/homework_assignments?branch_id=eq.${BRANCH_A2}&title=eq.Hacked Homework`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': ANON_KEY,
        }
      });
      
      const checkData = await checkRes.json();
      expect(checkData.length).toBe(0);
    });

    test('Teacher cannot publish communication messages (admin-only)', async ({ request, context }) => {
      const token = await getAuthToken(context);

      const payload = {
        p_branch_id: BRANCH_A1,
        p_module_entity_type: 'general',
        p_module_entity_id: '00000000-0000-0000-0000-000000000000',
        p_subject: 'Hacked Announcement',
        p_body: 'Malicious payload',
        p_channel: 'EMAIL',
        p_urgency: 'NORMAL',
        p_audience: 'ALL_STAFF'
      };

      const res = await request.post(`${SUPABASE_URL}/rest/v1/rpc/rpc_send_communication_message`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': ANON_KEY,
          'Content-Type': 'application/json'
        },
        data: payload
      });

      // May return 404 if EXECUTE is revoked, or 400 with insufficient permissions
      expect([400, 403, 404]).toContain(res.status());
    });

    test('Teacher cannot mutate a locked attendance session directly via RPC', async ({ request, context }) => {
      const token = await getAuthToken(context);
      
      // Try to save over the locked session seeded on 2026-08-10
      const payload = {
        p_branch_id: BRANCH_A1,
        p_academic_year_id: 'aaaaaaaa-1111-1111-1111-111111111111',
        p_section_id: 'aaaaaaaa-3333-3333-3333-333333333333',
        p_date: '2026-08-10',
        p_records: [{ student_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee51', status: 'PRESENT' }]
      };

      const res = await request.post(`${SUPABASE_URL}/rest/v1/rpc/rpc_save_attendance`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': ANON_KEY,
          'Content-Type': 'application/json'
        },
        data: payload
      });

      expect(res.status()).toBe(400); 
      const text = await res.text();
      expect(text).toContain('Attendance is locked');
      
      // Verify state is unchanged (Student is still ABSENT)
      const checkRes = await request.get(`${SUPABASE_URL}/rest/v1/attendance_records?session_id=eq.bbbbbbbb-4444-4444-4444-444444444444`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': ANON_KEY,
        }
      });
      
      const checkData = await checkRes.json();
      expect(checkData[0].status).toBe('ABSENT');
    });
  });

  test.describe('Guardian Role Mutations', () => {
    test.use({ storageState: 'playwright/.auth/guardian.json' });

    test('Guardian cannot mutate attendance for their own child', async ({ request, context }) => {
      const token = await getAuthToken(context);
      
      const payload = {
        p_branch_id: BRANCH_A1,
        p_academic_year_id: 'aaaaaaaa-1111-1111-1111-111111111111',
        p_section_id: 'aaaaaaaa-3333-3333-3333-333333333333',
        p_date: '2026-08-11',
        p_records: [{ student_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee51', status: 'PRESENT' }]
      };

      const res = await request.post(`${SUPABASE_URL}/rest/v1/rpc/rpc_save_attendance`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': ANON_KEY,
          'Content-Type': 'application/json'
        },
        data: payload
      });
      
      expect(res.status()).toBe(400);
      const text = await res.text();
      expect(text).toContain('Insufficient permissions');
    });
  });
});
