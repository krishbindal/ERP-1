import { describe, it, expect, vi } from 'vitest';
import { saveAttendance, lockAttendance, publishAttendance, correctAttendance } from './actions';

// Mock branchAction to just return the mocked data
vi.mock('@/lib/server-actions', () => ({
  branchAction: vi.fn((branchId, action) => {
    return action({
      branchId: 'test-branch',
      supabase: {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { operating_days: [1,2,3,4,5], start_date: '2026-08-01', end_date: '2027-06-30' } }),
        maybeSingle: vi.fn().mockResolvedValue({ data: null }),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        upsert: vi.fn().mockResolvedValue({ error: null }),
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test' } } }) }
      }
    });
  })
}));

// Mock resolveInstructionalDay
vi.mock('@/lib/calendar/resolver', () => ({
  resolveInstructionalDay: vi.fn().mockReturnValue({ instructional: true })
}));

describe('Attendance Actions', () => {
  it('saveAttendance should succeed', async () => {
    const result = await saveAttendance('branch-id', {
      academic_year_id: 'ay-id',
      section_id: 'sec-id',
      date: '2026-08-25',
      records: [{ student_id: 'stud-id', status: 'PRESENT' }]
    });
    
    expect(result.error).toBeNull();
  });
  
  it('lockAttendance should succeed', async () => {
    const result = await lockAttendance('branch-id', 'sess-id');
    expect(result.error).toBeNull();
  });
});
