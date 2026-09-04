"use client";

import React, { useState, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmptyRow,
  Button,
  Input,
  Dialog,
  ConfirmDialog,
  toast,
} from '@/components/ui';
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

type SortField = 'roll' | 'name';
type SortOrder = 'asc' | 'desc';

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

  // Search & Sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('roll');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Correction state
  const [correctionReason, setCorrectionReason] = useState('');
  const [correctingStudentId, setCorrectingStudentId] = useState<string | null>(null);
  const [correctionStatus, setCorrectionStatus] = useState<AttendanceStatus | null>(null);

  // ConfirmDialog states
  const [lockConfirmOpen, setLockConfirmOpen] = useState(false);
  const [publishConfirmOpen, setPublishConfirmOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const isLocked = !!initialSession?.locked_at;
  const isPublished = !!initialSession?.published_at;
  
  const statusLabel = isPublished ? 'Published' : isLocked ? 'Locked' : initialSession ? 'Draft' : 'Unmarked';

  // Filter enrolled students
  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return enrolledStudents;

    return enrolledStudents.filter((enr) => {
      const fullName = `${enr.students.first_name} ${enr.students.last_name}`.toLowerCase();
      const rollStr = enr.roll_number !== null ? String(enr.roll_number) : '';
      return fullName.includes(query) || rollStr.includes(query);
    });
  }, [enrolledStudents, searchQuery]);

  // Sort enrolled students
  const sortedStudents = useMemo(() => {
    return [...filteredStudents].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'roll') {
        const rollA = a.roll_number ?? 999999;
        const rollB = b.roll_number ?? 999999;
        comparison = rollA - rollB;
      } else if (sortField === 'name') {
        const nameA = `${a.students.last_name}, ${a.students.first_name}`.toLowerCase();
        const nameB = `${b.students.last_name}, ${b.students.first_name}`.toLowerCase();
        comparison = nameA.localeCompare(nameB);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredStudents, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-muted-foreground inline" aria-hidden="true" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="ml-1 h-3.5 w-3.5 text-primary inline" aria-hidden="true" />
    ) : (
      <ArrowDown className="ml-1 h-3.5 w-3.5 text-primary inline" aria-hidden="true" />
    );
  };

  const getAriaSort = (field: SortField) => {
    if (sortField !== field) return 'none';
    return sortOrder === 'asc' ? 'ascending' : 'descending';
  };

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
      toast.error(res.error);
    } else {
      setMessage({ text: 'Attendance saved successfully.', type: 'success' });
      toast.success('Attendance saved successfully.');
      startTransition(() => router.refresh());
    }
  };

  const confirmLock = async () => {
    if (!initialSession) return;
    setMessage(null);
    try {
      setIsActionLoading(true);
      const res = await lockAttendance(branchId, initialSession.id);
      if (res.error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err = res.error as any;
        const msg = err.message || (typeof err === 'string' ? err : 'Failed to lock');
        setMessage({ text: msg, type: 'error' });
        toast.error(msg);
      } else {
        setMessage({ text: 'Attendance locked successfully.', type: 'success' });
        toast.success('Attendance locked successfully.');
        setLockConfirmOpen(false);
        startTransition(() => router.refresh());
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  const confirmPublish = async () => {
    if (!initialSession) return;
    setMessage(null);
    try {
      setIsActionLoading(true);
      const res = await publishAttendance(branchId, initialSession.id);
      if (res.error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err = res.error as any;
        const msg = err.message || (typeof err === 'string' ? err : 'Failed to publish');
        setMessage({ text: msg, type: 'error' });
        toast.error(msg);
      } else {
        setMessage({ text: 'Attendance published successfully.', type: 'success' });
        toast.success('Attendance published successfully.');
        setPublishConfirmOpen(false);
        startTransition(() => router.refresh());
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCorrect = async () => {
    if (!initialSession || !correctingStudentId || !correctionStatus) return;
    if (!correctionReason.trim()) {
      const msg = 'Correction reason is mandatory';
      setMessage({ text: msg, type: 'error' });
      toast.error(msg);
      return;
    }
    setMessage(null);
    
    const res = await correctAttendance(branchId, initialSession.id, correctingStudentId, correctionStatus, correctionReason);
    if (res.error) {
      setMessage({ text: res.error, type: 'error' });
      toast.error(res.error);
    } else {
      setMessage({ text: 'Attendance corrected successfully.', type: 'success' });
      toast.success('Attendance corrected successfully.');
      setRecords(prev => ({ ...prev, [correctingStudentId]: correctionStatus }));
      setCorrectingStudentId(null);
      setCorrectionReason('');
      startTransition(() => router.refresh());
    }
  };

  const correctingStudent = enrolledStudents.find(e => e.students.id === correctingStudentId);

  return (
    <div className="bg-surface border border-border p-6 rounded-lg shadow-sm space-y-6">
      
      {message && (
        <div className={`p-4 rounded-md text-sm font-medium ${message.type === 'error' ? 'bg-destructive/10 text-destructive border border-destructive/20' : 'bg-success/10 text-success border border-success/20'}`}>
          {message.text}
        </div>
      )}

      {/* Date and Section Selection */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
        <div className="w-full sm:w-auto">
          <label htmlFor="attendance-date" className="block text-sm font-medium text-foreground mb-1">Date</label>
          <input 
            id="attendance-date"
            type="date" 
            className="block w-full border border-input rounded-md shadow-sm p-2 bg-surface text-foreground text-sm focus:ring-primary focus:border-primary" 
            value={selectedDate}
            onChange={handleDateChange}
            aria-label="Date"
          />
        </div>
        <div className="w-full sm:w-auto min-w-[200px]">
          <label htmlFor="attendance-section" className="block text-sm font-medium text-foreground mb-1">Section</label>
          <select 
            id="attendance-section"
            aria-label="Section"
            className="block w-full border border-input rounded-md shadow-sm p-2 bg-surface text-foreground text-sm focus:ring-primary focus:border-primary"
            value={selectedSectionId || ''}
            onChange={handleSectionChange}
            disabled={isPending}
          >
            <option value="">Select Section</option>
            {sections.map(s => (
              <option key={s.id} value={s.id}>{s.classes?.name} - {s.name}</option>
            ))}
          </select>
        </div>
        
        {selectedSectionId && (
          <div className="sm:ml-auto">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-muted text-foreground border border-border" aria-label="Status Indicator">
              Status: {statusLabel}
            </span>
          </div>
        )}
      </div>

      {isPending && <div className="text-sm text-muted-foreground">Loading attendance data...</div>}

      {selectedSectionId && enrolledStudents.length > 0 && !isPending && (
        <>
          {/* Table Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="relative w-full sm:w-72">
              <Input
                id="attendance-student-search"
                type="search"
                aria-label="Search students in section"
                placeholder="Search by student name or roll..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftAddon={<Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
              />
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs text-muted-foreground font-medium">
                {sortedStudents.length === 0
                  ? '0 students'
                  : `Showing ${sortedStudents.length} of ${enrolledStudents.length} students`}
              </span>
            </div>
          </div>

          {/* Canonical Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead scope="col" aria-sort={getAriaSort('roll')} className="w-24">
                  <button
                    type="button"
                    onClick={() => handleSort('roll')}
                    className="flex items-center gap-1 font-semibold text-muted-foreground hover:text-foreground focus-ring rounded"
                    aria-label={`Sort by Roll Number (${sortField === 'roll' ? sortOrder : 'none'})`}
                  >
                    Roll No {getSortIcon('roll')}
                  </button>
                </TableHead>
                <TableHead scope="col" aria-sort={getAriaSort('name')}>
                  <button
                    type="button"
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 font-semibold text-muted-foreground hover:text-foreground focus-ring rounded"
                    aria-label={`Sort by Student Name (${sortField === 'name' ? sortOrder : 'none'})`}
                  >
                    Student {getSortIcon('name')}
                  </button>
                </TableHead>
                <TableHead scope="col">
                  Attendance
                </TableHead>
                {isAdmin && (isLocked || isPublished) && (
                  <TableHead scope="col" className="text-right">
                    <span className="sr-only">Actions</span>
                    Actions
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedStudents.length === 0 ? (
                <TableEmptyRow
                  colSpan={isAdmin && (isLocked || isPublished) ? 4 : 3}
                  title="No matching students"
                  description={`No students in this section matched "${searchQuery}".`}
                  action={
                    searchQuery ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSearchQuery('')}
                      >
                        Clear Filter
                      </Button>
                    ) : undefined
                  }
                />
              ) : (
                sortedStudents.map((enr) => {
                  const student = enr.students;
                  const currentStatus = records[student.id];
                  
                  return (
                    <TableRow key={student.id}>
                      <TableCell className="text-muted-foreground font-mono text-xs">
                        {enr.roll_number ?? '-'}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {student.first_name} {student.last_name}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-4">
                          {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as AttendanceStatus[]).map((status) => (
                            <label key={status} className="flex items-center space-x-1.5 cursor-pointer text-xs">
                              <input
                                type="radio"
                                name={`status-${student.id}`}
                                value={status}
                                checked={currentStatus === status}
                                onChange={() => handleStatusChange(student.id, status)}
                                disabled={isLocked || isPublished}
                                aria-label={`${status} for ${student.first_name}`}
                                className="text-primary focus:ring-primary h-3.5 w-3.5 border-input"
                              />
                              <span className={`font-medium ${
                                status === 'PRESENT' ? 'text-success' :
                                status === 'ABSENT' ? 'text-destructive' :
                                status === 'LATE' ? 'text-warning' : 'text-muted-foreground'
                              }`}>
                                {status}
                              </span>
                            </label>
                          ))}
                        </div>
                      </TableCell>
                      {isAdmin && (isLocked || isPublished) && (
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setCorrectingStudentId(student.id);
                              setCorrectionStatus(currentStatus);
                              setCorrectionReason('');
                            }}
                            className="text-primary hover:text-primary hover:bg-primary/10 text-xs"
                          >
                            Correct
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Action Footer Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border">
            {!isLocked && !isPublished && (
              <Button 
                type="button"
                variant="primary"
                onClick={handleSave}
              >
                Save Attendance
              </Button>
            )}
            
            {!isLocked && !isPublished && initialSession && (
              <Button 
                type="button"
                variant="outline"
                onClick={() => setLockConfirmOpen(true)}
                className="text-warning border-warning hover:bg-warning/10"
              >
                Lock Session
              </Button>
            )}
            
            {isAdmin && isLocked && !isPublished && (
              <Button 
                type="button"
                variant="primary"
                onClick={() => setPublishConfirmOpen(true)}
                className="bg-success text-success-foreground hover:bg-success/90"
              >
                Publish Session
              </Button>
            )}
          </div>
        </>
      )}

      {selectedSectionId && enrolledStudents.length === 0 && !isPending && (
        <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-lg">
          No active enrollments found for this section.
        </div>
      )}

      {/* Accessible Correction Dialog */}
      <Dialog
        isOpen={!!correctingStudentId}
        onClose={() => setCorrectingStudentId(null)}
        title="Correct Attendance Record"
        description={
          correctingStudent
            ? `Update published or locked attendance for ${correctingStudent.students.first_name} ${correctingStudent.students.last_name}.`
            : 'Update attendance record.'
        }
        maxWidth="md"
      >
        <div className="space-y-4 mt-4">
          <div>
            <label htmlFor="correction-status" className="block text-sm font-medium text-foreground mb-1">
              New Status
            </label>
            <select 
              id="correction-status"
              className="w-full border border-input rounded-md p-2 bg-surface text-foreground text-sm focus:ring-primary focus:border-primary"
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
          
          <div>
            <label htmlFor="correction-reason" className="block text-sm font-medium text-foreground mb-1">
              Correction Reason <span className="text-destructive">*</span>
            </label>
            <textarea 
              id="correction-reason"
              className="w-full border border-input rounded-md p-2 bg-surface text-foreground text-sm focus:ring-primary focus:border-primary"
              rows={3}
              value={correctionReason}
              onChange={(e) => setCorrectionReason(e.target.value)}
              placeholder="Mandatory audit explanation for correcting locked/published attendance..."
              aria-label="Correction Reason"
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            <Button 
              type="button"
              variant="outline"
              onClick={() => setCorrectingStudentId(null)}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              variant="primary"
              onClick={handleCorrect}
            >
              Apply Correction
            </Button>
          </div>
        </div>
      </Dialog>

      {/* ConfirmDialog: Lock Attendance */}
      <ConfirmDialog
        isOpen={lockConfirmOpen}
        onClose={() => setLockConfirmOpen(false)}
        onConfirm={confirmLock}
        title="Lock Attendance Session"
        message="Are you sure you want to lock attendance for this section and date? Once locked, teachers will no longer be able to modify records without administrative correction."
        confirmText="Lock Attendance"
        cancelText="Cancel"
        isDestructive={false}
        isLoading={isActionLoading}
      />

      {/* ConfirmDialog: Publish Attendance */}
      <ConfirmDialog
        isOpen={publishConfirmOpen}
        onClose={() => setPublishConfirmOpen(false)}
        onConfirm={confirmPublish}
        title="Publish Attendance Session"
        message="Are you sure you want to publish attendance? Published absences and lates will immediately become visible to parents and students in their history."
        confirmText="Publish Attendance"
        cancelText="Cancel"
        isDestructive={false}
        isLoading={isActionLoading}
      />

    </div>
  );
}
