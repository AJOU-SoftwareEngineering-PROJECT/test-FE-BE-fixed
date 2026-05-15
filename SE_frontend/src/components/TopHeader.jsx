import { Bell, Search, Sparkles } from "lucide-react";

export default function TopHeader({ title, subtitle, right }) {
  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 mb-8">
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-violet-700 bg-violet-50 px-3 py-1.5 rounded-full mb-3">
          <Sparkles size={14} /> Interactive Reader
        </div>
        <h2 className="text-3xl font-black tracking-tight text-slate-950">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-2">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {right}
        <div className="hidden md:flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm min-w-64">
          <Search size={17} className="text-slate-400" />
          <input className="outline-none text-sm w-full" placeholder="Search books, music..." />
        </div>
        <button className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
          <Bell size={18} />
        </button>
        <div className="w-11 h-11 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold shadow-sm">
          A
        </div>
      </div>
    </div>
  );
}
