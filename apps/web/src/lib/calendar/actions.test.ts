import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getInstructionalDay, getInstructionalDaysForRangeAction } from './actions';

// Create a mock Supabase client
const createMockSupabase = () => {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn(),
    then: vi.fn(),
  };
  
  const from = vi.fn().mockReturnValue(chain);
  return { from, _chain: chain };
};

let mockSupabase: ReturnType<typeof createMockSupabase>;

// Mock server-actions
vi.mock('@/lib/server-actions', () => ({
  branchAction: async (explicitBranchId: string | undefined, callback: (ctx: { branchId: string; supabase: unknown }) => Promise<{ error?: unknown; data?: unknown }>) => {
    try {
      const res = await callback({
        branchId: explicitBranchId || 'default-branch-id',
        supabase: mockSupabase,
      });
      if (res.error) {
        if (res.error instanceof Error) return { error: res.error.message };
        return { error: String(res.error) };
      }
      return { data: res.data };
    } catch (e: unknown) {
      if (e instanceof Error) return { error: e.message };
      return { error: String(e) };
    }
  }
}));

// Mock scheduling-context
vi.mock('@/app/scheduling/lib/scheduling-context', () => ({
  getActiveAcademicYearId: async () => 'active-year-id'
}));

describe('Calendar Actions API Contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = createMockSupabase();
  });

  describe('fetchCalendarContext behavior (via getInstructionalDay)', () => {
    it('1. active-year fallback still works for generic Calendar UI', async () => {
      const { _chain } = mockSupabase;
      _chain.single.mockResolvedValueOnce({ data: { operating_days: [1, 2, 3] }, error: null }); // academic_years
      _chain.then.mockImplementationOnce((cb: (res: { data: unknown[]; error: null }) => void) => cb({ data: [], error: null })); // calendar_events
      
      await getInstructionalDay('2026-08-05');
      
      // Should fetch academic_years with active-year-id
      expect(mockSupabase.from).toHaveBeenCalledWith('academic_years');
      expect(_chain.eq).toHaveBeenCalledWith('id', 'active-year-id');
      
      // Should fetch calendar_events with active-year-id
      expect(mockSupabase.from).toHaveBeenCalledWith('calendar_events');
      expect(_chain.eq).toHaveBeenCalledWith('academic_year_id', 'active-year-id');
      expect(_chain.eq).toHaveBeenCalledWith('status', 'ACTIVE');
    });

    it('2. explicit academic year resolves correctly (verified against branch)', async () => {
      const { _chain } = mockSupabase;
      
      // resolveAcademicYearId verification query
      _chain.single.mockResolvedValueOnce({ data: { id: 'explicit-year-id' }, error: null }); 
      // fetchCalendarContext operating days query
      _chain.single.mockResolvedValueOnce({ data: { operating_days: [1, 2, 3] }, error: null });
      // events query
      _chain.then.mockImplementationOnce((cb: (res: { data: unknown[]; error: null }) => void) => cb({ data: [], error: null }));
      
      await getInstructionalDay('2026-08-05', undefined, 'explicit-year-id');
      
      // Validation query for explicit academic year
      expect(mockSupabase.from).toHaveBeenCalledWith('academic_years');
      expect(_chain.eq).toHaveBeenCalledWith('id', 'explicit-year-id');
      expect(_chain.eq).toHaveBeenCalledWith('branch_id', 'default-branch-id');
      
      // Events query should use explicit-year-id
      expect(mockSupabase.from).toHaveBeenCalledWith('calendar_events');
      expect(_chain.eq).toHaveBeenCalledWith('academic_year_id', 'explicit-year-id');
    });

    it('5. explicit year from another branch is rejected', async () => {
      const { _chain } = mockSupabase;
      
      // resolveAcademicYearId verification query fails (simulating not found / wrong branch)
      _chain.single.mockResolvedValueOnce({ data: null, error: null }); 
      
      const response = await getInstructionalDay('2026-08-05', undefined, 'wrong-branch-year-id');
      
      expect(response.error).toBeDefined();
      expect(response.error).toBe('Academic year not found or does not belong to this branch.');
    });

    it('6. range API uses explicit academic year', async () => {
      const { _chain } = mockSupabase;
      
      // resolveAcademicYearId verification query
      _chain.single.mockResolvedValueOnce({ data: { id: 'explicit-year-id' }, error: null }); 
      // fetchCalendarContext operating days query
      _chain.single.mockResolvedValueOnce({ data: { operating_days: [1, 2, 3] }, error: null });
      // events query
      _chain.then.mockImplementationOnce((cb: (res: { data: unknown[]; error: null }) => void) => cb({ data: [], error: null }));
      
      await getInstructionalDaysForRangeAction('2026-08-01', '2026-08-05', undefined, 'explicit-year-id');
      
      // Events query should use explicit-year-id
      expect(mockSupabase.from).toHaveBeenCalledWith('calendar_events');
      expect(_chain.eq).toHaveBeenCalledWith('academic_year_id', 'explicit-year-id');
      expect(_chain.gte).toHaveBeenCalledWith('end_date', '2026-08-01');
      expect(_chain.lte).toHaveBeenCalledWith('start_date', '2026-08-05');
    });
  });
});
