import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSection } from './actions';

// Mock dependencies
vi.mock('@/lib/server-actions', () => ({
  branchAction: vi.fn(async (branchId, action) => {
    try {
      const result = await action({
        branchId: 'test-branch-id',
        supabase: (globalThis as any).mockSupabase,
      });
      return { success: !result.error, data: result.data, error: result.error?.message };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  })
}));

describe('academic-structure actions', () => {
  let mockSingle: any;
  let mockEq1: any;
  let mockEq2: any;
  let mockSelect: any;
  let mockFrom: any;
  let mockInsert: any;

  beforeEach(() => {
    mockSingle = vi.fn();
    mockEq2 = vi.fn().mockReturnValue({ single: mockSingle });
    mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
    mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
    mockInsert = vi.fn();
    mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === 'classes') return { select: mockSelect };
      if (table === 'sections') return { insert: mockInsert };
    });
    (globalThis as any).mockSupabase = { from: mockFrom };
  });

  describe('createSection', () => {
    it('creates a section when class exists in the current branch', async () => {
      mockSingle.mockResolvedValueOnce({ data: { academic_year_id: 'year-1' }, error: null });
      mockInsert.mockResolvedValueOnce({ data: { id: 'sec-1' }, error: null });

      const result = await createSection({ class_id: 'class-1', name: 'A', capacity: 30 });

      expect(mockEq1).toHaveBeenCalledWith('id', 'class-1');
      expect(mockEq2).toHaveBeenCalledWith('branch_id', 'test-branch-id');
      expect(mockInsert).toHaveBeenCalledWith({
        class_id: 'class-1', name: 'A', capacity: 30, academic_year_id: 'year-1', branch_id: 'test-branch-id'
      });
      expect(result.success).toBe(true);
    });

    it('fails when class does not exist or belongs to another branch', async () => {
      mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } });
      const result = await createSection({ class_id: 'class-2', name: 'B', capacity: 30 });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid class or class not found in current branch');
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it('fails when academic_year_id is missing', async () => {
      mockSingle.mockResolvedValueOnce({ data: { academic_year_id: null }, error: null });
      const result = await createSection({ class_id: 'class-3', name: 'C', capacity: 30 });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid class or class not found in current branch');
      expect(mockInsert).not.toHaveBeenCalled();
    });
  });
});
