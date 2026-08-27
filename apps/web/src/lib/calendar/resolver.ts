export type CalendarEventType = 'HOLIDAY' | 'CLOSURE' | 'MAKEUP_DAY' | 'OTHER';

export interface CalendarEvent {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  type: CalendarEventType;
  is_instructional: boolean;
}

export type InstructionalDayResolution = {
  date: string;
  instructional: boolean;
  source: 'DEFAULT' | 'OVERRIDE';
  eventId: string | null;
  eventName: string | null;
  eventType: CalendarEventType | null;
  reason: string;
};

/**
 * Pure, deterministic resolver for instructional days.
 */
export function resolveInstructionalDay(
  dateStr: string,
  operatingDays: number[],
  activeEvents: CalendarEvent[]
): InstructionalDayResolution {
  const overlappingEvents = activeEvents.filter(e => dateStr >= e.start_date && dateStr <= e.end_date);
  
  if (overlappingEvents.length === 0) {
    const jsDate = new Date(dateStr + "T00:00:00Z");
    const utcDay = jsDate.getUTCDay();
    const isoWeekday = utcDay === 0 ? 7 : utcDay;
    
    const isOperating = operatingDays.includes(isoWeekday);
    
    return {
      date: dateStr,
      instructional: isOperating,
      source: 'DEFAULT',
      eventId: null,
      eventName: null,
      eventType: null,
      reason: isOperating ? 'Regular operating day' : 'Regular non-operating day'
    };
  }
  
  overlappingEvents.sort((a, b) => {
    if (a.is_instructional !== b.is_instructional) {
      return a.is_instructional ? 1 : -1;
    }
    
    const durationA = new Date(a.end_date + "T00:00:00Z").getTime() - new Date(a.start_date + "T00:00:00Z").getTime();
    const durationB = new Date(b.end_date + "T00:00:00Z").getTime() - new Date(b.start_date + "T00:00:00Z").getTime();
    
    if (durationA !== durationB) {
      return durationA - durationB;
    }
    
    return a.id.localeCompare(b.id);
  });
  
  const winningEvent = overlappingEvents[0];
  
  return {
    date: dateStr,
    instructional: winningEvent.is_instructional,
    source: 'OVERRIDE',
    eventId: winningEvent.id,
    eventName: winningEvent.name,
    eventType: winningEvent.type,
    reason: 'Overridden by ' + winningEvent.type + ': ' + winningEvent.name
  };
}

export function getInstructionalDaysForRange(
  startStr: string,
  endStr: string,
  operatingDays: number[],
  activeEvents: CalendarEvent[]
): InstructionalDayResolution[] {
  const result: InstructionalDayResolution[] = [];
  const currentDate = new Date(startStr + "T00:00:00Z");
  const endDate = new Date(endStr + "T00:00:00Z");
  
  while (currentDate <= endDate) {
    const isoDateStr = currentDate.toISOString().split('T')[0];
    result.push(resolveInstructionalDay(isoDateStr, operatingDays, activeEvents));
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }
  
  return result;
}
