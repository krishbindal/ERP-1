import { describe, it, expect, vi } from 'vitest';
import { createSubstitution } from './actions';
import * as serverActions from '@/lib/server-actions';
import * as calendarActions from '@/lib/calendar/actions';

vi.mock('@/lib/server-actions', () => ({
  branchAction: vi.fn()
}));

vi.mock('@/lib/calendar/actions', () => ({
  getInstructionalDay: vi.fn()
}));

describe('createSubstitution', () => {
  it('forces trusted properties and ignores malicious input', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockEq2 = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnValue({ eq: mockEq2, single: vi.fn().mockResolvedValue({ data: { academic_year_id: 'trusted-year-123', branch_id: 'trusted-branch-123' }, error: null }) });
    
    // @ts-expect-error testing override
    calendarActions.getInstructionalDay.mockResolvedValue({ error: null, data: { instructional: true } });

    // @ts-expect-error testing override
    serverActions.branchAction.mockImplementation(async (explicitBranchId, action) => {
      const ctx = {
        branchId: 'trusted-branch-123',
        supabase: {
          from: vi.fn((table: string) => {
            if (table === 'timetable_entries') {
              return { select: vi.fn().mockReturnThis(), eq: mockEq };
            }
            if (table === 'timetable_substitutions') {
              return { insert: mockInsert };
            }
          })
        }
      };
      return action(ctx);
    });

    const maliciousData = {
      timetable_entry_id: 'entry-123',
      substitution_date: '2026-01-01',
      substitute_staff_id: 'staff-123',
      reason: 'Sick',
      // Malicious fields (cast to any to simulate bypass of TS)
      status: 'CANCELLED',
      branch_id: 'malicious-branch',
      academic_year_id: 'malicious-year',
      created_at: '1999-01-01'
    } as unknown as Parameters<typeof createSubstitution>[0];

    await createSubstitution(maliciousData);

    // Verify timetable_entries was queried with trusted branch
    expect(mockEq).toHaveBeenCalledWith('id', 'entry-123');
    expect(mockEq2).toHaveBeenCalledWith('branch_id', 'trusted-branch-123');

    // Verify insert payload
    expect(mockInsert).toHaveBeenCalledWith({
      timetable_entry_id: 'entry-123',
      substitution_date: '2026-01-01',
      substitute_staff_id: 'staff-123',
      reason: 'Sick',
      branch_id: 'trusted-branch-123',
      academic_year_id: 'trusted-year-123',
      status: 'ACTIVE',
    });
  });

  it('rejects substitution on non-instructional day (HOLIDAY)', async () => {
    const mockInsert = vi.fn();
    const mockEq2 = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnValue({ eq: mockEq2, single: vi.fn().mockResolvedValue({ data: { academic_year_id: 'trusted-year-123', branch_id: 'trusted-branch-123' }, error: null }) });
    
    // @ts-expect-error testing override
    serverActions.branchAction.mockImplementation(async (explicitBranchId, action) => {
      const ctx = {
        branchId: 'trusted-branch-123',
        supabase: {
          from: vi.fn((table: string) => {
            if (table === 'timetable_entries') {
              return { select: vi.fn().mockReturnThis(), eq: mockEq };
            }
            if (table === 'timetable_substitutions') {
              return { insert: mockInsert };
            }
          })
        }
      };
      return action(ctx);
    });

    // Mock HOLIDAY
    // @ts-expect-error testing override
    calendarActions.getInstructionalDay.mockResolvedValue({ 
      error: null, 
      data: { instructional: false, reason: 'HOLIDAY' } 
    });

    const data = {
      timetable_entry_id: 'entry-123',
      substitution_date: '2026-01-01',
      substitute_staff_id: 'staff-123',
      reason: 'Sick'
    } as unknown as Parameters<typeof createSubstitution>[0];

    const result = await createSubstitution(data);

    expect(result).toHaveProperty('error');
    expect(result.error).toContain('Cannot schedule substitution on a non-instructional day');
    expect(mockInsert).not.toHaveBeenCalled();
  });
});
