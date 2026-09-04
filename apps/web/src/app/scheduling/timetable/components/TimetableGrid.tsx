"use client";

import React, { useMemo } from 'react';

export interface Period {
  id: string;
  name?: string;
  start_time: string;
  end_time: string;
}

export interface TimetableEntry {
  id: string;
  day_of_week: number;
  time_range: string;
  classes?: { name: string };
  sections?: { name: string };
  subjects?: { name: string };
  periods?: { name: string; start_time: string; end_time: string };
  rooms?: { name: string };
  staff_branch_profiles?: { staff: { first_name: string; last_name: string } | { first_name: string; last_name: string }[] };
  is_substitution?: boolean;
  substitution_id?: string;
  class_id?: string;
  section_id?: string;
  subject_id?: string;
  staff_branch_profile_id?: string;
  room_id?: string;
  period_id?: string;
  status?: string;
}

type Props = Readonly<{
  entries: TimetableEntry[];
  periods: Period[];
  isReadOnly?: boolean;
  onEntryClick?: (entry: TimetableEntry) => void;
}>;

const DAYS = [
  { id: 1, name: 'Monday', shortName: 'Mon' },
  { id: 2, name: 'Tuesday', shortName: 'Tue' },
  { id: 3, name: 'Wednesday', shortName: 'Wed' },
  { id: 4, name: 'Thursday', shortName: 'Thu' },
  { id: 5, name: 'Friday', shortName: 'Fri' },
  { id: 6, name: 'Saturday', shortName: 'Sat' },
  { id: 7, name: 'Sunday', shortName: 'Sun' },
];

