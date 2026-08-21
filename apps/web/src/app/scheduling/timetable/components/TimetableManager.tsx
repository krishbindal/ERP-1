"use client";

import { useState } from 'react';
import { TimetableGrid } from './TimetableGrid';
import { TimetableEntryForm } from './TimetableEntryForm';

interface Props {
  branchId: string;
  entries: any[];
  periods: any[];
  rooms: any[];
  classes: any[];
  sections: any[];
  subjects: any[];
  teachers: any[];
  view: string;
  isReadOnly: boolean;
}

export function TimetableManager({
  branchId,
  entries,
  periods,
  rooms,
  classes,
  sections,
  subjects,
  teachers,
  view,
  isReadOnly
}: Props) {
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);

  const handleEntryClick = (entry: any) => {
    if (isReadOnly) return;
    setSelectedEntry(entry);
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        {!isReadOnly && (
          <TimetableEntryForm 
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

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <TimetableGrid 
          entries={entries} 
          periods={periods} 
          view={view} 
          isReadOnly={isReadOnly}
          onEntryClick={handleEntryClick}
        />
      </div>

      {selectedEntry && !isReadOnly && (
        <TimetableEntryForm 
          key={selectedEntry.id} // Ensure it re-mounts for new entries
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
