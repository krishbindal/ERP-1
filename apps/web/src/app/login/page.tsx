"use client";
import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [error, setError] = useState("");

  return (
    <div className="p-6 max-w-sm mx-auto mt-20 bg-white shadow rounded">
      <h1 className="text-xl font-bold mb-4">Login</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          console.log("Submitting form...");
          const email = (e.currentTarget.elements.namedItem("email") as HTMLInputElement).value;
          const password = (e.currentTarget.elements.namedItem("password") as HTMLInputElement).value;
          const supabase = createClient();
          
          let authError = null;
          for (let i = 0; i < 10; i++) {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (!error) {
              authError = null;
              break;
            }
            authError = error;
            if (error.message === 'Failed to fetch') {
              console.warn(`signInWithPassword failed to fetch, retrying ${i + 1}/3...`);
              await new Promise(r => setTimeout(r, 1000));
            } else {
              break;
            }
          }

          if (authError) {
            setError(authError.message);
          } else {
            console.log("LOGIN SUCCESS! Navigating...");
            
            // Wait for onAuthStateChange to fire and write cookies before navigating
            // We use a Promise that resolves when the `SIGNED_IN` event is received
            const waitForCookies = new Promise<void>((resolve) => {
              const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
                if (event === 'SIGNED_IN') {
                  subscription.unsubscribe();
                  // Wait an extra 50ms to ensure the browser has completely persisted the cookie chunks
                  setTimeout(resolve, 50);
                }
              });
              
              // Fallback resolve after 1 second if event doesn't fire
              setTimeout(() => {
                subscription.unsubscribe();
                resolve();
              }, 1000);
            });

            await waitForCookies;
            
            // Use hard navigation to avoid Playwright Next.js router cache timeouts
            // eslint-disable-next-line
            window.location.href = "/";
          }
        }}
      >
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" id="email" name="email" aria-label="Email" className="mt-1 p-2 w-full border rounded" />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <input type="password" id="password" name="password" aria-label="Password" className="mt-1 p-2 w-full border rounded" />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Sign in</button>
      </form>
    </div>
  );
}
