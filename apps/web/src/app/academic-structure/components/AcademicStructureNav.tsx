import Link from 'next/link';

interface AcademicStructureNavProps {
  currentTab: 'years' | 'classes' | 'sections' | 'calendar';
  explicitBranchId?: string;
}

export function AcademicStructureNav({ currentTab, explicitBranchId }: AcademicStructureNavProps) {
  const branchQuery = explicitBranchId ? `&branchId=${explicitBranchId}` : '';
  const branchQueryQuestion = explicitBranchId ? `?branchId=${explicitBranchId}` : '';

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        <Link
          href={`/academic-structure?tab=years${branchQuery}`}
          className={`${
            currentTab === 'years'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
        >
          Academic Years
        </Link>
        <Link
          href={`/academic-structure?tab=classes${branchQuery}`}
          className={`${
            currentTab === 'classes'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
        >
          Classes
        </Link>
        <Link
          href={`/academic-structure?tab=sections${branchQuery}`}
          className={`${
            currentTab === 'sections'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
        >
          Sections
        </Link>
        <Link
          href={`/academic-structure/calendar${branchQueryQuestion}`}
          className={`${
            currentTab === 'calendar'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
        >
          Calendar
        </Link>
      </nav>
    </div>
  );
}
