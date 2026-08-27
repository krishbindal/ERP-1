import { describe, it, expect } from 'vitest';
import { resolveInstructionalDay, getInstructionalDaysForRange, CalendarEvent } from './resolver';

describe('Calendar Resolver', () => {
  const operatingDays = [1, 2, 3, 4, 5]; // Mon-Fri
  
  describe('resolveInstructionalDay', () => {
    it('returns instructional for a regular operating day (Monday)', () => {
      const result = resolveInstructionalDay('2026-08-03', operatingDays, []);
      expect(result.instructional).toBe(true);
      expect(result.source).toBe('DEFAULT');
    });

    it('returns non-instructional for a non-operating day (Sunday)', () => {
      const result = resolveInstructionalDay('2026-08-02', operatingDays, []);
      expect(result.instructional).toBe(false);
      expect(result.source).toBe('DEFAULT');
    });

    it('handles custom operating days (e.g. Sunday only)', () => {
      const result = resolveInstructionalDay('2026-08-02', [7], []);
      expect(result.instructional).toBe(true);
    });

    it('overrides operating day with HOLIDAY', () => {
      const activeEvents: CalendarEvent[] = [{
        id: '1', name: 'Summer Break', start_date: '2026-08-03', end_date: '2026-08-03', type: 'HOLIDAY', is_instructional: false
      }];
      const result = resolveInstructionalDay('2026-08-03', operatingDays, activeEvents);
      expect(result.instructional).toBe(false);
      expect(result.source).toBe('OVERRIDE');
      expect(result.eventType).toBe('HOLIDAY');
    });

    it('overrides non-operating day with MAKEUP_DAY', () => {
      const activeEvents: CalendarEvent[] = [{
        id: '2', name: 'Makeup Saturday', start_date: '2026-08-08', end_date: '2026-08-08', type: 'MAKEUP_DAY', is_instructional: true
      }];
      const result = resolveInstructionalDay('2026-08-08', operatingDays, activeEvents);
      expect(result.instructional).toBe(true);
      expect(result.source).toBe('OVERRIDE');
    });

    it('precedence: non-instructional CLOSURE overrides instructional MAKEUP_DAY on same date', () => {
      const activeEvents: CalendarEvent[] = [
        { id: '1', name: 'Makeup', start_date: '2026-08-08', end_date: '2026-08-08', type: 'MAKEUP_DAY', is_instructional: true },
        { id: '2', name: 'Snow Closure', start_date: '2026-08-08', end_date: '2026-08-08', type: 'CLOSURE', is_instructional: false }
      ];
      const result = resolveInstructionalDay('2026-08-08', operatingDays, activeEvents);
      expect(result.instructional).toBe(false);
      expect(result.eventType).toBe('CLOSURE');
    });

    it('precedence: exact date overrides wider range', () => {
      const activeEvents: CalendarEvent[] = [
        { id: '1', name: 'Week Holiday', start_date: '2026-08-03', end_date: '2026-08-09', type: 'HOLIDAY', is_instructional: false },
        { id: '2', name: 'Special Day', start_date: '2026-08-05', end_date: '2026-08-05', type: 'OTHER', is_instructional: false }
      ];
      const result = resolveInstructionalDay('2026-08-05', operatingDays, activeEvents);
      expect(result.eventId).toBe('2');
    });

    it('precedence: stable deterministic tie-breaker via ID', () => {
      const activeEvents: CalendarEvent[] = [
        { id: 'B', name: 'Event B', start_date: '2026-08-05', end_date: '2026-08-05', type: 'HOLIDAY', is_instructional: false },
        { id: 'A', name: 'Event A', start_date: '2026-08-05', end_date: '2026-08-05', type: 'CLOSURE', is_instructional: false }
      ];
      const result = resolveInstructionalDay('2026-08-05', operatingDays, activeEvents);
      expect(result.eventId).toBe('A'); // Lexicographical sort puts A first
    });
    
    it('ignores events that do not overlap the date', () => {
      const activeEvents: CalendarEvent[] = [
        { id: '1', name: 'Past Holiday', start_date: '2026-08-01', end_date: '2026-08-01', type: 'HOLIDAY', is_instructional: false }
      ];
      const result = resolveInstructionalDay('2026-08-05', operatingDays, activeEvents);
      expect(result.source).toBe('DEFAULT');
    });
  });
  
  describe('getInstructionalDaysForRange', () => {
    it('resolves a range correctly', () => {
      const activeEvents: CalendarEvent[] = [{
        id: '1', name: 'Holiday', start_date: '2026-08-04', end_date: '2026-08-04', type: 'HOLIDAY', is_instructional: false
      }];
      const results = getInstructionalDaysForRange('2026-08-03', '2026-08-05', operatingDays, activeEvents);
      
      expect(results).toHaveLength(3);
      expect(results[0].date).toBe('2026-08-03');
      expect(results[0].instructional).toBe(true); // Monday
      
      expect(results[1].date).toBe('2026-08-04');
      expect(results[1].instructional).toBe(false); // Tuesday Holiday
      expect(results[1].source).toBe('OVERRIDE');
      
      expect(results[2].date).toBe('2026-08-05');
      expect(results[2].instructional).toBe(true); // Wednesday
    });
  });
});


