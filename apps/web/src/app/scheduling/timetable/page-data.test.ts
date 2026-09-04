import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as serverSupabase from '@/lib/supabase/server';
import { fetchSchedulingPageData, fetchTimetablePageData } from './page-data';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

describe('scheduling page-data - query parallelization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchSchedulingPageData executes wave 1 queries in parallel and resolves timetable entries', async () => {
    const tableQueries: string[] = [];

    const mockFrom = vi.fn().mockImplementation((table: string) => {
      tableQueries.push(table);
      if (table === 'academic_years') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'year-2026' }, error: null }),
              }),
            }),
          }),
        };
      }
      if (table === 'periods') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: [{ id: 'p1', name: 'Period 1', start_time: '08:00', end_time: '08:50' }],
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
      if (table === 'rooms') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: [{ id: 'r1', name: 'Room 101' }],
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
      if (table === 'staff_branch_profiles') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [{ id: 't1', staff: { first_name: 'Jane', last_name: 'Doe' } }],
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === 'timetable_entries') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                  data: [{ id: 'entry-1', day_of_week: 1, period_id: 'p1' }],
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
      return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockResolvedValue({ data: [], error: null }) };
    });

    // @ts-expect-error test mock override
    serverSupabase.createClient.mockResolvedValue({ from: mockFrom });

    const result = await fetchSchedulingPageData('branch-123');

    expect(result.academicYearId).toBe('year-2026');
    expect(result.periods).toHaveLength(1);
    expect(result.rooms).toHaveLength(1);
    expect(result.teachers).toHaveLength(1);
    expect(result.entriesData).toHaveLength(1);

    // Verify all 4 wave 1 tables were queried
    expect(tableQueries).toContain('academic_years');
    expect(tableQueries).toContain('periods');
    expect(tableQueries).toContain('rooms');
    expect(tableQueries).toContain('staff_branch_profiles');
    expect(tableQueries).toContain('timetable_entries');
  });

  it('fetchTimetablePageData parallelizes all 8 queries across 2 waves', async () => {
    const tableQueries: string[] = [];

    const mockFrom = vi.fn().mockImplementation((table: string) => {
      tableQueries.push(table);
      if (table === 'academic_years') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'year-2026' }, error: null }),
              }),
            }),
          }),
        };
      }
      if (table === 'periods') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: [{ id: 'p1', name: 'Period 1', start_time: '08:00', end_time: '08:50' }],
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
      if (table === 'rooms') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: [{ id: 'r1', name: 'Room 101' }],
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
      if (table === 'staff_branch_profiles') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [{ id: 't1', staff: { first_name: 'John', last_name: 'Smith' } }],
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === 'subjects') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: [{ id: 'sub-1', name: 'Mathematics' }],
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
      if (table === 'timetable_entries') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                  data: [{ id: 'entry-1', day_of_week: 1, period_id: 'p1' }],
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
      if (table === 'classes') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: [{ id: 'cls-1', name: 'Grade 10' }],
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
      if (table === 'sections') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: [{ id: 'sec-1', name: 'Section A', class_id: 'cls-1' }],
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
      return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockResolvedValue({ data: [], error: null }) };
    });

    // @ts-expect-error test mock override
    serverSupabase.createClient.mockResolvedValue({ from: mockFrom });

    const data = await fetchTimetablePageData('branch-123');

    expect(data.academicYearId).toBe('year-2026');
    expect(data.periods).toHaveLength(1);
    expect(data.rooms).toHaveLength(1);
    expect(data.teachers).toHaveLength(1);
    expect(data.subjects).toHaveLength(1);
    expect(data.entriesData).toHaveLength(1);
    expect(data.classes).toHaveLength(1);
    expect(data.sections).toHaveLength(1);

    // Assert all 8 queries were called
    expect(tableQueries).toHaveLength(8);
    expect(tableQueries).toEqual([
      'academic_years',
      'periods',
      'rooms',
      'staff_branch_profiles',
      'subjects',
      'timetable_entries',
      'classes',
      'sections',
    ]);
  });

  it('fetchTimetablePageData handles absence of active academic year gracefully', async () => {
    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === 'academic_years') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
          }),
        };
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        }),
      };
    });

    // @ts-expect-error test mock override
    serverSupabase.createClient.mockResolvedValue({ from: mockFrom });

    const data = await fetchTimetablePageData('branch-123');
    expect(data.academicYearId).toBeUndefined();
    expect(data.entriesData).toEqual([]);
    expect(data.classes).toEqual([]);
    expect(data.sections).toEqual([]);
  });
});
