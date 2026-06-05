import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Search, Heart, User, LogOut } from "lucide-react";

export default function TopNav() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const handleSearch = (event) => {
    event.preventDefault();
    const term = q.trim();
    navigate(term ? `/home?q=${encodeURIComponent(term)}` : "/home");
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("currentUserId");
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-sand-200">
      <div className="max-w-6xl mx-auto px-4 lg:px-6">
        <div className="h-16 flex items-center justify-between gap-4">
          <Link to="/home" className="flex items-center gap-2 shrink-0">
            <BookOpen className="text-clay-600" size={26} strokeWidth={2.3} />
            <span className="text-xl font-black tracking-tight text-sand-900">
              Interactive Reader
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <form
              onSubmit={handleSearch}
              className="hidden sm:flex items-center gap-2 bg-sand-100 rounded-full px-4 py-2 w-60 focus-within:ring-2 focus-within:ring-clay-100"
            >
              <Search size={17} className="text-sand-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="제목, 작가 검색"
                className="bg-transparent outline-none text-sm w-full"
              />
            </form>

            <button
              onClick={handleSearch}
              className="sm:hidden w-10 h-10 rounded-full hover:bg-sand-100 flex items-center justify-center text-sand-600"
              aria-label="검색"
            >
              <Search size={20} />
            </button>

            <button
              className="w-10 h-10 rounded-full hover:bg-sand-100 flex items-center justify-center text-sand-600"
              aria-label="좋아요한 작품"
            >
              <Heart size={20} />
            </button>

            <Link
              to="/mypage"
              className="flex items-center gap-1.5 h-10 px-3 rounded-full hover:bg-sand-100 text-sand-700 font-bold text-sm"
            >
              <User size={18} />
              MY
            </Link>

            <button
              onClick={handleLogout}
              className="w-10 h-10 rounded-full hover:bg-red-50 flex items-center justify-center text-sand-400 hover:text-red-500"
              aria-label="로그아웃"
              title="로그아웃"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
