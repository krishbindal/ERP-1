"use server";

import { createClient } from '@/lib/supabase/server';
import { getContextBranchId } from '@/lib/branch-context';
import { mapDatabaseError } from '@/lib/db-error-mapper';
import { revalidatePath } from 'next/cache';
import { SupabaseClient } from '@supabase/supabase-js';

export interface ActionContext {
  supabase: SupabaseClient;
  branchId: string;
}

export type ActionResult<T = void> = {
  success?: boolean;
  error?: string;
  data?: T;
};

/**
 * Executes a branch-scoped server action.
 * Automatically resolves and enforces branch authorization context.
 * Automatically maps Supabase/Postgrest errors to user-friendly messages.
 * Automatically revalidates paths on success if provided.
 */
export async function branchAction<T = unknown>(
  explicitBranchId: string | undefined,
  action: (ctx: ActionContext) => Promise<{ error: unknown; data?: T | null }>,
  pathToRevalidate?: string | string[]
): Promise<ActionResult<T>> {
  let branchId: string;
  try {
    branchId = await getContextBranchId(explicitBranchId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }

  const supabase = await createClient();
  
  try {
    const result = await action({ supabase, branchId });
    
    if (result.error) {
      console.error("Action database error:", result.error);
      return { error: mapDatabaseError(result.error) };
    }
    
    if (pathToRevalidate) {
      if (Array.isArray(pathToRevalidate)) {
        pathToRevalidate.forEach(p => revalidatePath(p));
      } else {
        revalidatePath(pathToRevalidate);
      }
    }
    
    return { success: true, data: result.data as T };
  } catch (e) {
    console.error("Unhandled action error:", e);
    return { error: e instanceof Error ? e.message : "An unexpected error occurred" };
  }
}
