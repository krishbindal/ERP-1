"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, LogOut } from "lucide-react";
import { navItems, isLinkActive } from "./nav-items";

export interface SidebarProps {
  userEmail?: string | null;
}

export function Sidebar({ userEmail }: SidebarProps = {}) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 text-white hidden md:flex flex-col h-screen border-r border-gray-800">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold">SchoolOS</h1>
      </div>
      <nav aria-label="Main navigation" className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isLinkActive(item.href, pathname);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium focus-ring transition-colors ${
                    active
                      ? "bg-gray-800 text-white font-semibold"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <Icon size={18} aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3 truncate">
          <User size={18} aria-hidden="true" className="shrink-0" />
          <span className="text-sm font-medium truncate">{userEmail || "Profile"}</span>
        </div>
        <form action="/auth/logout" method="POST">
          <button
            type="submit"
            className="min-h-[44px] min-w-[44px] p-2.5 rounded-md hover:bg-gray-800 focus-ring cursor-pointer inline-flex items-center justify-center text-gray-300 hover:text-white"
            aria-label="Log out"
          >
            <LogOut size={18} aria-hidden="true" />
          </button>
        </form>
      </div>
    </aside>
  );
}
