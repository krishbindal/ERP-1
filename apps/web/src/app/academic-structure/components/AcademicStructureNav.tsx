import Link from 'next/link';

interface AcademicStructureNavProps {
  currentTab: 'years' | 'classes' | 'sections' | 'calendar';
  explicitBranchId?: string;
}

const TABS = [
  { id: 'years', label: 'Academic Years', basePath: '/academic-structure' },
  { id: 'classes', label: 'Classes', basePath: '/academic-structure' },
  { id: 'sections', label: 'Sections', basePath: '/academic-structure' },
  { id: 'calendar', label: 'Calendar', basePath: '/academic-structure/calendar' },
];

export function AcademicStructureNav({ currentTab, explicitBranchId }: AcademicStructureNavProps) {
  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8">
        {TABS.map((tab) => {
          const isSelected = currentTab === tab.id;
          const href = tab.id === 'calendar' 
            ? `${tab.basePath}${explicitBranchId ? `?branchId=${explicitBranchId}` : ''}`
            : `${tab.basePath}?tab=${tab.id}${explicitBranchId ? `&branchId=${explicitBranchId}` : ''}`;
            
          return (
            <Link
              key={tab.id}
              href={href}
              className={`${
                isSelected
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
