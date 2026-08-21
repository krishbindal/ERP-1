with open('apps/web/src/app/scheduling/timetable/components/TimetableEntryForm.tsx', 'r') as f:
    content = f.read()

replacement = '''
        </div>
        
        {initialData && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select name="status" defaultValue={initialData.status} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
              <option value="ACTIVE">ACTIVE</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-3">
'''

content = content.replace('''
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
''', replacement)

with open('apps/web/src/app/scheduling/timetable/components/TimetableEntryForm.tsx', 'w') as f:
    f.write(content)
