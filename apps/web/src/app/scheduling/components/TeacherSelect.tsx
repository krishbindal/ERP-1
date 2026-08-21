export function TeacherSelect({ 
  teachers, 
  name, 
  id, 
  label, 
  defaultValue = '' 
}: { 
  teachers: any[]; 
  name: string; 
  id: string; 
  label: string; 
  defaultValue?: string 
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select id={id} name={name} className="w-full border border-gray-300 rounded-md p-2" required defaultValue={defaultValue}>
        <option value="">Select Teacher...</option>
        {teachers.map(t => {
          let tName = 'Unknown';
          if (t.staff) {
            tName = Array.isArray(t.staff) ? \\ \\ : \\ \\;
          }
          return (
            <option key={t.id} value={t.id}>{tName}</option>
          );
        })}
      </select>
    </div>
  );
}
