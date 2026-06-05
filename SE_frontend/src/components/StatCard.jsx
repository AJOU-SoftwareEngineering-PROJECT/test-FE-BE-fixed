const toneMap = {
  blue: "bg-clay-50 text-clay-600",
  violet: "bg-clay-50 text-clay-600",
  emerald: "bg-clay-50 text-clay-600",
  cyan: "bg-clay-50 text-clay-600",
  orange: "bg-orange-50 text-orange-600",
  pink: "bg-clay-50 text-clay-600"
};

export default function StatCard({ icon: Icon, label, value, tone = "blue" }) {
  return (
    <div className="card p-5 hover:-translate-y-1 transition duration-200">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 ${toneMap[tone] || toneMap.blue}`}>
        <Icon size={21} />
      </div>
      <h3 className="text-2xl font-black tracking-tight">{value}</h3>
      <p className="text-xs text-sand-500 mt-1">{label}</p>
    </div>
  );
}
