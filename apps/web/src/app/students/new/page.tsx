import React from 'react'; import Link from 'next/link';
import { StudentsService } from '@/services/students.service'
import { redirect } from 'next/navigation'

export default function NewStudentPage() {
  async function createStudent(formData: FormData) {
    'use server'
    
    // Hardcode org/branch for dummy UI, normally from session context
    const orgId = '11111111-1111-1111-1111-111111111111'
    const branchId = '33333333-3333-3333-3333-333333333333'
    
    const result = await StudentsService.createStudentWithPlacement(
      orgId, 
      branchId, 
      {
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        dateOfBirth: formData.get('dateOfBirth') as string || undefined,
      }
    )
    
    if ('error' in result) {
      console.error(result.error)
      // Normally return error to UI
      return
    }
    
    redirect(`/students/${result.id}`)
  }

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Enroll New Student</h1>
      
      <form action={createStudent} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700">First Name</label>
          <input required type="text" name="firstName" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Last Name</label>
          <input required type="text" name="lastName" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
          <input type="date" name="dateOfBirth" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
        </div>
        
        <div className="pt-4 flex justify-end space-x-3">
          <Link href="/students" className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50">Cancel</Link>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Create & Enroll
          </button>
        </div>
      </form>
    </div>
  )
}
