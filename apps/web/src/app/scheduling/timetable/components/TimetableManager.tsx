"use client";

import { useState } from 'react';
import { TimetableGrid, TimetableEntry, Period } from './TimetableGrid';
import { TimetableEntryForm } from './TimetableEntryForm';

type Props = Readonly<{
  branchId: string;
  academicYearId: string;
  entries: TimetableEntry[];
  periods: Period[];
  rooms: { id: string; name: string }[];
  classes: { id: string; name: string }[];
  sections: { id: string; name: string; class_id: string }[];
  subjects: { id: string; name: string }[];
  teachers: { id: string; staff?: { first_name: string; last_name: string } | { first_name: string; last_name: string }[] }[];
  isReadOnly: boolean;
}>;

export function TimetableManager({
  branchId,
  academicYearId,
  entries,
  periods,
  rooms,
  classes,
  sections,
  subjects,
  teachers,
  isReadOnly
}: Props) {
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null);

  const handleEntryClick = (entry: TimetableEntry) => {
    if (isReadOnly) return;
    setSelectedEntry(entry);
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        {!isReadOnly && (
          <TimetableEntryForm 
            academicYearId={academicYearId}
            branchId={branchId} 
            periods={periods} 
            rooms={rooms} 
            classes={classes} 
            sections={sections} 
            subjects={subjects} 
            teachers={teachers} 
          />
        )}
      </div>

      <div className="bg-surface rounded-lg shadow-xs border border-border">
        <TimetableGrid 
          entries={entries} 
          periods={periods} 
          isReadOnly={isReadOnly}
          onEntryClick={handleEntryClick}
        />
      </div>

      {selectedEntry && !isReadOnly && (
        <TimetableEntryForm 
            key={selectedEntry.id}
            academicYearId={academicYearId}
            branchId={branchId} 
          periods={periods} 
          rooms={rooms} 
          classes={classes} 
          sections={sections} 
          subjects={subjects} 
          teachers={teachers} 
          initialData={selectedEntry}
          triggerOpen={true}
          onClose={() => setSelectedEntry(null)}
        />
      )}
    </>
  );
}



