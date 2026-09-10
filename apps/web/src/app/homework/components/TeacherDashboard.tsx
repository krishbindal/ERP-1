/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Link from 'next/link';

export function TeacherDashboard({ 
  branchId, 
  assignments,
  sessionId
}: { 
  branchId: string; 
  assignments: any[];
  sessionId?: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Assignments</h2>
        <Link
          href={`/homework/new?branchId=${branchId}${sessionId ? `&session=${sessionId}` : ''}`}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
        >
          Create Assignment
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg p-4">
        {assignments.length === 0 ? (
          <p className="text-gray-500">No homework assignments found.</p>
        ) : (
          <ul className="divide-y">
            {assignments.map(a => (
              <li key={a.id} className="py-4 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">{a.title}</h3>
                  <div className="flex space-x-2 text-sm text-gray-600">
                    <span className="bg-gray-100 px-2 py-1 rounded">{a.status}</span>
                    <span>{a.subjects?.name}</span>
                    <span>{a.sections?.name}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Due: {new Date(a.due_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <Link
                    href={`/homework/${a.id}?branchId=${branchId}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    Manage
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
