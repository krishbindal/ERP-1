
export function TeacherSelect({ 
  teachers, 
  name, 
  id, 
  label, 
  defaultValue = '' 
}: { 
  teachers: { id: string; staff?: { first_name: string; last_name: string } | { first_name: string; last_name: string }[] | null }[]; 
  name: string; 
  id: string; 
  label: string; 
  defaultValue?: string 
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-foreground mb-1">{label}</label>
      <select id={id} name={name} className="w-full border border-input bg-surface text-foreground rounded-md p-2 focus-ring text-sm" required defaultValue={defaultValue}>
        <option value="">Select Teacher...</option>
        {teachers.map(t => {
          let tName = 'Unknown';
          if (t.staff) {
            tName = Array.isArray(t.staff) ? `${t.staff[0].first_name} ${t.staff[0].last_name}` : `${t.staff.first_name} ${t.staff.last_name}`;
          }
          return (
            <option key={t.id} value={t.id}>{tName}</option>
          );
        })}
      </select>
    </div>
  );
}
