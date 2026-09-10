'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updatePasswordAction } from './actions';
import { Card, CardHeader, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AlertCircle, CheckCircle2, Circle, KeyRound } from 'lucide-react';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isMinLength = password.length >= 6;
  const isMatching = password.length > 0 && confirm.length > 0 && password === confirm;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <Card className="max-w-md w-full shadow-lg border-border bg-surface">
        <CardHeader className="space-y-1.5 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <KeyRound className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Update Password</h1>
          <CardDescription className="text-sm text-muted-foreground">
            You must change your password before continuing.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="mb-4 flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm font-medium text-destructive text-red-500"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}
          
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setError('');
              
              if (password.length < 6) {
                setError('Password must be at least 6 characters.');
                return;
              }
              if (password !== confirm) {
                setError('Passwords do not match.');
                return;
              }

              setLoading(true);
              try {
                const result = await updatePasswordAction(password);
                setLoading(false);

                if (result.error) {
                  setError(result.error);
                } else {
                  router.push('/');
                }
              } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Failed to update password. Please try again.';
                setError(message);
                setLoading(false);
              }
            }}
            className="space-y-4"
          >
            <Input 
              type="password" 
              id="password" 
              name="password"
              label="New Password"
              required
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />

            <Input 
              type="password" 
              id="confirm" 
              name="confirm"
              label="Confirm Password"
              required
              disabled={loading}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />

            {/* Visual validation status indicators */}
            <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-2 text-xs" aria-live="polite">
              <p className="font-medium text-foreground">Password requirements:</p>
              <div className="flex items-center gap-2">
                {isMinLength ? (
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0" aria-hidden="true" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                )}
                <span className={isMinLength ? 'text-success font-medium' : 'text-muted-foreground'}>
                  At least 6 characters
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isMatching ? (
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0" aria-hidden="true" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                )}
                <span className={isMatching ? 'text-success font-medium' : 'text-muted-foreground'}>
                  Passwords match
                </span>
              </div>
            </div>

            <Button 
              type="submit" 
              variant="primary"
              size="lg"
              className="w-full font-semibold"
              disabled={loading}
              isLoading={loading}
              loadingText="Updating..."
            >
              Update Password
            </Button>
          </form>

          <div className="mt-4 text-center">
            <a 
              href="/auth/logout" 
              className="text-sm font-medium text-primary hover:underline focus-ring rounded transition-colors"
            >
              Sign out
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
