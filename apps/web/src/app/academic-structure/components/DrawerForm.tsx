import { ReactNode } from 'react';

interface DrawerFormProps {
  title: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  loading: boolean;
  error: string | null;
  children: ReactNode;
}

export function DrawerForm({ title, onClose, onSubmit, loading, error, children }: DrawerFormProps) {
  return (
    <div className="fixed inset-0 overflow-hidden z-50">
      <div className="absolute inset-0 overflow-hidden">
        <button type="button" aria-label="Close drawer" className="absolute inset-0 w-full h-full bg-gray-500 bg-opacity-75 transition-opacity cursor-default outline-none border-none" onClick={onClose} onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}></button>
        <section className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
          <div className="w-screen max-w-md">
            <form onSubmit={onSubmit} className="h-full divide-y divide-gray-200 flex flex-col bg-white shadow-xl">
              <div className="flex-1 h-0 overflow-y-auto">
                <div className="py-6 px-4 bg-blue-700 sm:px-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-white">{title}</h2>
                    <button type="button" onClick={onClose} className="text-blue-200 hover:text-white">Close</button>
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="px-4 divide-y divide-gray-200 sm:px-6">
                    <div className="space-y-6 pt-6 pb-5">
                      {error && <div className="text-red-600 text-sm">{error}</div>}
                      {children}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 px-4 py-4 flex justify-end">
                <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">Cancel</button>
                <button disabled={loading} type="submit" className="ml-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">Save</button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

