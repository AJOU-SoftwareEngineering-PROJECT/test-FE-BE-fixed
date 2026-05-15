import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  User,
  Music,
  PenTool,
  Bookmark,
  FileText,
  Settings
} from "lucide-react";

const menu = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Books", path: "/books", icon: BookOpen },
  { name: "My Page", path: "/mypage", icon: User },
  { name: "Playlists", path: "/playlists", icon: Music },
  { name: "Author", path: "/author", icon: PenTool },
  { name: "Scraps", path: "/scraps", icon: Bookmark },
  { name: "Requirements", path: "/requirements", icon: FileText }
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex w-64 min-h-screen bg-white border-r border-slate-200 px-5 py-6 flex-col">
      <Link to="/dashboard" className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 rounded-2xl bg-violet-600 text-white flex items-center justify-center font-black shadow-sm">
          IR
        </div>
        <div>
          <h1 className="font-black text-xl leading-5 tracking-tight">MY PROJECT</h1>
          <p className="text-xs text-slate-500 mt-1">Reading Platform</p>
        </div>
      </Link>

      <nav className="space-y-1.5 flex-1">
        {menu.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                isActive
                  ? "bg-violet-50 text-violet-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon size={17} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <Link
        to="/settings"
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 border-t border-slate-100 hover:bg-slate-50"
      >
        <Settings size={17} />
        Settings
      </Link>
    </aside>
  );
}
