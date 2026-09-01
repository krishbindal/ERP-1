/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitHomework } from '@/lib/homework/actions';

export function StudentHomeworkDetails({
  branchId,
  assignment,
  submission,
  isGuardian,
}: {
  branchId: string;
  assignment: any;
  submission: any;
  isGuardian: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState(submission?.student_comment || '');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await submitHomework({
      assignmentId: assignment.id,
      expectedVersion: submission?.version || 0,
      comment,
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded shadow space-y-4">
        <h1 className="text-2xl font-bold">{assignment.title}</h1>
        <div>
          <span className="font-semibold text-gray-700">Description: </span>
          <p className="mt-1">{assignment.description || 'No description provided.'}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div><span className="font-semibold">Section:</span> {assignment.sections?.name}</div>
          <div><span className="font-semibold">Subject:</span> {assignment.subjects?.name}</div>
          <div><span className="font-semibold">Due Date:</span> {new Date(assignment.due_at).toLocaleString()}</div>
          <div><span className="font-semibold">Max Marks:</span> {assignment.max_marks || 'N/A'}</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow space-y-4">
        <h2 className="text-xl font-semibold">Your Submission</h2>
        {submission ? (
          <div className="space-y-2">
            <p><span className="font-semibold">Status:</span> {submission.status}</p>
            {submission.submitted_at && <p><span className="font-semibold">Submitted at:</span> {new Date(submission.submitted_at).toLocaleString()}</p>}
            {submission.marks_awarded !== null && <p><span className="font-semibold">Marks:</span> {submission.marks_awarded}</p>}
            {submission.teacher_feedback && <p><span className="font-semibold">Feedback:</span> {submission.teacher_feedback}</p>}
          </div>
        ) : (
          <p className="text-gray-500">Not submitted yet.</p>
        )}

        {isGuardian && (
          <p className="text-gray-500 mt-4">Guardians cannot submit homework on behalf of students directly.</p>
        )}

        {!isGuardian && assignment.status === 'PUBLISHED' && (!submission || submission.status === 'PENDING' || submission.status === 'RETURNED') && (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4 border-t pt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Comment</label>
              <textarea 
                className="w-full border rounded p-2" 
                rows={3} 
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Homework'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
