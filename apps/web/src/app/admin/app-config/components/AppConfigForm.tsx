"use client";
import { useState } from 'react';
import { updateBranchAppConfig, AppConfigPayload } from '../actions';

type AppConfigFormProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData: any;
};

export function AppConfigForm({ initialData }: AppConfigFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const data: AppConfigPayload = {
      app_name: formData.get('app_name') as string,
      android_package_id: formData.get('android_package_id') as string || undefined,
      ios_bundle_id: formData.get('ios_bundle_id') as string || undefined,
      slug: formData.get('slug') as string || undefined,
      status: formData.get('status') as 'draft' | 'active' | 'archived',
      support_contact: formData.get('support_contact') as string || undefined,
    };

    try {
      const result = await updateBranchAppConfig(data);

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess('Configuration updated successfully.');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
        <div className="sm:col-span-2">
          <label htmlFor="app_name" className="block text-sm font-medium text-gray-700">App Name</label>
          <div className="mt-1">
            <input required defaultValue={initialData?.app_name} type="text" name="app_name" id="app_name" className="block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md" />
          </div>
          <p className="mt-2 text-sm text-gray-500">The human-readable name of the mobile application.</p>
        </div>

        <div>
          <label htmlFor="android_package_id" className="block text-sm font-medium text-gray-700">Android Package ID</label>
          <div className="mt-1">
            <input defaultValue={initialData?.android_package_id} type="text" name="android_package_id" id="android_package_id" placeholder="com.schoolos.branch" className="block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md" />
          </div>
        </div>

        <div>
          <label htmlFor="ios_bundle_id" className="block text-sm font-medium text-gray-700">iOS Bundle ID</label>
          <div className="mt-1">
            <input defaultValue={initialData?.ios_bundle_id} type="text" name="ios_bundle_id" id="ios_bundle_id" placeholder="com.schoolos.branch" className="block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md" />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700">URL Slug</label>
          <div className="mt-1">
            <input defaultValue={initialData?.slug} type="text" name="slug" id="slug" className="block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md" />
          </div>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
          <div className="mt-1">
            <select required defaultValue={initialData?.status || 'draft'} name="status" id="status" className="block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md">
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="support_contact" className="block text-sm font-medium text-gray-700">Support Contact Email</label>
          <div className="mt-1">
            <input defaultValue={initialData?.support_contact} type="email" name="support_contact" id="support_contact" className="block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md" />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </form>
  );
}
