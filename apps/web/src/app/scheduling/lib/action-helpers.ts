"use server";

import { revalidatePath } from 'next/cache';
import { mapDatabaseError } from '@/lib/db-error-mapper';
import { getBranchContextClient, getSchedulingContext } from './scheduling-context';

type SupabaseClient = Awaited<ReturnType<typeof getBranchContextClient>>['supabase'];

interface BranchContext {
  supabase: SupabaseClient;
  branch_id: string;
}

interface SchedulingContext extends BranchContext {
  academic_year_id: string;
}

/**
 * Executes a branch-scoped server action mutation.
 * Handles context resolution, error mapping, and path revalidation.
 */
export async function branchMutation(
  explicitBranchId: string | undefined,
  pathToRevalidate: string,
  fn: (ctx: BranchContext) => PromiseLike<{ error: { message: string; code?: string } | null }>
): Promise<{ error?: string; success?: boolean }> {
  let ctx: BranchContext;
  try {
    ctx = await getBranchContextClient(explicitBranchId);
  } catch (e) {
    return { error: (e as Error).message };
  }

  const { error } = await fn(ctx);
  if (error) {
    console.error("Mutation error:", error);
    return { error: mapDatabaseError(error) };
  }
  revalidatePath(pathToRevalidate);
  return { success: true };
}

/**
 * Executes a scheduling-scoped server action mutation (requires academic year).
 * Handles context resolution, error mapping, and path revalidation.
 */
export async function schedulingMutation(
  explicitBranchId: string | undefined,
  pathToRevalidate: string,
  fn: (ctx: SchedulingContext) => PromiseLike<{ error: { message: string; code?: string } | null }>
): Promise<{ error?: string; success?: boolean }> {
  let ctx: SchedulingContext;
  try {
    ctx = await getSchedulingContext(explicitBranchId);
  } catch (e) {
    return { error: (e as Error).message };
  }

  const { error } = await fn(ctx);
  if (error) {
    console.error("Mutation error:", error);
    return { error: mapDatabaseError(error) };
  }
  revalidatePath(pathToRevalidate);
  return { success: true };
}
