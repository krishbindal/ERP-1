/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import Link from 'next/link';

export function StudentDashboard({ 
  branchId, 
  assignments, 
  isGuardian 
}: { 
  branchId: string; 
  assignments: any[]; 
  isGuardian: boolean 
}) {
  return (
    <div className="space-y-4">
      <div className="bg-white shadow rounded-lg p-4">
        {assignments.length === 0 ? (
          <p className="text-gray-500">No homework assignments found.</p>
        ) : (
          <ul className="divide-y">
            {assignments.map(a => (
              <li key={a.id} className="py-4 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">{a.title}</h3>
                  <p className="text-sm text-gray-600">
                    {a.subjects?.name} | {a.sections?.name}
                  </p>
                  <p className="text-sm text-gray-500">Due: {new Date(a.due_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <Link
                    href={`/homework/${a.id}?branchId=${branchId}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    View Details
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
