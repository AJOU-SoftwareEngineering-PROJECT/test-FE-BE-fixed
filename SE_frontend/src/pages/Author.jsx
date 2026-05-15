import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageShell from "../components/PageShell";
import TopHeader from "../components/TopHeader";
import { Plus, UserRound, BookOpen, Trash2 } from "lucide-react";
import { deleteAuthor, getAuthors } from "../services/api";

export default function Authors() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadAuthors = () => {
    setLoading(true);

    getAuthors()
      .then((data) => {
        setAuthors(Array.isArray(data) ? data : []);
        setMessage("백엔드 DB에서 작가 목록을 불러왔습니다.");
      })
      .catch((error) => {
        console.error("Failed to load authors:", error);
        setAuthors([]);
        setMessage("작가 목록을 불러오지 못했습니다.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadAuthors();
  }, []);

  const handleDelete = async (authorId) => {
    const ok = window.confirm(
      "정말 삭제하시겠습니까? 이 작가에게 책이 있으면 삭제할 수 없습니다."
    );

    if (!ok) return;

    try {
      await deleteAuthor(authorId);
      setAuthors((prev) => prev.filter((author) => author.id !== authorId));
    } catch (error) {
      console.error(error);
      alert("삭제 실패: 이 작가에게 등록된 책이 있으면 삭제할 수 없습니다.");
    }
  };

  return (
    <PageShell>
      <main className="p-5 md:p-8 max-w-7xl mx-auto">
        <TopHeader
          title="Authors"
          subtitle="작가 정보를 실제 DB에서 불러오고 관리합니다."
          right={
            <Link
              to="/authors/new"
              className="primary-button inline-flex items-center gap-2"
            >
              <Plus size={17} />
              New Author
            </Link>
          }
        />

        <div className="mb-5">
          <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs bg-emerald-50 text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {message}
          </span>
        </div>

        {loading ? (
          <div className="card p-8 text-sm text-slate-500">
            작가 목록을 불러오는 중입니다...
          </div>
        ) : authors.length === 0 ? (
          <div className="card p-10 text-center">
            <UserRound size={44} className="mx-auto text-slate-300 mb-4" />
            <h3 className="font-black text-slate-700">
              아직 등록된 작가가 없습니다.
            </h3>
            <p className="text-sm text-slate-500 mt-2">
              New Author 버튼을 눌러 작가를 추가하세요.
            </p>
          </div>
        ) : (
          <section className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {authors.map((author) => (
              <div key={author.id} className="card p-6">
                <div className="flex items-start justify-between gap-4">
                  <Link to={`/authors/${author.id}`} className="flex-1">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                      <UserRound size={24} />
                    </div>

                    <h3 className="font-black text-slate-900">
                      {author.name}
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      {author.email}
                    </p>

                    <p className="text-sm text-slate-600 mt-3 line-clamp-3 leading-6">
                      {author.intro || "No introduction."}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-4">
                      <span>{author.gender}</span>
                      <span>{author.age} years old</span>
                      <span className="inline-flex items-center gap-1">
                        <BookOpen size={13} />
                        {author.book_count} books
                      </span>
                    </div>
                  </Link>

                  <button
                    onClick={() => handleDelete(author.id)}
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