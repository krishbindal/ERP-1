import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createHomeworkAssignment, publishHomeworkAssignment, submitHomework } from './actions'
import { createClient } from '@/lib/supabase/server'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn()
}))
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}))

describe('Homework Server Actions', () => {
  const mockRpc = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      rpc: mockRpc
    })
  })

  it('createHomeworkAssignment calls rpc_create_homework_assignment', async () => {
    mockRpc.mockResolvedValueOnce({ data: 'new-id', error: null })
    
    const res = await createHomeworkAssignment({
      branchId: 'b1',
      academicYearId: 'ay1',
      classId: 'c1',
      sectionId: 'sec1',
      subjectId: 'sub1',
      title: 'Math',
      description: 'Algebra',
      issueAt: '2026-08-20T00:00:00Z',
      dueAt: '2026-08-25T00:00:00Z',
      maxMarks: 100
    })

    expect(mockRpc).toHaveBeenCalledWith('rpc_create_homework_assignment', {
      p_branch_id: 'b1',
      p_academic_year_id: 'ay1',
      p_class_id: 'c1',
      p_section_id: 'sec1',
      p_subject_id: 'sub1',
      p_title: 'Math',
      p_description: 'Algebra',
      p_issue_at: '2026-08-20T00:00:00Z',
      p_due_at: '2026-08-25T00:00:00Z',
      p_max_marks: 100
    })
    expect(res).toEqual({ success: true, data: { id: 'new-id' } })
  })

  it('publishHomeworkAssignment calls rpc_publish_homework and handles event gracefully', async () => {
    mockRpc.mockResolvedValueOnce({ data: true, error: null })
    
    const res = await publishHomeworkAssignment({
      id: 'h1',
      expectedUpdatedAt: '2026-08-20T00:00:00Z'
    })

    expect(mockRpc).toHaveBeenCalledWith('rpc_publish_homework', {
      p_id: 'h1',
      p_expected_updated_at: '2026-08-20T00:00:00Z'
    })
    expect(res).toEqual({ success: true, data: true })
  })

  it('submitHomework calls rpc_submit_homework', async () => {
    mockRpc.mockResolvedValueOnce({ data: 'sub-id', error: null })
    
    const res = await submitHomework({
      assignmentId: 'h1',
      expectedVersion: 1,
      comment: 'Here is my work'
    })

    expect(mockRpc).toHaveBeenCalledWith('rpc_submit_homework', {
      p_assignment_id: 'h1',
      p_expected_version: 1,
      p_comment: 'Here is my work'
    })
    expect(res).toEqual({ success: true, data: { id: 'sub-id' } })
  })
})



