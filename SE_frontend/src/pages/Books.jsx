import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageShell from "../components/PageShell";
import TopHeader from "../components/TopHeader";
import BookCard from "../components/BookCard";
import {
  BookOpen,
  Columns2,
  Moon,
  Music2,
  MessageSquare,
  Plus,
} from "lucide-react";
import { getBooks } from "../services/api";

const readingModes = [
  {
    title: "Classic View",
    description: "일반 독서 화면",
    icon: BookOpen,
    active: true,
  },
  {
    title: "Dual Panel",
    description: "책과 댓글을 함께 보기",
    icon: Columns2,
    active: false,
  },
  {
    title: "Night Mode",
    description: "다크 모드로 읽기",
    icon: Moon,
    active: false,
  },
];

export default function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getBooks()
      .then((data) => {
        setBooks(Array.isArray(data) ? data : []);
        setMessage("백엔드에서 책 목록을 불러왔습니다.");
      })
      .catch((error) => {
        console.error("Backend error:", error);
        setBooks([]);
        setMessage("백엔드 연결에 실패했습니다.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <PageShell>
      <main className="p-5 md:p-8 max-w-7xl mx-auto">
        <TopHeader
          title="Books"
          subtitle="문장별 댓글과 음악 추천 기능을 통해 책을 읽어보세요."
          right={
            <Link
              to="/books/new"
              className="primary-button inline-flex items-center gap-2"
            >
              <Plus size={17} />
              New Book
            </Link>
          }
        />

        <section className="mb-8">
          <h3 className="font-black text-lg mb-4">독서 스타일 선택</h3>

          <div className="grid md:grid-cols-3 gap-4">
            {readingModes.map((mode) => {
              const Icon = mode.icon;

              return (
                <div
                  key={mode.title}
                  className={`card p-5 ${
                    mode.active ? "border-clay-500 ring-1 ring-clay-100" : ""
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 ${
                      mode.active
                        ? "bg-clay-50 text-clay-600"
                        : "bg-sand-100 text-sand-500"
                    }`}
                  >
                    <Icon size={21} />
                  </div>

                  <h4 className="font-bold">{mode.title}</h4>
                  <p className="text-sm text-sand-500 mt-1">
                    {mode.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <div className="flex items-end justify-between mb-4">
            <div>
              <h3 className="font-black text-lg">추천 도서</h3>
              <p className="text-sm text-sand-500 mt-1">
                각 문장마다 독자들의 생각을 나누고, 어울리는 음악과 함께 읽어보세요.
              </p>
            </div>

            <p className="hidden md:block text-xs text-sand-400">
              {message}
            </p>
          </div>

          {loading ? (
            <div className="card p-8 text-sm text-sand-500">
              책 목록을 불러오는 중입니다...
            </div>
          ) : books.length === 0 ? (
            <div className="card p-8 text-center">
              <BookOpen size={40} className="mx-auto text-sand-300 mb-4" />
              <h4 className="font-bold text-sand-700">
                아직 등록된 책이 없습니다.
              </h4>
              <p className="text-sm text-sand-500 mt-2">
                New Book 버튼을 눌러 책을 추가하세요.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </section>

        <section className="grid md:grid-cols-2 gap-5 mt-8">
          <div className="card p-6">
            <MessageSquare className="text-clay-600" size={24} />
            <h4 className="font-bold mt-4">문장별 댓글</h4>
            <p className="text-sm text-sand-500 mt-2 leading-6">
              독자는 각 문장마다 댓글을 남기고 다른 사용자들과 생각을 공유할 수 있습니다.
            </p>
          </div>

          <div className="card p-6">
            <Music2 className="text-clay-600" size={24} />
            <h4 className="font-bold mt-4">음악 추천</h4>
            <p className="text-sm text-sand-500 mt-2 leading-6">
              책 분위기에 맞는 음악을 추천하고 좋아요 순으로 확인할 수 있습니다.
            </p>
          </div>
        </section>
      </main>
    </PageShell>
  );
}