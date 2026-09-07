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
    <div className="border-b border-border mb-6">
      <nav className="-mb-px flex space-x-8 overflow-x-auto">
        {TABS.map((tab) => {
          const isSelected = currentTab === tab.id;
          const href = tab.id === 'calendar' 
            ? `${tab.basePath}${explicitBranchId ? `?branchId=${explicitBranchId}` : ''}`
            : `${tab.basePath}?tab=${tab.id}${explicitBranchId ? `&branchId=${explicitBranchId}` : ''}`;
            
          return (
            <Link
              key={tab.id}
              href={href}
              aria-current={isSelected ? "page" : undefined}
              className={`${
                isSelected
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              } whitespace-nowrap py-3 px-3 border-b-2 font-medium text-sm transition-colors`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
