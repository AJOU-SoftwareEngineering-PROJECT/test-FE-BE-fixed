import { Link } from "react-router-dom";
import { BookOpen, LayoutDashboard, Music, PenTool, User } from "lucide-react";

const items = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/books", icon: BookOpen, label: "Books" },
  { path: "/mypage", icon: User, label: "My" },
  { path: "/playlists", icon: Music, label: "Music" },
  { path: "/author", icon: PenTool, label: "Author" }
];

export default function MobileNav() {
  return (
    <header className="lg:hidden sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <Link to="/dashboard" className="font-black text-slate-900">Interactive Reader</Link>
        <nav className="flex items-center gap-2">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path} className="p-2 rounded-xl bg-slate-50 text-slate-600">
                <Icon size={17} />
                <span className="sr-only">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
