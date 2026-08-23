"use server";

import { branchAction } from '@/lib/server-actions';
import { resolveInstructionalDay } from '@/lib/calendar/resolver';
import { SupabaseClient } from '@supabase/supabase-js';

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
    const { data: ay, error: ayError } = await supabase
      .from('academic_years')
      .select('operating_days, start_date, end_date')
      .eq('id', payload.academic_year_id)
      .single();
      
    if (ayError || !ay) return { error: "Academic year not found" };
    if (payload.date < ay.start_date || payload.date > ay.end_date) {
      return { error: "Date is outside academic year" };
    }
    
    const { data: events, error: eventsError } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('academic_year_id', payload.academic_year_id)
      .eq('status', 'ACTIVE');
      
    if (eventsError) return { error: "Failed to fetch calendar" };
    
    const dayResolution = resolveInstructionalDay(payload.date, ay.operating_days || [], events || []);
    if (!dayResolution.instructional) {
      return { error: "Cannot record attendance on a non-instructional day" };
    }

    const { data: session, error: sessionError } = await supabase
      .from('attendance_sessions')
      .select('id, locked_at, published_at')
      .eq('section_id', payload.section_id)
      .eq('date', payload.date)
      .maybeSingle();

    if (sessionError) return { error: sessionError };
    if (session && session.locked_at) {
      return { error: "Attendance is locked for this section and date" };
    }

    let sessionId = session?.id;

    if (!sessionId) {
      const { data: newSession, error: newSessionError } = await supabase
        .from('attendance_sessions')
        .insert({
          branch_id: resolvedBranchId,
          academic_year_id: payload.academic_year_id,
          section_id: payload.section_id,
          date: payload.date
        })
        .select()
        .single();
        
      if (newSessionError) return { error: newSessionError };
      sessionId = newSession.id;
    }

    const recordsToInsert = payload.records.map(r => ({
      session_id: sessionId!,
      student_id: r.student_id,
      status: r.status,
      notes: r.notes || null
    }));

    const { error: upsertError } = await supabase
      .from('attendance_records')
      .upsert(recordsToInsert, { onConflict: 'session_id,student_id' });
      
    if (upsertError) return { error: upsertError };
    
    return { error: null, data: { sessionId } };
  });
}

export async function lockAttendance(branchId: string | undefined, sessionId: string) {
  return branchAction(branchId, async ({ supabase }) => {
    const { error } = await supabase
      .from('attendance_sessions')
      .update({ locked_at: new Date().toISOString() })
      .eq('id', sessionId)
      .is('locked_at', null);
      
    if (error) return { error };
    return { error: null, data: { success: true } };
  });
}

export async function publishAttendance(branchId: string | undefined, sessionId: string) {
  return branchAction(branchId, async ({ supabase }) => {
    const { error } = await supabase
      .from('attendance_sessions')
      .update({ published_at: new Date().toISOString() })
      .eq('id', sessionId)
      .is('published_at', null);
      
    if (error) return { error };
    
    console.log('[EventBus] emit attendance.published for session', sessionId);
    
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
  return branchAction(branchId, async ({ supabase }) => {
    if (!reason || reason.trim().length === 0) {
      return { error: "Correction reason is mandatory" };
    }

    const { data: record, error: fetchError } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('session_id', sessionId)
      .eq('student_id', studentId)
      .single();
      
    if (fetchError || !record) return { error: "Record not found" };
    
    const beforeState = { status: record.status, notes: record.notes };
    const afterState = { status: newStatus, notes: record.notes };

    const { error: updateError } = await supabase
      .from('attendance_records')
      .update({ status: newStatus })
      .eq('id', record.id);
      
    if (updateError) return { error: updateError };
    
    const { data: user } = await supabase.auth.getUser();
    
    const { error: auditError } = await supabase
      .from('attendance_audit_logs')
      .insert({
        session_id: sessionId,
        record_id: record.id,
        actor_id: user.user?.id,
        action: 'CORRECT',
        reason,
        before_state: beforeState,
        after_state: afterState
      });
      
    if (auditError) return { error: auditError };
    
    return { error: null, data: { success: true } };
  });
}


