"use client";

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { saveAttendance, lockAttendance, publishAttendance, correctAttendance, AttendanceStatus } from '@/lib/attendance/actions';

interface StudentData {
  roll_number: number | null;
  students: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

interface AttendanceManagerProps {
  academicYearId: string;
  branchId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sections: any[];
  selectedDate: string;
  selectedSectionId: string | null;
  enrolledStudents: StudentData[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialSession: any | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialRecords: any[];
  isAdmin: boolean;
}

export function AttendanceManager({
  academicYearId,
  branchId,
  sections,
  selectedDate,
  selectedSectionId,
  enrolledStudents,
  initialSession,
  initialRecords,
  isAdmin
}: AttendanceManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  // Local state for edits
  const [records, setRecords] = useState<Record<string, AttendanceStatus>>(() => {
    const map: Record<string, AttendanceStatus> = {};
    if (initialRecords.length > 0) {
      initialRecords.forEach(r => map[r.student_id] = r.status);
    } else {
      enrolledStudents.forEach(e => map[e.students.id] = 'PRESENT'); // Default
    }
    return map;
  });

  const [correctionReason, setCorrectionReason] = useState('');
  const [correctingStudentId, setCorrectingStudentId] = useState<string | null>(null);
  const [correctionStatus, setCorrectionStatus] = useState<AttendanceStatus | null>(null);

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const isLocked = !!initialSession?.locked_at;
  const isPublished = !!initialSession?.published_at;
  
  const statusLabel = isPublished ? 'Published' : isLocked ? 'Locked' : initialSession ? 'Draft' : 'Unmarked';

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(window.location.search);
    params.set('date', e.target.value);
    startTransition(() => router.push(`?${params.toString()}`));
  };

  const handleSectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(window.location.search);
    if (e.target.value) {
      params.set('sectionId', e.target.value);
    } else {
      params.delete('sectionId');
    }
    startTransition(() => router.push(`?${params.toString()}`));
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    if (isLocked || isPublished) return;
    setRecords(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    if (!selectedSectionId) return;
    setMessage(null);
    
    const payload = {
      academic_year_id: academicYearId,
      section_id: selectedSectionId,
      date: selectedDate,
      records: Object.entries(records).map(([student_id, status]) => ({ student_id, status }))
    };

    const res = await saveAttendance(branchId, payload);
    if (res.error) {
      setMessage({ text: res.error, type: 'error' });
    } else {
      setMessage({ text: 'Attendance saved successfully.', type: 'success' });
      startTransition(() => router.refresh());
    }
  };

  const handleLock = async () => {
    if (!initialSession) return;
    setMessage(null);
    const res = await lockAttendance(branchId, initialSession.id);
    if (res.error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = res.error as any;
      setMessage({ text: err.message || typeof err === 'string' ? err : 'Failed to lock', type: 'error' });
    } else {
      setMessage({ text: 'Attendance locked successfully.', type: 'success' });
      startTransition(() => router.refresh());
    }
  };

  const handlePublish = async () => {
    if (!initialSession) return;
    setMessage(null);
    const res = await publishAttendance(branchId, initialSession.id);
    if (res.error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = res.error as any;
      setMessage({ text: err.message || typeof err === 'string' ? err : 'Failed to publish', type: 'error' });
    } else {
      setMessage({ text: 'Attendance published successfully.', type: 'success' });
      startTransition(() => router.refresh());
    }
  };

