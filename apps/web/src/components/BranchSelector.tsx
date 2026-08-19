"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function BranchSelector({ branches, currentBranchId }: { branches: {id: string, name: string}[], currentBranchId: string }) {
  const router = useRouter();

  useEffect(() => {
    if (!currentBranchId && branches.length > 0) {
      document.cookie = `active_branch_id=${branches[0].id}; path=/`;
      router.refresh();
    }
  }, [branches, currentBranchId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    document.cookie = `active_branch_id=${newId}; path=/`;
    router.refresh();
  };

  return (
    <select 
      value={currentBranchId || (branches.length > 0 ? branches[0].id : '')} 
      onChange={handleChange}
      className="border border-gray-300 rounded-md py-1 px-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
    >
      {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
    </select>
  );
}
