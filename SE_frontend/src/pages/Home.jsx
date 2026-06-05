import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { BookOpen, Heart, ChevronRight, SlidersHorizontal } from "lucide-react";
import TopNav from "../components/TopNav";
import { getBooks } from "../services/api";

const GENRES = ["전체", "로맨스", "로판", "판타지", "현판", "무협"];

function CoverThumb() {
  return (
    <div className="w-14 h-20 shrink-0 rounded-lg bg-gradient-to-br from-clay-100 via-sand-100 to-clay-100 flex items-center justify-center shadow-sm">
      <BookOpen size={22} className="text-sand-400" />
    </div>
  );
}

export default function Home() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genre, setGenre] = useState("전체");

  useEffect(() => {
    getBooks()
      .then((data) => setBooks(Array.isArray(data) ? data : []))
      .catch((error) => {
        console.error("Failed to load books:", error);
        setBooks([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const ranked = useMemo(() => {
    const sorted = [...books].sort(
      (a, b) => (b.like_count || 0) - (a.like_count || 0)
    );

    const q = query.trim().toLowerCase();

    return sorted.filter((book) => {
      const matchesGenre = genre === "전체" || book.genre === genre;
      const matchesQuery =
        !q ||
        (book.name || "").toLowerCase().includes(q) ||
        (book.author_name || "").toLowerCase().includes(q);

      return matchesGenre && matchesQuery;
    });
  }, [books, query, genre]);

  const featured = ranked[0];

  return (
    <div className="min-h-screen bg-white">
      <TopNav />

      <main className="max-w-6xl mx-auto px-4 lg:px-6 py-6">
        {/* Hero banner */}
        {featured && (
          <Link
            to={`/books/${featured.id}`}
            className="block relative overflow-hidden rounded-2xl bg-gradient-to-r from-clay-700 via-clay-600 to-clay-700 text-white p-8 md:p-10 mb-10"
          >
            <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full bg-white/10" />
            <div className="relative max-w-xl">
              <span className="inline-block text-xs font-bold bg-white/20 rounded-full px-3 py-1 mb-3">
                오늘의 추천
              </span>
              <h2 className="text-2xl md:text-3xl font-black leading-snug line-clamp-2">
                {featured.name}
              </h2>
              <p className="text-clay-100 mt-2 text-sm">
                by {featured.author_name || "Unknown Author"}
              </p>
              <p className="text-clay-50/90 mt-4 leading-7 line-clamp-2">
                {featured.intro || "지금 바로 읽어보세요."}
              </p>
              <span className="inline-flex items-center gap-1 mt-5 font-bold">
                지금 읽기 <ChevronRight size={18} />
              </span>
            </div>
          </Link>
        )}

        {/* Ranking */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-black text-sand-900">
              {query ? `"${query}" 검색 결과` : "통합 랭킹"}
            </h2>
            <button className="inline-flex items-center gap-1.5 text-sm font-bold text-sand-500 bg-sand-100 rounded-full px-4 py-2 hover:bg-sand-200">
              <SlidersHorizontal size={15} />
              통합설정
            </button>
          </div>

          {/* Genre filter chips */}
          <div className="flex flex-wrap gap-2 mb-7">
            {GENRES.map((g) => {
              const active = genre === g;

              return (
                <button
                  key={g}
                  onClick={() => setGenre(g)}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                    active
                      ? "bg-clay-500 text-white"
                      : "bg-clay-50 text-clay-600 hover:bg-clay-100"
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>

          {/* Ranking list */}
          {loading ? (
            <div className="rounded-2xl border border-sand-200 p-8 text-sm text-sand-500">
              랭킹을 불러오는 중입니다...
            </div>
          ) : ranked.length === 0 ? (
            <div className="rounded-2xl border border-sand-200 p-12 text-center">
              <BookOpen size={40} className="mx-auto text-sand-300 mb-4" />
              <h4 className="font-bold text-sand-700">
                {query || genre !== "전체"
                  ? "조건에 맞는 작품이 없습니다."
                  : "아직 등록된 책이 없습니다."}
              </h4>
              <p className="text-sm text-sand-500 mt-2">
                다른 검색어나 장르를 선택해보세요.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 md:gap-x-10 border-t border-sand-100">
              {ranked.map((book, index) => (
                <Link
                  key={book.id}
                  to={`/books/${book.id}`}
                  className="flex items-center gap-4 py-4 border-b border-sand-100 hover:bg-sand-50 -mx-2 px-2 rounded-lg transition"
                >
                  <span
                    className={`w-7 text-center text-lg font-black ${
                      index < 3 ? "text-clay-600" : "text-sand-400"
                    }`}
                  >
                    {index + 1}
                  </span>

                  <CoverThumb />

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sand-900 truncate">
                      {book.name}
                    </h3>
                    <p className="text-sm text-sand-500 mt-1 truncate">
                      {book.author_name || "Unknown Author"}
                      <span className="mx-1.5 text-sand-300">|</span>
                      {book.genre || "로맨스"}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-sand-400 mt-1.5">
                      <Heart size={12} />
                      {book.like_count || 0}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
