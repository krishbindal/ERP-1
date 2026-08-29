'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface CommunicationTarget {
  target_type: string;
  target_id: string;
  target_name: string;
}

export function CommunicationForm({
  targets,
  createAction,
}: {
  targets: CommunicationTarget[];
  createAction: (formData: FormData) => Promise<{ error: string } | { success: true }>;
}) {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string>(targets.length > 0 ? targets[0].target_type : '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Filter valid types for the first dropdown
  const uniqueTypes = Array.from(new Set(targets.map((t) => t.target_type)));
  
  // Specific targets for the currently selected type
  const availableTargets = targets.filter((t) => t.target_type === selectedType && t.target_type !== 'BRANCH');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const target_id = formData.get('target_id') as string;

    if (selectedType !== 'BRANCH' && !target_id) {
      setError('Please select a specific class or section.');
      setLoading(false);
      return;
    }

    try {
      const result = await createAction(formData);
      if ('error' in result) {
        setError(result.error);
        setLoading(false);
      } else {
        router.push('/communication');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
      {error && <div className="p-4 bg-red-50 text-red-600 rounded-md">{error}</div>}

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Recipient Type</label>
          <select
            name="target_type"
            className="w-full border rounded-md p-2"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            {uniqueTypes.map((type) => (
              <option key={type} value={type}>
                {type === 'BRANCH' ? 'Entire Branch' : type === 'CLASS' ? 'Class' : 'Section'}
              </option>
            ))}
          </select>
        </div>

        {selectedType !== 'BRANCH' && (
          <div className="space-y-2">
            <label className="block text-sm font-medium">Select {selectedType.toLowerCase()}</label>
            <select name="target_id" className="w-full border rounded-md p-2" required>
              <option value="">Select...</option>
              {availableTargets.map((t) => (
                <option key={t.target_id} value={t.target_id}>
                  {t.target_name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Subject</label>
        <input type="text" name="subject" required className="w-full border rounded-md p-2" />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Message</label>
        <textarea name="content" required rows={5} className="w-full border rounded-md p-2"></textarea>
      </div>

      <div className="flex justify-end space-x-4">
        <button type="button" onClick={() => router.push('/communication')} className="px-4 py-2 border rounded-md hover:bg-gray-50">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </div>
    </form>
  );
}
