"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, User, LogOut } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import type { AppContext } from "@/lib/branch-context";
import { SuperAdminBranchSelector } from "./SuperAdminBranchSelector";
import { navItems, isLinkActive } from "./nav-items";

export interface TopBarProps {
  context?: AppContext | null;
  userEmail?: string | null;
}

export function TopBar({ context, userEmail }: TopBarProps = {}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-3 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            aria-label="Open navigation menu"
            onClick={() => setIsDrawerOpen(true)}
            className="md:hidden min-h-[44px] min-w-[44px] p-2.5 -ml-1 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus-ring cursor-pointer inline-flex items-center justify-center"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>

          {context?.type === "normal" ? (
            <div className="flex items-center space-x-2">
              <span className="text-xs sm:text-sm font-medium text-gray-900 bg-gray-100 px-2.5 sm:px-3 py-1 rounded-md border border-gray-200 truncate max-w-[100px] sm:max-w-xs">
                {context.branchName}
              </span>
            </div>
          ) : context?.type === "superadmin" ? (
            <div className="flex items-center space-x-2">
              <div className="hidden sm:block">
                <SuperAdminBranchSelector organizationId={context.organizationScopes[0]} />
              </div>
              <span className="sm:hidden text-xs font-medium text-gray-900 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200">
                Super Admin
              </span>
            </div>
          ) : (
            <span className="text-xs sm:text-sm font-medium text-gray-500 bg-gray-50 px-2.5 sm:px-3 py-1 rounded-md border border-gray-200">
              No Branch Assigned
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm font-medium text-gray-700 hidden sm:block truncate max-w-[200px]">
            {userEmail || "User"}
          </div>
          <div
            className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-semibold text-xs sm:text-sm"
            aria-hidden="true"
          >
            {userEmail ? userEmail[0].toUpperCase() : "U"}
          </div>
        </div>
      </header>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="SchoolOS"
        side="left"
        className="w-72 max-w-[85vw]"
      >
        <div className="flex flex-col h-full justify-between -m-2">
          <div>
            {/* Branch Context Indicator in Drawer */}
            <div className="mb-4 pb-4 border-b border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Branch Context
              </p>
              {context?.type === "normal" ? (
                <span className="text-sm font-medium text-foreground bg-muted px-3 py-1.5 rounded-md border border-border inline-block w-full truncate">
                  {context.branchName}
                </span>
              ) : context?.type === "superadmin" ? (
                <div className="w-full">
                  <SuperAdminBranchSelector organizationId={context.organizationScopes[0]} />
                </div>
              ) : (
                <span className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-md border border-border inline-block w-full">
                  No Branch Assigned
                </span>
              )}
            </div>

            {/* Complete Navigation Link List */}
            <nav aria-label="Main navigation" className="space-y-1">
              <ul className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isLinkActive(item.href, pathname);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setIsDrawerOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-md text-sm font-medium focus-ring transition-colors ${
                          active
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "text-foreground hover:bg-muted hover:text-foreground"
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
          </div>

          {/* Profile Section and Preserved Logout Form */}
          <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-3 truncate">
              <div
                className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground shrink-0"
                aria-hidden="true"
              >
                <User size={18} />
              </div>
              <span className="text-sm font-medium text-foreground truncate max-w-[130px]">
                {userEmail || "Profile"}
              </span>
            </div>
            <form action="/auth/logout" method="POST">
              <button
                type="submit"
                className="min-h-[44px] min-w-[44px] p-2.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus-ring cursor-pointer inline-flex items-center justify-center"
                aria-label="Log out"
              >
                <LogOut size={18} aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>
      </Drawer>
    </>
  );
}
