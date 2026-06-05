import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import TopHeader from "../components/TopHeader";
import { BookOpen, Save } from "lucide-react";
import { createBook } from "../services/api";

export default function CreateBook() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    intro: "",
    author_name: "",
    author_email: "",
    sentencesText: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("책 제목을 입력하세요.");
      return;
    }

    if (!form.author_name.trim()) {
      setError("작가 이름을 입력하세요.");
      return;
    }

    const sentences = form.sentencesText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    setLoading(true);
    setError("");

    try {
      const newBook = await createBook({
        name: form.name.trim(),
        intro: form.intro.trim(),
        author_name: form.author_name.trim(),
        author_email: form.author_email.trim() || undefined,
        sentences,
      });

      navigate(`/books/${newBook.id}`);
    } catch (err) {
      console.error(err);
      setError("책 저장에 실패했습니다. 백엔드와 DB가 실행 중인지 확인하세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <main className="p-5 md:p-8 max-w-5xl mx-auto">
        <TopHeader
          title="Create Book"
          subtitle="새로운 책과 문장을 실제 DB에 저장합니다."
        />

        <form onSubmit={handleSubmit} className="card p-6 mt-6 space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-clay-50 text-clay-600 flex items-center justify-center">
              <BookOpen size={22} />
            </div>

            <div>
              <h3 className="font-black">Book Information</h3>
              <p className="text-sm text-sand-500">
                입력한 내용은 backend database에 저장됩니다.
              </p>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 text-red-600 text-sm px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-sand-700 mb-2">
              Book Title
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-sand-200 px-4 py-3 outline-none focus:ring-2 focus:ring-clay-100"
              placeholder="Example: Rich Dad Poor Dad"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-sand-700 mb-2">
              Author Name
            </label>
            <input
              name="author_name"
              value={form.author_name}
              onChange={handleChange}
              className="w-full rounded-xl border border-sand-200 px-4 py-3 outline-none focus:ring-2 focus:ring-clay-100"
              placeholder="Example: Robert Kiyosaki"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-sand-700 mb-2">
              Author Email
            </label>
            <input
              name="author_email"
              value={form.author_email}
              onChange={handleChange}
              className="w-full rounded-xl border border-sand-200 px-4 py-3 outline-none focus:ring-2 focus:ring-clay-100"
              placeholder="Optional: author@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-sand-700 mb-2">
              Introduction
            </label>
            <textarea
              name="intro"
              value={form.intro}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-xl border border-sand-200 px-4 py-3 outline-none focus:ring-2 focus:ring-clay-100 resize-none"
              placeholder="Write a short introduction of the book."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-sand-700 mb-2">
              Sentences
            </label>
            <textarea
              name="sentencesText"
              value={form.sentencesText}
              onChange={handleChange}
              rows={10}
              className="w-full rounded-xl border border-sand-200 px-4 py-3 outline-none focus:ring-2 focus:ring-clay-100 resize-none"
              placeholder={`Write one sentence per line.\nMoney is not just something people earn and spend.\nAssets put money into your pocket.\nFinancial freedom begins with financial education.`}
            />
            <p className="text-xs text-sand-400 mt-2">
              한 줄이 하나의 문장으로 저장됩니다.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/books")}
              className="px-5 py-3 rounded-xl border border-sand-200 text-sm font-bold text-sand-600 hover:bg-sand-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="primary-button inline-flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={17} />
              {loading ? "Saving..." : "Save Book"}
            </button>
          </div>
        </form>
      </main>
    </PageShell>
  );
}