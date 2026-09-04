'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ShieldAlert, AlertTriangle, LogIn, ArrowLeft, Home, HelpCircle } from 'lucide-react';

export interface BranchAccessErrorProps {
  errorState?: 'NO_CONTEXT' | 'NO_BRANCH_SELECTED' | 'ACCESS_DENIED' | string | null;
  feature?: string;
  requiredRole?: string;
}

/**
 * Shared branch access error component.
 * Used by pages that call verifyPageBranchContext() to render
 * consistent, accessible error states for unauthorized or missing branch context.
 */
export function BranchAccessError({
  errorState,
  feature = 'this section',
  requiredRole,
}: BranchAccessErrorProps) {
  const state = errorState || 'ACCESS_DENIED';

  if (state === 'NO_CONTEXT') {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-4 w-full">
        <Card className="w-full max-w-md border-border bg-surface shadow-md" role="alert" aria-live="assertive">
          <CardHeader className="text-center pb-3">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <LogIn className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="flex justify-center mb-2">
              <Badge variant="outline">Session Required</Badge>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Authentication Required
            </h2>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              No context available. Please log in to access {feature}.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-xs text-muted-foreground pb-4">
            Your login session may have expired or organization context could not be determined. Please sign in again to continue.
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-2 justify-center pt-0">
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="primary" size="md" className="w-full">
                Sign in
              </Button>
            </Link>
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="outline" size="md" className="w-full">
                Back to Home
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (state === 'NO_BRANCH_SELECTED') {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-4 w-full">
        <Card className="w-full max-w-md border-warning/30 bg-surface shadow-md" role="alert" aria-live="polite">
          <CardHeader className="text-center pb-3">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-warning/10 text-warning">
              <AlertTriangle className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="flex justify-center mb-2">
              <Badge variant="warning">Branch Selection Required</Badge>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              No Branch Selected
            </h2>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              Please select a branch to view {feature}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-muted-foreground pb-4">
            <p className="text-center">
              This module requires an active branch context. Use the branch switcher in the top navigation bar to select a branch, or return to the main dashboard.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center pt-0">
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="primary" size="md" leftIcon={<Home className="h-4 w-4" />} className="w-full">
                Return to Dashboard
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // ACCESS_DENIED or other unauthorized states
  return (
    <div className="flex items-center justify-center min-h-[400px] p-4 w-full">
      <Card className="w-full max-w-lg border-destructive/20 bg-surface shadow-md" role="alert" aria-live="assertive">
        <CardHeader className="text-center pb-3">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="flex justify-center mb-2">
            <Badge variant="destructive">Access Restricted</Badge>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Access Denied</h2>
          <CardDescription className="text-sm text-muted-foreground mt-1">
            You do not have permission to view this branch&apos;s {feature}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pb-4">
          <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-2 text-left">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Reasons for Access Blockage</span>
            </div>
            <ul className="space-y-1.5 text-xs text-muted-foreground list-disc pl-4">
              <li>
                <strong className="text-foreground">Missing Branch Assignment:</strong> Your account is not assigned or associated with the selected branch.
              </li>
              <li>
                <strong className="text-foreground">Unauthorized Role:</strong> Your current role {requiredRole ? `(${requiredRole})` : ''} does not have authorization to view or manage {feature}.
              </li>
            </ul>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Need access? Please contact your school administrator to adjust your branch assignment or role permissions.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2 justify-center pt-0">
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="primary" size="md" leftIcon={<ArrowLeft className="h-4 w-4" />} className="w-full">
              Back to Dashboard
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