  const handleCorrect = async () => {
    if (!initialSession || !correctingStudentId || !correctionStatus) return;
    if (!correctionReason.trim()) {
      setMessage({ text: 'Correction reason is mandatory', type: 'error' });
      return;
    }
    setMessage(null);
    
    const res = await correctAttendance(branchId, initialSession.id, correctingStudentId, correctionStatus, correctionReason);
    if (res.error) {
      setMessage({ text: res.error, type: 'error' });
    } else {
      setMessage({ text: 'Attendance corrected successfully.', type: 'success' });
      setCorrectingStudentId(null);
      setCorrectionReason('');
      startTransition(() => router.refresh());
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow space-y-6">
      
      {message && (
        <div className={`p-4 rounded ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message.text}
        </div>
      )}

      <div className="flex gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input 
            type="date" 
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" 
            value={selectedDate}
            onChange={handleDateChange}
            aria-label="Date"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Section</label>
          <select 
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            value={selectedSectionId || ''}
            onChange={handleSectionChange}
            aria-label="Section"
          >
            <option value="">Select Section...</option>
            {sections.map(s => (
              <option key={s.id} value={s.id}>{s.classes?.name} - {s.name}</option>
            ))}
          </select>
        </div>
        
        {selectedSectionId && (
          <div className="ml-auto">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800" aria-label="Status Indicator">
              Status: {statusLabel}
            </span>
          </div>
        )}
      </div>

      {isPending && <div className="text-gray-500">Loading...</div>}

      {selectedSectionId && enrolledStudents.length > 0 && !isPending && (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                  {isAdmin && (isLocked || isPublished) && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {enrolledStudents.map((enr) => {
                  const student = enr.students;
                  const currentStatus = records[student.id];
                  
                  return (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {enr.roll_number || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.first_name} {student.last_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-4">
                          {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as AttendanceStatus[]).map((status) => (
                            <label key={status} className="flex items-center space-x-1">
                              <input
                                type="radio"
                                name={`status-${student.id}`}
                                value={status}
                                checked={currentStatus === status}
                                onChange={() => handleStatusChange(student.id, status)}
                                disabled={isLocked || isPublished}
                                aria-label={`${status} for ${student.first_name}`}
                              />
                              <span className="text-xs uppercase">{status}</span>
                            </label>
                          ))}
                        </div>
                      </td>
                      {isAdmin && (isLocked || isPublished) && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                           <button 
                             onClick={() => {
                               setCorrectingStudentId(student.id);
                               setCorrectionStatus(currentStatus);
                               setCorrectionReason('');
                             }}
                             className="text-blue-600 hover:text-blue-900 text-xs"
                           >
                             Correct
                           </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex gap-4 pt-4 border-t">
            {!isLocked && !isPublished && (
              <button 
                onClick={handleSave}
                className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
              >
                Save Attendance
              </button>
            )}
            
            {!isLocked && !isPublished && initialSession && (
              <button 
                onClick={handleLock}
                className="bg-yellow-600 text-white px-4 py-2 rounded shadow hover:bg-yellow-700"
              >
                Lock
              </button>
            )}
            
            {isAdmin && isLocked && !isPublished && (
              <button 
                onClick={handlePublish}
                className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"
              >
                Publish
              </button>
            )}
          </div>
        </>
      )}

      {selectedSectionId && enrolledStudents.length === 0 && !isPending && (
        <div className="p-8 text-center text-gray-500">
          No active enrollments found for this section.
        </div>
      )}

      {/* Correction Modal (Simple inline for now) */}
      {correctingStudentId && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Correct Attendance</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">New Status</label>
              <select 
                className="w-full border rounded p-2"
                value={correctionStatus || ''}
                onChange={(e) => setCorrectionStatus(e.target.value as AttendanceStatus)}
                aria-label="Correction Status"
              >
                <option value="PRESENT">PRESENT</option>
                <option value="ABSENT">ABSENT</option>
                <option value="LATE">LATE</option>
                <option value="EXCUSED">EXCUSED</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
              <textarea 
                className="w-full border rounded p-2"
                value={correctionReason}
                onChange={(e) => setCorrectionReason(e.target.value)}
                placeholder="Mandatory reason..."
                aria-label="Correction Reason"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button 
                className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
                onClick={() => setCorrectingStudentId(null)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleCorrect}
              >
                Apply Correction
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
