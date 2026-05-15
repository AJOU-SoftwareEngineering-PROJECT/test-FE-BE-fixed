import PageShell from "../components/PageShell";
import TopHeader from "../components/TopHeader";
import { playlists } from "../data/mockData";
import { Heart, Music2, Play, Plus } from "lucide-react";

export default function Playlists() {
  return (
    <PageShell>
      <main className="p-5 md:p-8 max-w-6xl mx-auto">
        <TopHeader
          title="Playlists"
          subtitle="책 분위기에 맞는 음악을 추천하고 좋아요 순으로 확인하세요."
          right={<button className="primary-button hidden sm:inline-flex items-center gap-2"><Plus size={17} /> Add Music</button>}
        />

        <section className="grid md:grid-cols-3 gap-6">
          {playlists.map((item) => (
            <div key={item.title} className="card p-6 hover:-translate-y-1 transition">
              <div className="h-40 rounded-3xl bg-gradient-to-br from-pink-100 via-violet-100 to-blue-100 flex items-center justify-center mb-5">
                <Music2 size={42} className="text-pink-600" />
              </div>
              <h3 className="font-black text-xl">{item.title}</h3>
              <p className="text-sm text-slate-500 mt-2">{item.song}</p>
              <div className="flex items-center justify-between mt-5">
                <span className="text-xs bg-slate-100 px-3 py-1.5 rounded-full">{item.mood}</span>
                <button className="inline-flex items-center gap-2 text-pink-600 bg-pink-50 rounded-full px-3 py-1.5 text-xs font-bold">
                  <Heart size={14} /> {item.likes}
                </button>
              </div>
              <button className="primary-button w-full mt-5 inline-flex items-center justify-center gap-2">
                <Play size={16} /> Play Music
              </button>
            </div>
          ))}
        </section>
      </main>
    </PageShell>
  );
}
