"use server";

import { branchAction } from '@/lib/server-actions';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export interface AttendanceRecordPayload {
  student_id: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface SaveAttendancePayload {
  academic_year_id: string;
  section_id: string;
  date: string;
  records: AttendanceRecordPayload[];
}

export async function saveAttendance(branchId: string | undefined, payload: SaveAttendancePayload) {
  return branchAction(branchId, async ({ supabase, branchId: resolvedBranchId }) => {
    // Call atomic RPC for save
    const { data: sessionId, error: rpcError } = await supabase.rpc('rpc_save_attendance', {
      p_branch_id: resolvedBranchId,
      p_academic_year_id: payload.academic_year_id,
      p_section_id: payload.section_id,
      p_date: payload.date,
      p_records: payload.records
    });

    if (rpcError) return { error: rpcError.message };
    
    return { error: null, data: { sessionId } };
  });
}

export async function lockAttendance(branchId: string | undefined, sessionId: string) {
  return branchAction(branchId, async ({ supabase }) => {
    const { data: user } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('attendance_sessions')
      .update({ locked_at: new Date().toISOString(), locked_by: user?.user?.id })
      .eq('id', sessionId)
      .is('locked_at', null); // Protects against save-vs-lock concurrency
      
    if (error) return { error };
    return { error: null, data: { success: true } };
  });
}

export async function publishAttendance(branchId: string | undefined, sessionId: string) {
  return branchAction(branchId, async ({ supabase }) => {
    const { data: user } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('attendance_sessions')
      .update({ published_at: new Date().toISOString(), published_by: user?.user?.id })
      .eq('id', sessionId)
      .not('locked_at', 'is', null) // Must be locked to publish
      .is('published_at', null);
      
    if (error) return { error };
    
    const { data: session } = await supabase
      .from('attendance_sessions')
      .select('organization_id, branch_id')
      .eq('id', sessionId)
      .single();

    if (session) {
      const { error: eventError } = await supabase.from('platform_events').insert({
        organization_id: session.organization_id,
        branch_id: session.branch_id,
        aggregate_type: 'attendance_session',
        aggregate_id: sessionId,
        event_type: 'attendance.published',
        payload: { session_id: sessionId },
        idempotency_key: `attendance.published.${sessionId}`
      });
      if (eventError) console.error('[EventBus] Failed to enqueue attendance platform event', eventError);
    }
    
    return { error: null, data: { success: true } };
  });
}

export async function correctAttendance(
  branchId: string | undefined, 
  sessionId: string, 
  studentId: string, 
  newStatus: AttendanceStatus, 
  reason: string
) {
  return branchAction(branchId, async ({ supabase, branchId: resolvedBranchId }) => {
    if (!reason || reason.trim().length === 0) {
      return { error: "Correction reason is mandatory" };
    }

    const { data: success, error: rpcError } = await supabase.rpc('rpc_correct_attendance', {
      p_branch_id: resolvedBranchId,
      p_session_id: sessionId,
      p_student_id: studentId,
      p_new_status: newStatus,
      p_reason: reason
    });

    if (rpcError) return { error: rpcError.message };
    if (!success) return { error: "Correction failed" };
    
    return { error: null, data: { success: true } };
  });
}
