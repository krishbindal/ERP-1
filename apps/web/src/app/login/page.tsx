"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AlertCircle, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-sm shadow-md border-border bg-surface">
        <CardHeader className="space-y-1.5 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <LogIn className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Login</h1>
          <CardDescription className="text-sm text-muted-foreground">
            Sign in with your email and password to access SchoolOS
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="mb-4 flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3.5 text-sm font-medium text-destructive text-red-500"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-destructive text-red-500" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              setIsLoading(true);

              try {
                const email = (e.currentTarget.elements.namedItem("email") as HTMLInputElement).value;
                const password = (e.currentTarget.elements.namedItem("password") as HTMLInputElement).value;
                const supabase = createClient();

                const waitForCookies = new Promise<void>((resolve) => {
                  let settled = false;
                  const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
                    if (event === 'SIGNED_IN' && !settled) {
                      settled = true;
                      subscription.unsubscribe();
                      setTimeout(resolve, 50);
                    }
                  });

                  setTimeout(() => {
                    if (!settled) {
                      settled = true;
                      subscription.unsubscribe();
                      resolve();
                    }
                  }, 1000);
                });

                let authError = null;
                for (let i = 0; i < 10; i++) {
                  const { error } = await supabase.auth.signInWithPassword({ email, password });
                  if (!error) {
                    authError = null;
                    break;
                  }
                  authError = error;
                  if (error.message === 'Failed to fetch') {
                    await new Promise(r => setTimeout(r, 1000));
                  } else {
                    break;
                  }
                }

                if (authError) {
                  setError(authError.message);
                  setIsLoading(false);
                  return;
                }

                await waitForCookies;
                router.push('/');
                router.refresh();
              } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'An unexpected authentication error occurred.';
                setError(message);
                setIsLoading(false);
              }
            }}
            className="space-y-4"
          >
            <Input
              id="email"
              name="email"
              type="email"
              label="Email"
              autoComplete="email"
              placeholder="name@school.org"
              required
              disabled={isLoading}
              aria-label="Email"
            />
            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              autoComplete="current-password"
              placeholder="••••••••"
              required
              disabled={isLoading}
              aria-label="Password"
            />
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-semibold"
              isLoading={isLoading}
              loadingText="Signing in..."
              disabled={isLoading}
            >
              Sign in
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-border pt-4">
          <p className="text-xs text-muted-foreground text-center">
            SchoolOS Multi-Tenant Architecture
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
