import { useEffect, useState } from "react";
import PageShell from "../components/PageShell";
import TopHeader from "../components/TopHeader";
import { Bookmark, Trash2 } from "lucide-react";
import { deleteScrap, getScraps } from "../services/api";

export default function Scraps() {
  const [scraps, setScraps] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadScraps = () => {
    setLoading(true);

    getScraps()
      .then((data) => {
        setScraps(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error("Failed to load scraps:", error);
        setScraps([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadScraps();
  }, []);

  const handleDelete = async (scrapId) => {
    try {
      await deleteScrap(scrapId);
      setScraps((prev) => prev.filter((item) => item.id !== scrapId));
    } catch (error) {
      console.error("Failed to delete scrap:", error);
      alert("스크랩 삭제에 실패했습니다.");
    }
  };

  return (
    <PageShell>
      <main className="p-5 md:p-8 max-w-7xl mx-auto">
        <TopHeader
          title="Scraps"
          subtitle="저장한 문장을 실제 DB에서 불러옵니다."
        />

        {loading ? (
          <div className="card p-8 text-sm text-slate-500">
            스크랩을 불러오는 중입니다...
          </div>
        ) : scraps.length === 0 ? (
          <div className="card p-10 text-center">
            <Bookmark size={42} className="mx-auto text-slate-300 mb-4" />
            <h3 className="font-black text-slate-700">
              저장된 문장이 없습니다.
            </h3>
            <p className="text-sm text-slate-500 mt-2">
              책을 읽으면서 문장 옆 북마크 버튼을 누르면 이곳에 표시됩니다.
            </p>
          </div>
        ) : (
          <section className="grid md:grid-cols-2 gap-5">
            {scraps.map((scrap) => (
              <div key={scrap.id} className="card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-blue-600 font-bold">
                      {scrap.book_name}
                    </p>

                    <p className="text-sm text-slate-700 leading-6 mt-3">
                      {scrap.sentence_content}
                    </p>

                    <p className="text-xs text-slate-400 mt-4">
                      Saved at {new Date(scrap.created_at).toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDelete(scrap.id)}
                    className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
    </PageShell>
  );
}