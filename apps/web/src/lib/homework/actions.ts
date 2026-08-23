'use server'

import { createClient } from '@/lib/supabase/server'
import { ActionResult } from '@/lib/server-actions'
import { revalidatePath } from 'next/cache'

// Note: EventBus is assumed to exist conceptually per previous modules, or we implement a simple placeholder.
// The contract says: emit HOMEWORK_PUBLISHED asynchronously.
// In this project, we might just use a placeholder function or a real service if available.
async function emitHomeworkPublishedEvent(assignmentId: string) {
  // Fire and forget, no await if we don't want to block, but in Next.js server actions, 
  // dangling promises can be cancelled, so we typically await a background queue insert,
  // or log it. Since we don't have the EventBus implementation details, we will just log it.
  console.log(`[EventBus] HOMEWORK_PUBLISHED emitted for assignment: ${assignmentId}`)
}

export async function createHomeworkAssignment(params: {
  branchId: string
  academicYearId: string
  classId: string
  sectionId: string
  subjectId: string
  title: string
  description: string
  issueAt: string
  dueAt: string
  maxMarks: number | null
}): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('rpc_create_homework_assignment', {
    p_branch_id: params.branchId,
    p_academic_year_id: params.academicYearId,
    p_class_id: params.classId,
    p_section_id: params.sectionId,
    p_subject_id: params.subjectId,
    p_title: params.title,
    p_description: params.description,
    p_issue_at: params.issueAt,
    p_due_at: params.dueAt,
    p_max_marks: params.maxMarks
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/homework')
  return { success: true, data: { id: data } }
}

export async function updateHomeworkAssignment(params: {
  id: string
  expectedUpdatedAt: string
  title: string
  description: string
  issueAt: string
  dueAt: string
  maxMarks: number | null
}): Promise<ActionResult<boolean>> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('rpc_update_homework_assignment', {
    p_id: params.id,
    p_expected_updated_at: params.expectedUpdatedAt,
    p_title: params.title,
    p_description: params.description,
    p_issue_at: params.issueAt,
    p_due_at: params.dueAt,
    p_max_marks: params.maxMarks
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/homework')
  return { success: true, data }
}

export async function publishHomeworkAssignment(params: {
  id: string
  expectedUpdatedAt: string
}): Promise<ActionResult<boolean>> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('rpc_publish_homework', {
    p_id: params.id,
    p_expected_updated_at: params.expectedUpdatedAt
  })

  if (error) {
    return { success: false, error: error.message }
  }

  // Emitting the event asynchronously, isolated from the DB transaction
  try {
    // Wait for the async event to queue, but catch any errors to prevent failing the request.
    await emitHomeworkPublishedEvent(params.id)
  } catch (eventErr) {
    console.error('Failed to emit HOMEWORK_PUBLISHED event', eventErr)
  }

  revalidatePath('/homework')
  return { success: true, data }
}

export async function closeHomeworkAssignment(params: {
  id: string
  expectedUpdatedAt: string
}): Promise<ActionResult<boolean>> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('rpc_close_homework', {
    p_id: params.id,
    p_expected_updated_at: params.expectedUpdatedAt
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/homework')
  return { success: true, data }
}

export async function submitHomework(params: {
  assignmentId: string
  expectedVersion: number
  comment: string
}): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('rpc_submit_homework', {
    p_assignment_id: params.assignmentId,
    p_expected_version: params.expectedVersion,
    p_comment: params.comment
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/homework')
  return { success: true, data: { id: data } }
}

export async function gradeSubmission(params: {
  submissionId: string
  expectedVersion: number
  marks: number | null
  feedback: string
}): Promise<ActionResult<boolean>> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('rpc_grade_submission', {
    p_submission_id: params.submissionId,
    p_expected_version: params.expectedVersion,
    p_marks: params.marks,
    p_feedback: params.feedback
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/homework')
  return { success: true, data }
}

export async function returnSubmission(params: {
  submissionId: string
  expectedVersion: number
  feedback: string
}): Promise<ActionResult<boolean>> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('rpc_return_submission', {
    p_submission_id: params.submissionId,
    p_expected_version: params.expectedVersion,
    p_feedback: params.feedback
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/homework')
  return { success: true, data }
}


