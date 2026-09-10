import {
  LayoutDashboard,
  BookOpen,
  Users,
  CalendarDays,
  CalendarSync,
  Clock,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/academic-structure", label: "Academic Structure", icon: BookOpen },
  { href: "/students", label: "Students", icon: Users },
  { href: "/scheduling", label: "Scheduling Configuration", icon: CalendarDays },
  { href: "/scheduling/timetable", label: "Timetable", icon: CalendarSync },
  { href: "/scheduling/substitutions", label: "Substitutions", icon: Clock },
  { href: "/attendance", label: "Attendance", icon: Clock },
  { href: "/homework", label: "Homework", icon: BookOpen },
  { href: "/communication", label: "Communication", icon: MessageSquare },
];

export function isLinkActive(href: string, currentPathname: string | null): boolean {
  if (!currentPathname) return false;
  if (href === "/") {
    return currentPathname === "/";
  }
  if (currentPathname === href) {
    return true;
  }
  if (currentPathname.startsWith(href + "/")) {
    const hasMoreSpecific = navItems.some(
      (other) =>
        other.href !== href &&
        other.href.startsWith(href) &&
        (currentPathname === other.href || currentPathname.startsWith(other.href + "/"))
    );
    return !hasMoreSpecific;
  }
  return false;
}
