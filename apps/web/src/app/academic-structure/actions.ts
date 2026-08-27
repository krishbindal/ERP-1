"use server";

import { branchAction } from '@/lib/server-actions';

// Academic Years
export async function createAcademicYear(data: { name: string; start_date: string; end_date: string; status: string }, explicitBranchId?: string) {
  return branchAction(explicitBranchId, async (ctx) => {
    return ctx.supabase.from('academic_years').insert({ ...data, branch_id: ctx.branchId });
  }, '/academic-structure');
}

export async function updateAcademicYear(id: string, data: { name: string; start_date: string; end_date: string; status: string }, explicitBranchId?: string) {
  return branchAction(explicitBranchId, async (ctx) => {
    return ctx.supabase.from('academic_years').update(data).eq('id', id).eq('branch_id', ctx.branchId);
  }, '/academic-structure');
}

export async function deleteAcademicYear(id: string, explicitBranchId?: string) {
  return branchAction(explicitBranchId, async (ctx) => {
    return ctx.supabase.from('academic_years').delete().eq('id', id).eq('branch_id', ctx.branchId);
  }, '/academic-structure');
}

// Classes
export async function createClass(data: { academic_year_id: string; name: string; level: number }, explicitBranchId?: string) {
  return branchAction(explicitBranchId, async (ctx) => {
    return ctx.supabase.from('classes').insert({ ...data, branch_id: ctx.branchId });
  }, '/academic-structure');
}

export async function updateClass(id: string, data: { name: string; level: number }, explicitBranchId?: string) {
  return branchAction(explicitBranchId, async (ctx) => {
    return ctx.supabase.from('classes').update(data).eq('id', id).eq('branch_id', ctx.branchId);
  }, '/academic-structure');
}

export async function deleteClass(id: string, explicitBranchId?: string) {
  return branchAction(explicitBranchId, async (ctx) => {
    return ctx.supabase.from('classes').delete().eq('id', id).eq('branch_id', ctx.branchId);
  }, '/academic-structure');
}

// Sections
export async function createSection(data: { class_id: string; name: string; capacity: number }, explicitBranchId?: string) {
  return branchAction(explicitBranchId, async (ctx) => {
    return ctx.supabase.from('sections').insert({ ...data, branch_id: ctx.branchId });
  }, '/academic-structure');
}

export async function updateSection(id: string, data: { name: string; capacity: number }, explicitBranchId?: string) {
  return branchAction(explicitBranchId, async (ctx) => {
    return ctx.supabase.from('sections').update(data).eq('id', id).eq('branch_id', ctx.branchId);
  }, '/academic-structure');
}

export async function deleteSection(id: string, explicitBranchId?: string) {
  return branchAction(explicitBranchId, async (ctx) => {
    return ctx.supabase.from('sections').delete().eq('id', id).eq('branch_id', ctx.branchId);
  }, '/academic-structure');
}

export async function getAcademicYears(explicitBranchId?: string) {
  return branchAction(explicitBranchId, async (ctx) => {
    return ctx.supabase.from('academic_years').select('id, name').eq('branch_id', ctx.branchId);
  });
}

export async function getClasses(explicitBranchId?: string) {
  return branchAction(explicitBranchId, async (ctx) => {
    return ctx.supabase.from('classes').select('id, name').eq('branch_id', ctx.branchId);
  });
}
