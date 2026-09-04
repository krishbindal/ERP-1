import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { createClient } from "@/lib/supabase/server";
import { getAppContext } from "@/lib/branch-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "SchoolOS",
  description: "Phase 3C.4-B Core UI",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let context = null;
  let userEmail: string | null = null;

  try {
    const supabase = await createClient();
    const { data: user } = await supabase.auth.getUser();
    userEmail = user?.user?.email ?? null;
    context = await getAppContext();
  } catch {
    // Fallback for unauthenticated or build-time environments
  }

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <AppShell context={context} userEmail={userEmail}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
