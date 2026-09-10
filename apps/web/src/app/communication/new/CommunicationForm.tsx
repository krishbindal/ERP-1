'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Select, toast } from '@/components/ui';
import { AlertCircle } from 'lucide-react';

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
      const validationError = 'Please select a specific class or section.';
      setError(validationError);
      toast.error(validationError);
      setLoading(false);
      return;
    }

    try {
      const result = await createAction(formData);
      if ('error' in result) {
        setError(result.error);
        toast.error(result.error);
        setLoading(false);
      } else {
        toast.success('Message sent successfully!');
        router.push('/communication');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  const errorId = 'communication-form-error';

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-surface p-6 rounded-lg shadow-sm border border-border">
      {error && (
        <div
          id={errorId}
          role="alert"
          aria-live="assertive"
          className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive"
        >
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-4">
        <Select
          id="target_type"
          name="target_type"
          label="Recipient Type"
          required
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          options={uniqueTypes.map((type) => ({
            value: type,
            label: type === 'BRANCH' ? 'Entire Branch' : type === 'CLASS' ? 'Class' : 'Section',
          }))}
        />

        {selectedType !== 'BRANCH' && (
          <Select
            id="target_id"
            name="target_id"
            label={`Select ${selectedType.toLowerCase()}`}
            required
            placeholder="Select..."
            error={error === 'Please select a specific class or section.' ? 'Selection required' : undefined}
            aria-describedby={error ? errorId : undefined}
            options={availableTargets.map((t) => ({
              value: t.target_id,
              label: t.target_name,
            }))}
          />
        )}
      </div>

      <Input
        id="subject"
        name="subject"
        label="Subject"
        required
        placeholder="Enter message subject"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      />

      <div className="w-full">
        <label htmlFor="content" className="block text-sm font-medium text-foreground mb-1.5">
          Message
          <span className="text-destructive ml-0.5" aria-hidden="true">
            *
          </span>
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={5}
          placeholder="Type your message here..."
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-ring hover:border-muted-foreground/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/communication')}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={loading}
          loadingText="Sending..."
        >
          Send Message
        </Button>
      </div>
    </form>
  );
}
