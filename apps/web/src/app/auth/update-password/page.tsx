'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updatePasswordAction } from './actions';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-6 max-w-sm w-full bg-white shadow rounded">
        <h1 className="text-xl font-bold mb-2">Update Password</h1>
        <p className="text-sm text-gray-600 mb-6">You must change your password before continuing.</p>
        
        {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}
        
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setError('');
            const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value;
            const confirm = (e.currentTarget.elements.namedItem('confirm') as HTMLInputElement).value;
            
            if (password.length < 6) {
              setError('Password must be at least 6 characters.');
              return;
            }
            if (password !== confirm) {
              setError('Passwords do not match.');
              return;
            }

            setLoading(true);
            const result = await updatePasswordAction(password);
            setLoading(false);

            if (result.error) {
              setError(result.error);
            } else {
              window.location.href = '/';
            }
          }}
        >
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</label>
            <input 
              type="password" 
              id="password" 
              name="password"
              required
              disabled={loading}
              className="mt-1 p-2 w-full border rounded" 
            />
          </div>
          <div className="mb-6">
            <label htmlFor="confirm" className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input 
              type="password" 
              id="confirm" 
              name="confirm"
              required
              disabled={loading}
              className="mt-1 p-2 w-full border rounded" 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <a href="/auth/logout" className="text-sm text-blue-600 hover:underline">Sign out</a>
        </div>
      </div>
    </div>
  );
}
