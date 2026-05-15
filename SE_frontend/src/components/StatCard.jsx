const toneMap = {
  blue: "bg-blue-50 text-blue-600",
  violet: "bg-violet-50 text-violet-600",
  emerald: "bg-emerald-50 text-emerald-600",
  cyan: "bg-cyan-50 text-cyan-600",
  orange: "bg-orange-50 text-orange-600",
  pink: "bg-pink-50 text-pink-600"
};

export default function StatCard({ icon: Icon, label, value, tone = "blue" }) {
  return (
    <div className="card p-5 hover:-translate-y-1 transition duration-200">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 ${toneMap[tone] || toneMap.blue}`}>
        <Icon size={21} />
      </div>
      <h3 className="text-2xl font-black tracking-tight">{value}</h3>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}
