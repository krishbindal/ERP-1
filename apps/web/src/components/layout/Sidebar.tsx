import Link from "next/link";
import { User, LogOut, BookOpen, Users, LayoutDashboard } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen border-r border-gray-800">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold">SchoolOS</h1>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          <li>
            <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-800 text-sm font-medium">
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/academic-structure" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-800 text-sm font-medium">
              <BookOpen size={18} />
              Academic Structure
            </Link>
          </li>
          <li>
            <Link href="/students" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-800 text-sm font-medium">
              <Users size={18} />
              Students
            </Link>
          </li>
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <User size={18} />
          <span className="text-sm font-medium">Profile</span>
        </div>
        <button className="p-1 rounded-md hover:bg-gray-800">
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
