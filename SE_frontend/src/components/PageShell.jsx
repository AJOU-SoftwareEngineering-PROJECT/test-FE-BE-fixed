import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

export default function PageShell({ children, className = "" }) {
  return (
    <div className={`min-h-screen bg-slate-50 flex ${className}`}>
      <Sidebar />
      <div className="flex-1 min-w-0">
        <MobileNav />
        {children}
      </div>
    </div>
  );
}
