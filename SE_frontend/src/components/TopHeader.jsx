import { Bell, Search } from "lucide-react";

export default function TopHeader({ title, subtitle, right }) {
  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 mb-8">
      <div>
        <h2 className="text-3xl font-black tracking-tight text-sand-950">{title}</h2>
        {subtitle && <p className="text-sm text-sand-500 mt-2">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {right}
        <div className="hidden md:flex items-center gap-2 bg-white border border-sand-200 rounded-2xl px-4 py-2.5 shadow-sm min-w-64">
          <Search size={17} className="text-sand-400" />
          <input className="outline-none text-sm w-full" placeholder="Search books, music..." />
        </div>
        <button className="w-11 h-11 rounded-2xl bg-white border border-sand-200 flex items-center justify-center shadow-sm">
          <Bell size={18} />
        </button>
        <div className="w-11 h-11 rounded-full bg-clay-600 text-white flex items-center justify-center font-bold shadow-sm">
          A
        </div>
      </div>
    </div>
  );
}
