/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createHomeworkAssignment, updateHomeworkAssignment } from '@/lib/homework/actions';

export function HomeworkForm({
  branchId,
  academicYearId,
  sections,
  subjects,
  initialData,
}: {
  branchId: string;
  academicYearId: string;
  sections: { id: string; name: string; class_id: string }[];
  subjects: { id: string; name: string }[];
  initialData?: any;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    
    // Convert local datetime to ISO string
    const issueAt = new Date(formData.get('issueAt') as string).toISOString();
    const dueAt = new Date(formData.get('dueAt') as string).toISOString();
    
    const params = {
      branchId,
      academicYearId,
      classId: sections.find(s => s.id === formData.get('sectionId'))?.class_id || '', 
      sectionId: formData.get('sectionId') as string,
      subjectId: formData.get('subjectId') as string,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      issueAt,
      dueAt,
      maxMarks: formData.get('maxMarks') ? parseFloat(formData.get('maxMarks') as string) : null,
    };

    let result;
    if (initialData?.id) {
      result = await updateHomeworkAssignment({
        id: initialData.id,
        expectedUpdatedAt: initialData.updated_at,
        ...params
      });
    } else {
      result = await createHomeworkAssignment(params);
    }

    setLoading(false);
    if (result.success) {
      router.push(`/homework/${initialData?.id || result.data?.id}?branchId=${branchId}`);
    } else {
      setError(result.error || 'Failed to save assignment');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-600 bg-red-50 p-3 rounded">{error}</div>}
      
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input name="title" required className="w-full border rounded p-2" defaultValue={initialData?.title} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description / Instructions</label>
        <textarea name="description" className="w-full border rounded p-2" rows={4} defaultValue={initialData?.description}></textarea>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Section</label>
          <select name="sectionId" required className="w-full border rounded p-2" defaultValue={initialData?.section_id}>
            <option value="">Select Section</option>
            {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Subject</label>
          <select name="subjectId" required className="w-full border rounded p-2" defaultValue={initialData?.subject_id}>
            <option value="">Select Subject</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Issue Date</label>
          <input name="issueAt" type="datetime-local" required className="w-full border rounded p-2" defaultValue={initialData?.issue_at ? new Date(initialData.issue_at).toISOString().slice(0, 16) : ''} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Due Date</label>
          <input name="dueAt" type="datetime-local" required className="w-full border rounded p-2" defaultValue={initialData?.due_at ? new Date(initialData.due_at).toISOString().slice(0, 16) : ''} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Max Marks (Optional)</label>
        <input name="maxMarks" type="number" step="0.01" className="w-full border rounded p-2" defaultValue={initialData?.max_marks} />
      </div>

      <div className="pt-4 flex justify-end space-x-2">
        <button type="button" onClick={() => router.back()} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Saving...' : 'Save Draft'}
        </button>
      </div>
    </form>
  );
}
