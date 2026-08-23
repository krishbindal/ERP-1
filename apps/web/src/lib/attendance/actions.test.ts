import { describe, it, expect, vi } from 'vitest';
import { saveAttendance, lockAttendance, publishAttendance, correctAttendance } from './actions';

// Mock branchAction to just return the mocked data
vi.mock('@/lib/server-actions', () => ({
  branchAction: vi.fn((branchId, action) => {
    return action({
      branchId: 'test-branch',
      supabase: {
        rpc: vi.fn().mockImplementation((name, args) => {
          if (name === 'rpc_save_attendance') {
            if (args.p_records.length > 0 && args.p_records[0].student_id === 'unauthorized-student') {
              return { error: { message: 'Not authorized' } };
            }
            return { data: 'sess-id', error: null };
          }
          if (name === 'rpc_correct_attendance') {
            if (args.p_reason === '') {
              return { error: { message: 'Correction reason is mandatory' } };
            }
            return { data: true, error: null };
          }
          return { data: null, error: null };
        }),
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        not: vi.fn().mockReturnThis(),
        is: vi.fn().mockResolvedValue({ error: null }),
        update: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { operating_days: [1,2,3,4,5], start_date: '2026-08-01', end_date: '2027-06-30' } }),
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test' } } }) }
      }
    });
  })
}));

// Mock resolveInstructionalDay
vi.mock('@/lib/calendar/resolver', () => ({
  resolveInstructionalDay: vi.fn().mockImplementation((date) => {
    if (date === '2026-12-25') return { instructional: false };
    return { instructional: true };
  })
}));

describe('Attendance Actions', () => {
  it('saveAttendance should succeed for authorized request', async () => {
    const result = await saveAttendance('branch-id', {
      academic_year_id: 'ay-id',
      section_id: 'sec-id',
      date: '2026-08-25',
      records: [{ student_id: 'stud-id', status: 'PRESENT' }]
    });
    expect(result.error).toBeNull();
    expect(result.data?.sessionId).toBe('sess-id');
  });

  it('saveAttendance should fail for non-instructional day', async () => {
    const result = await saveAttendance('branch-id', {
      academic_year_id: 'ay-id',
      section_id: 'sec-id',
      date: '2026-12-25',
      records: [{ student_id: 'stud-id', status: 'PRESENT' }]
    });
    expect(result.error).toBe("Cannot record attendance on a non-instructional day");
  });

  it('saveAttendance should fail if RPC returns error (e.g. not enrolled)', async () => {
    const result = await saveAttendance('branch-id', {
      academic_year_id: 'ay-id',
      section_id: 'sec-id',
      date: '2026-08-25',
      records: [{ student_id: 'unauthorized-student', status: 'PRESENT' }]
    });
    expect(result.error).toBe("Not authorized");
  });

  it('lockAttendance should succeed', async () => {
    const result = await lockAttendance('branch-id', 'sess-id');
    expect(result.error).toBeNull();
  });

  it('publishAttendance should succeed', async () => {
    const result = await publishAttendance('branch-id', 'sess-id');
    expect(result.error).toBeNull();
  });

  it('correctAttendance should fail without reason', async () => {
    const result = await correctAttendance('branch-id', 'sess-id', 'stud-id', 'ABSENT', '');
    expect(result.error).toBe("Correction reason is mandatory");
  });

  it('correctAttendance should succeed with reason', async () => {
    const result = await correctAttendance('branch-id', 'sess-id', 'stud-id', 'ABSENT', 'Typo in initial entry');
    expect(result.error).toBeNull();
  });
});