function parseTime(timeStr: string) {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

export function TimetableGrid({ entries, periods, isReadOnly, onEntryClick }: Props) {
  // Determine dynamic time range based on actual periods
  const { minMinutes, maxMinutes } = useMemo(() => {
    let min = 8 * 60; // default 08:00
    let max = 16 * 60; // default 16:00

    if (periods.length > 0) {
      min = Math.min(...periods.map(p => parseTime(p.start_time)));
      max = Math.max(...periods.map(p => parseTime(p.end_time)));
    }

    // Round to nearest hour bounds for visual padding
    return {
      minMinutes: Math.floor(min / 60) * 60,
      maxMinutes: Math.ceil(max / 60) * 60,
    };
  }, [periods]);

  const totalMinutes = maxMinutes - minMinutes;
  const PIXELS_PER_MINUTE = 1.5; // 90px per hour
  const gridHeight = Math.max(totalMinutes * PIXELS_PER_MINUTE, 400);

  // Generate hour markers
  const hours: number[] = [];
  for (let m = minMinutes; m <= maxMinutes; m += 60) {
    hours.push(m);
  }

  // Filter entries to show only ones with periods
  const validEntries = useMemo(() => entries.filter(e => e.periods), [entries]);

  // Today indicator for contextual day awareness
  const currentDayOfWeek = useMemo(() => {
    const jsDay = new Date().getDay();
    return jsDay === 0 ? 7 : jsDay; // Convert 0 (Sun) to 7
  }, []);

  return (
    <div className="space-y-4">
      {/* Accessible horizontal scroll container preventing mobile blowout */}
      <div
        className="w-full overflow-x-auto rounded-lg border border-border bg-surface shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        role="region"
        aria-label="Timetable Schedule Grid"
        tabIndex={0}
      >
        <div className="min-w-[840px] md:min-w-[960px]">
          {/* Header: Day columns with clear border separations and semantic tokens */}
          <div className="flex border-b-2 border-border bg-muted/70 pl-20">
            {DAYS.map(day => {
              const isToday = day.id === currentDayOfWeek;
              return (
                <div
                  key={day.id}
                  className={`flex-1 text-center py-3 px-2 border-l border-border transition-colors ${
                    isToday ? 'bg-primary/5 font-bold text-primary' : 'font-semibold text-foreground'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-xs sm:text-sm tracking-wide uppercase">{day.name}</span>
                    {isToday && (
                      <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-primary text-primary-foreground leading-none">
                        Today
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grid Body */}
          <div className="flex relative" style={{ height: gridHeight }}>
            {/* Time axis */}
            <div className="w-20 flex flex-col relative border-r-2 border-border bg-muted/40 shrink-0">
              {hours.map(m => {
                const hourLabel = `${String(Math.floor(m / 60)).padStart(2, '0')}:00`;
                return (
                  <div
                    key={m}
                    className="absolute w-full text-xs font-mono text-muted-foreground text-right pr-2.5 -mt-2.5 select-none"
                    style={{ top: (m - minMinutes) * PIXELS_PER_MINUTE }}
                  >
                    {hourLabel}
                  </div>
                );
              })}
            </div>

            {/* Day columns & Slots */}
            <div className="flex flex-1 relative">
              {/* Hour horizontal grid lines */}
              {hours.map(m => (
                <div
                  key={m}
                  className="absolute w-full border-t border-border/50 pointer-events-none"
                  style={{ top: (m - minMinutes) * PIXELS_PER_MINUTE, zIndex: 0 }}
                />
              ))}

              {DAYS.map(day => {
                const dayEntries = validEntries.filter(e => e.day_of_week === day.id);
                const isToday = day.id === currentDayOfWeek;

                return (
                  <div
                    key={day.id}
                    className={`flex-1 relative border-l border-border ${
                      isToday ? 'bg-primary/[0.015]' : ''
                    }`}
                    style={{ zIndex: 10 }}
                  >
                    {/* Empty slot indicators for configured periods without scheduled classes */}
                    {periods.map(period => {
                      const startMin = parseTime(period.start_time);
                      const endMin = parseTime(period.end_time);
                      if (endMin <= startMin) return null;

                      // Check if any entry occupies this slot
                      const hasEntry = dayEntries.some(e => {
                        if (!e.periods) return false;
                        const eStart = parseTime(e.periods.start_time);
                        const eEnd = parseTime(e.periods.end_time);
                        return (
                          e.period_id === period.id ||
                          (eStart < endMin && eEnd > startMin)
                        );
                      });

                      if (hasEntry) return null;

                      const top = (startMin - minMinutes) * PIXELS_PER_MINUTE;
                      const height = (endMin - startMin) * PIXELS_PER_MINUTE;

                      return (
                        <div
                          key={`empty-${day.id}-${period.id}`}
                          className="absolute w-full px-1 py-0.5 pointer-events-none"
                          style={{ top, height }}
                        >
                          <div
                            data-testid={`empty-slot-${day.id}-${period.id}`}
                            className="h-full w-full rounded border border-dashed border-border/60 bg-muted/15 flex items-center justify-center transition-colors"
                          >
                            <span className="text-[10px] font-medium text-muted-foreground/60 select-none tracking-tight">
                              Free Slot
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {/* Scheduled Entries */}
                    {dayEntries.map(entry => {
                      if (!entry.periods) return null;
                      const startMin = parseTime(entry.periods.start_time);
                      const endMin = parseTime(entry.periods.end_time);

                      const top = (startMin - minMinutes) * PIXELS_PER_MINUTE;
                      const height = Math.max((endMin - startMin) * PIXELS_PER_MINUTE, 28);

                      let teacherName = 'Unassigned';
                      if (entry.staff_branch_profiles?.staff) {
                        const staff = entry.staff_branch_profiles.staff;
                        if (Array.isArray(staff)) {
                          teacherName = `${staff[0].first_name} ${staff[0].last_name}`;
                        } else {
                          teacherName = `${staff.first_name} ${staff.last_name}`;
                        }
                      }

                      const isSub = Boolean(entry.is_substitution);
                      const bgClass = isSub
                        ? 'bg-amber-500/15 border-amber-500 text-foreground dark:bg-amber-950/40 dark:border-amber-400'
                        : 'bg-primary/10 border-primary text-foreground dark:bg-blue-950/40 dark:border-blue-400';

                      return (
                        <div
                          key={entry.id}
                          className="absolute w-full px-1 py-0.5"
                          style={{ top, height, zIndex: 20 }}
                        >
                          <button
                            type="button"
                            data-testid="timetable-entry"
                            data-day={entry.day_of_week}
                            onClick={() => {
                              if (!isReadOnly && onEntryClick) onEntryClick(entry);
                            }}
                            aria-label={`${entry.subjects?.name || 'Subject'}, ${day.name}, ${teacherName}, ${entry.rooms?.name || 'No room'}`}
                            className={`text-left border-l-4 h-full w-full rounded-sm shadow-xs p-1.5 text-xs overflow-hidden leading-tight hover:shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                              !isReadOnly && onEntryClick ? 'cursor-pointer hover:scale-[1.01]' : 'cursor-default'
                            } ${bgClass}`}
                          >
                            <div className="font-semibold truncate flex items-center gap-1">
                              {isSub && (
                                <span className="inline-block px-1 py-0.2 text-[9px] font-bold rounded bg-amber-500/20 text-amber-700 dark:text-amber-300">
                                  SUB
                                </span>
                              )}
                              <span className="truncate">{entry.subjects?.name || 'Untitled Subject'}</span>
                            </div>
                            <div className="truncate text-muted-foreground text-[11px] mt-0.5 font-medium">
                              {teacherName}
                            </div>
                            <div className="truncate text-muted-foreground/80 text-[10px]">
                              {entry.rooms?.name || 'Room N/A'}
                            </div>
                            {(entry.classes?.name || entry.sections?.name) && (
                              <div className="truncate text-muted-foreground text-[10px] font-medium mt-0.5">
                                {entry.classes?.name} {entry.sections?.name ? `• ${entry.sections.name}` : ''}
                              </div>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Global empty state indicator when timetable has 0 entries */}
      {validEntries.length === 0 && (
        <div
          data-testid="timetable-empty-state"
          className="rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-foreground">No Classes Scheduled</h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
            {isReadOnly
              ? 'No classes are scheduled for this academic year yet.'
              : 'There are no timetable entries yet. Click "Create Timetable Entry" above to schedule a class into the timetable.'}
          </p>
        </div>
      )}
    </div>
  );
}
