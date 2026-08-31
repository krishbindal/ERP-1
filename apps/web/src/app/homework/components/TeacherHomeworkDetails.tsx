/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { publishHomeworkAssignment, closeHomeworkAssignment } from '@/lib/homework/actions';
import Link from 'next/link';

export function TeacherHomeworkDetails({
  branchId,
  assignment,
  submissions,
}: {
  branchId: string;
  assignment: any;
  submissions: any[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handlePublish() {
    setLoading(true);
    await publishHomeworkAssignment({ id: assignment.id, expectedUpdatedAt: assignment.updated_at });
    setLoading(false);
    router.refresh();
  }

  async function handleClose() {
    setLoading(true);
    await closeHomeworkAssignment({ id: assignment.id, expectedUpdatedAt: assignment.updated_at });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{assignment.title}</h1>
        <div className="space-x-2">
          {assignment.status === 'DRAFT' && (
            <>
              <Link 
                href={`/homework/${assignment.id}/edit?branchId=${branchId}`}
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50 mr-2 inline-block"
              >
                Edit
              </Link>
              <button 
                onClick={handlePublish} 
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                Publish
              </button>
            </>
          )}
          {assignment.status === 'PUBLISHED' && (
            <button 
              onClick={handleClose} 
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              Close Assignment
            </button>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow space-y-4">
        <div>
          <span className="font-semibold text-gray-700">Status: </span>
          <span className="px-2 py-1 bg-gray-100 rounded text-sm">{assignment.status}</span>
        </div>
        <div>
          <span className="font-semibold text-gray-700">Description: </span>
          <p className="mt-1">{assignment.description || 'No description provided.'}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div><span className="font-semibold">Section:</span> {assignment.sections?.name}</div>
          <div><span className="font-semibold">Subject:</span> {assignment.subjects?.name}</div>
          <div><span className="font-semibold">Issue Date:</span> {new Date(assignment.issue_at).toLocaleString()}</div>
          <div><span className="font-semibold">Due Date:</span> {new Date(assignment.due_at).toLocaleString()}</div>
          <div><span className="font-semibold">Max Marks:</span> {assignment.max_marks || 'N/A'}</div>
        </div>
      </div>

      {assignment.status !== 'DRAFT' && (
        <div className="bg-white p-6 rounded shadow space-y-4">
          <h2 className="text-xl font-semibold">Submissions</h2>
          {submissions.length === 0 ? (
            <p className="text-gray-500">No submissions yet.</p>
          ) : (
            <ul className="divide-y border-t mt-4">
              {submissions.map(sub => (
                <li key={sub.id} className="py-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{sub.students?.first_name} {sub.students?.last_name} (Roll: {sub.students?.roll_number})</p>
                    <p className="text-sm text-gray-500">Status: {sub.status}</p>
                  </div>
                  <div>
                    {/* Basic grade display or link */}
                    <span className="text-sm font-semibold">{sub.marks_awarded !== null ? `${sub.marks_awarded} marks` : 'Ungraded'}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
