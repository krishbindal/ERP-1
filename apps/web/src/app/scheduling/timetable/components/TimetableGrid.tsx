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

interface Props {
  entries: TimetableEntry[];
  periods: Period[];
  isReadOnly?: boolean;
  onEntryClick?: (entry: TimetableEntry) => void;
}

const DAYS = [
  { id: 1, name: 'Monday' },
  { id: 2, name: 'Tuesday' },
  { id: 3, name: 'Wednesday' },
  { id: 4, name: 'Thursday' },
  { id: 5, name: 'Friday' },
  { id: 6, name: 'Saturday' },
  { id: 7, name: 'Sunday' }
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
  const gridHeight = totalMinutes * PIXELS_PER_MINUTE;

  // Generate hour markers
  const hours = [];
  for (let m = minMinutes; m <= maxMinutes; m += 60) {
    hours.push(m);
  }

  // Filter entries to show only ones with periods (in case of data issues)
  const validEntries = entries.filter(e => e.periods);

  return (
    <div className="p-4 overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header Days */}
        <div className="flex border-b border-gray-200 pl-16">
          {DAYS.map(day => (
            <div key={day.id} className="flex-1 text-center py-2 font-medium text-sm text-gray-700 border-l border-gray-200">
              {day.name}
            </div>
          ))}
        </div>

        {/* Grid Body */}
        <div className="flex relative" style={{ height: gridHeight }}>
          {/* Time axis */}
          <div className="w-16 flex flex-col relative border-r border-gray-200 bg-gray-50">
            {hours.map(m => {
              const hourLabel = `${String(Math.floor(m / 60)).padStart(2, '0')}:00`;
              return (
                <div 
                  key={m} 
                  className="absolute w-full text-xs text-gray-500 text-right pr-2 -mt-2"
                  style={{ top: (m - minMinutes) * PIXELS_PER_MINUTE }}
                >
                  {hourLabel}
                </div>
              );
            })}
          </div>

          {/* Day columns */}
          <div className="flex flex-1 relative">
            {/* Grid lines */}
            {hours.map(m => (
              <div
                key={m}
                className="absolute w-full border-t border-gray-100"
                style={{ top: (m - minMinutes) * PIXELS_PER_MINUTE, zIndex: 0 }}
              />
            ))}

            {DAYS.map(day => (
              <div key={day.id} className="flex-1 relative border-l border-gray-200" style={{ zIndex: 10 }}>
                {validEntries.filter(e => e.day_of_week === day.id).map(entry => {
                  if (!entry.periods) return null;
                  const startMin = parseTime(entry.periods.start_time);
                  const endMin = parseTime(entry.periods.end_time);
                  
                  const top = (startMin - minMinutes) * PIXELS_PER_MINUTE;
                  const height = (endMin - startMin) * PIXELS_PER_MINUTE;

                  let teacherName = 'Unassigned';
                  if (entry.staff_branch_profiles?.staff) {
                    const staff = entry.staff_branch_profiles.staff;
                    if (Array.isArray(staff)) {
                      teacherName = `${staff[0].first_name} ${staff[0].last_name}`;
                    } else {
                      teacherName = `${staff.first_name} ${staff.last_name}`;
                    }
                  }

                  const isSub = entry.is_substitution;
                  const bgClass = isSub ? 'bg-orange-50 border-orange-500 text-orange-900' : 'bg-blue-50 border-blue-500 text-blue-900';

                  return (
                    <div
                      key={entry.id}
                      className="absolute w-full px-1 py-0.5"
                      style={{ top, height }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          if (!isReadOnly && onEntryClick) onEntryClick(entry);
                        }}
                        className={`text-left border-l-4 h-full w-full rounded shadow-sm p-1 text-xs overflow-hidden leading-tight hover:shadow-md transition-shadow ${!isReadOnly && onEntryClick ? 'cursor-pointer' : 'cursor-default'} ${bgClass}`}
                      >
                        <div className="font-semibold truncate">
                          {isSub && <span className="text-orange-600 mr-1 font-bold">[SUB]</span>}
                          {entry.subjects?.name}
                        </div>
                        <div className="truncate text-gray-600">{teacherName}</div>
                        <div className="truncate text-gray-500 mt-0.5">{entry.rooms?.name}</div>
                        <div className="truncate font-medium text-gray-600 mt-1">{entry.classes?.name} - {entry.sections?.name}</div>
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
