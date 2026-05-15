import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageShell from "../components/PageShell";
import TopHeader from "../components/TopHeader";
import BookCard from "../components/BookCard";
import { ArrowLeft, BookOpen, Edit, Mail, Save, UserRound } from "lucide-react";
import { getAuthor, updateAuthor } from "../services/api";

export default function AuthorDetail() {
  const { authorId } = useParams();

  const [author, setAuthor] = useState(null);
  const [form, setForm] = useState({
    name: "",
    gender: "MALE",
    age: 20,
    intro: "",
    email: "",
  });

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadAuthor = () => {
    setLoading(true);

    getAuthor(authorId)
      .then((data) => {
        setAuthor(data);
        setForm({
          name: data.name || "",
          gender: data.gender || "MALE",
          age: data.age || 20,
          intro: data.intro || "",
          email: data.email || "",
        });
      })
      .catch((error) => {
        console.error("Failed to load author:", error);
        setAuthor(null);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadAuthor();
  }, [authorId]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "age" ? Number(value) : value,
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError("작가 이름을 입력하세요.");
      return;
    }

    if (!form.email.trim()) {
      setError("이메일을 입력하세요.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await updateAuthor(authorId, {
        name: form.name.trim(),
        gender: form.gender,
        age: Number(form.age),
        intro: form.intro.trim(),
        email: form.email.trim(),
      });

      setEditing(false);
      loadAuthor();
    } catch (error) {
      console.error(error);
      setError("수정 실패: 이메일 중복 또는 백엔드 오류입니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageShell>
        <main className="p-5 md:p-8 max-w-7xl mx-auto">
          <div className="card p-8 text-sm text-slate-500">
            작가 정보를 불러오는 중입니다...
          </div>
        </main>
      </PageShell>
    );
  }

  if (!author) {
    return (
      <PageShell>
        <main className="p-5 md:p-8 max-w-7xl mx-auto">
          <div className="card p-10 text-center">
            <UserRound size={44} className="mx-auto text-slate-300 mb-4" />
            <h3 className="font-black text-slate-700">
              작가를 찾을 수 없습니다.
            </h3>
            <Link
              to="/authors"
              className="inline-flex mt-4 text-sm font-bold text-blue-600"
            >
              Back to Authors
            </Link>
          </div>
        </main>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <main className="p-5 md:p-8 max-w-7xl mx-auto">
        <TopHeader
          title={author.name}
          subtitle="작가 상세 정보와 등록된 책 목록입니다."
          right={
            <div className="flex items-center gap-3">
              <Link
                to="/authors"
                className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600"
              >
                <ArrowLeft size={16} />
                Back
              </Link>

              <button
                onClick={() => setEditing((prev) => !prev)}
                className="primary-button inline-flex items-center gap-2"
              >
                <Edit size={16} />
                {editing ? "Cancel Edit" : "Edit"}
              </button>
            </div>
          }
        />

        <section className="card p-6 mb-6">
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 text-red-600 text-sm px-4 py-3">
              {error}
            </div>
          )}

          {!editing ? (
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <UserRound size={32} />
              </div>

              <div className="flex-1">
                <h2 className="text-2xl font-black text-slate-900">
                  {author.name}
                </h2>

                <div className="flex flex-wrap gap-4 text-sm text-slate-500 mt-2">
                  <span>{author.gender}</span>
                  <span>{author.age} years old</span>
                  <span className="inline-flex items-center gap-1">
                    <Mail size={14} />
                    {author.email}
                  </span>
                </div>

                <p className="text-sm text-slate-600 mt-4 leading-6">
                  {author.intro || "No introduction."}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Author Name
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                  >
                    <option value="MALE">MALE</option>
                    <option value="FEMALE">FEMALE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Age
                  </label>
                  <input
                    name="age"
                    type="number"
                    value={form.age}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Email
                </label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Introduction
                </label>
                <textarea
                  name="intro"
                  value={form.intro}
                  onChange={handleChange}
                  rows={5}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 resize-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="primary-button inline-flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={17} />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={20} className="text-blue-600" />
            <h3 className="font-black text-lg">Books by {author.name}</h3>
          </div>

          {author.books.length === 0 ? (
            <div className="card p-8 text-sm text-slate-500">
              이 작가가 등록한 책이 없습니다.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {author.books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </section>
      </main>
    </PageShell>
  );
}