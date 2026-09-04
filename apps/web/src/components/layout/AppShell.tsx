"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { AppContext } from "@/lib/branch-context";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function isUnauthenticatedRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname === "/login" || pathname.startsWith("/login/")) {
    return true;
  }
  if (pathname.startsWith("/auth/")) {
    if (pathname === "/auth/logout" || pathname.startsWith("/auth/logout/")) {
      return false;
    }
    return true;
  }
  return false;
}

export interface AppShellProps {
  children: ReactNode;
  context?: AppContext | null;
  userEmail?: string | null;
}

export function AppShell({ children, context = null, userEmail = null }: AppShellProps) {
  const pathname = usePathname();

  if (isUnauthenticatedRoute(pathname)) {
    return <main className="min-h-screen bg-background">{children}</main>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar userEmail={userEmail} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar context={context} userEmail={userEmail} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
