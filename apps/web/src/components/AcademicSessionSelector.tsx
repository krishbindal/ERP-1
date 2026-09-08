'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface AcademicYear {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: string;
}

interface Props {
  years: AcademicYear[];
  currentSessionId?: string;
  branchId?: string;
}

export function AcademicSessionSelector({ years, currentSessionId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSessionId = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    
    if (newSessionId) {
      params.set('session', newSessionId);
    } else {
      params.delete('session');
    }
    
    router.push(pathname + '?' + params.toString());
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="academic-session" className="text-sm font-medium text-gray-700">
        Academic Session:
      </label>
      <select
        id="academic-session"
        value={currentSessionId || ''}
        onChange={handleSelect}
        className="px-3 py-1.5 border border-gray-300 rounded text-sm bg-white"
      >
        <option value="" disabled>Select Session</option>
        {years.map(year => (
          <option key={year.id} value={year.id}>
            {year.name} ({year.status})
          </option>
        ))}
      </select>
    </div>
  );
}
