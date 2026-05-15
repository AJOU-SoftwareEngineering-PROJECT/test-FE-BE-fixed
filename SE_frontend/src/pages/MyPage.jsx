import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageShell from "../components/PageShell";
import TopHeader from "../components/TopHeader";
import {
  BookOpen,
  Bookmark,
  CheckCircle2,
  Edit,
  Mail,
  MessageSquare,
  Save,
  UserRound,
  X,
} from "lucide-react";
import { getMyPage, updateMyPage } from "../services/api";

const tabs = [
  { key: "overview", label: "Overview" },
  { key: "books", label: "My Books" },
  { key: "scraps", label: "Scraps" },
  { key: "comments", label: "Comments" },
];

const activityIcons = {
  book: BookOpen,
  comment: MessageSquare,
  scrap: Bookmark,
  system: CheckCircle2,
};

export default function MyPage() {
  const [myPage, setMyPage] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    gender: "MALE",
    age: 20,
    intro: "",
    email: "",
  });

  const loadMyPage = () => {
    setLoading(true);

    getMyPage()
      .then((data) => {
        setMyPage(data);

        setForm({
          name: data.profile?.name || "",
          gender: data.profile?.gender || "MALE",
          age: data.profile?.age || 20,
          intro: data.profile?.intro || "",
          email: data.profile?.email || "",
        });
      })
      .catch((error) => {
        console.error("Failed to load my page:", error);
        setMyPage(null);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadMyPage();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "age" ? Number(value) : value,
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError("이름을 입력하세요.");
      return;
    }

    if (!form.email.trim()) {
      setError("이메일을 입력하세요.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await updateMyPage({
        name: form.name.trim(),
        gender: form.gender,
        age: Number(form.age),
        intro: form.intro.trim(),
        email: form.email.trim(),
      });

      setEditing(false);
      loadMyPage();
    } catch (error) {
      console.error(error);
      setError("프로필 수정에 실패했습니다. 이메일 중복 또는 백엔드 오류입니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageShell>
        <main className="p-5 md:p-8 max-w-7xl mx-auto">
          <div className="card p-8 text-sm text-slate-500">
            마이페이지 정보를 불러오는 중입니다...
          </div>
        </main>
      </PageShell>
    );
  }

  if (!myPage) {
    return (
      <PageShell>
        <main className="p-5 md:p-8 max-w-7xl mx-auto">
          <div className="card p-10 text-center">
            <UserRound size={44} className="mx-auto text-slate-300 mb-4" />
            <h3 className="font-black text-slate-700">
              마이페이지 정보를 불러올 수 없습니다.
            </h3>
            <p className="text-sm text-slate-500 mt-2">
              백엔드와 DB가 실행 중인지 확인하세요.
            </p>
          </div>
        </main>
      </PageShell>
    );
  }

  const { profile, activities, books, scraps, comments } = myPage;

  return (
    <PageShell>
      <main className="p-5 md:p-8 max-w-7xl mx-auto">
        <TopHeader
          title="My Page"
          subtitle="내 프로필, 저장한 문장, 댓글, 작성한 책을 관리합니다."
          right={
            <button
              onClick={() => {
                setEditing((prev) => !prev);
                setError("");
              }}
              className="primary-button inline-flex items-center gap-2"
            >
              {editing ? <X size={17} /> : <Edit size={17} />}
              {editing ? "Cancel" : "Edit Profile"}
            </button>
          }
        />

        <section className="grid xl:grid-cols-[340px_1fr] gap-6">
          <aside className="space-y-5">
            <div className="card p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-violet-100 text-blue-600 flex items-center justify-center">
                  <UserRound size={42} />
                </div>

                {!editing ? (
                  <>
                    <h2 className="text-xl font-black text-slate-900 mt-4">
                      {profile.name}
                    </h2>

                    <p className="text-sm text-slate-500 mt-1 inline-flex items-center gap-1">
                      <Mail size={14} />
                      {profile.email}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-3">
                      <span>{profile.gender}</span>
                      <span>{profile.age} years old</span>
                    </div>

                    <p className="text-sm text-slate-600 leading-6 mt-4">
                      {profile.intro || "No introduction."}
                    </p>
                  </>
                ) : (
                  <div className="w-full mt-5 text-left space-y-4">
                    {error && (
                      <div className="rounded-xl bg-red-50 text-red-600 text-sm px-4 py-3">
                        {error}
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-2">
                        Name
                      </label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-2">
                        Email
                      </label>
                      <input
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-2">
                          Gender
                        </label>
                        <select
                          name="gender"
                          value={form.gender}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                        >
                          <option value="MALE">MALE</option>
                          <option value="FEMALE">FEMALE</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-2">
                          Age
                        </label>
                        <input
                          name="age"
                          type="number"
                          value={form.age}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-2">
                        Introduction
                      </label>
                      <textarea
                        name="intro"
                        value={form.intro}
                        onChange={handleChange}
                        rows={4}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-100 resize-none"
                      />
                    </div>

                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="primary-button w-full inline-flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Save size={17} />
                      {saving ? "Saving..." : "Save Profile"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setActiveTab("books")}
                className="card p-4 text-center hover:-translate-y-1 transition"
              >
                <BookOpen size={20} className="mx-auto text-blue-600" />
                <p className="text-xl font-black mt-2">{profile.book_count}</p>
                <p className="text-xs text-slate-500">Books</p>
              </button>

              <button
                onClick={() => setActiveTab("comments")}
                className="card p-4 text-center hover:-translate-y-1 transition"
              >
                <MessageSquare size={20} className="mx-auto text-violet-600" />
                <p className="text-xl font-black mt-2">
                  {profile.comment_count}
                </p>
                <p className="text-xs text-slate-500">Comments</p>
              </button>

              <button
                onClick={() => setActiveTab("scraps")}
                className="card p-4 text-center hover:-translate-y-1 transition"
              >
                <Bookmark size={20} className="mx-auto text-emerald-600" />
                <p className="text-xl font-black mt-2">{profile.scrap_count}</p>
                <p className="text-xs text-slate-500">Scraps</p>
              </button>
            </div>

            <div className="card p-5">
              <h3 className="font-black mb-4">Quick Links</h3>

              <div className="space-y-3">
                <Link
                  to="/authors"
                  className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600"
                >
                  <UserRound size={16} />
                  Authors
                </Link>

                <Link
                  to="/books"
                  className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600"
                >
                  <BookOpen size={16} />
                  Books
                </Link>

                <Link
                  to="/scraps"
                  className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600"
                >
                  <Bookmark size={16} />
                  Scraps
                </Link>
              </div>
            </div>
          </aside>

          <section className="space-y-5">
            <div className="card p-2">
              <div className="grid grid-cols-4 gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`rounded-xl px-3 py-3 text-sm font-bold transition ${
                      activeTab === tab.key
                        ? "bg-blue-600 text-white"
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === "overview" && (
              <div className="card p-6">
                <h3 className="font-black text-lg mb-5">Recent Activity</h3>

                <div className="space-y-4">
                  {activities.map((activity, index) => {
                    const Icon = activityIcons[activity.type] || CheckCircle2;

                    return (
                      <div
                        key={index}
                        className="flex items-start gap-4 rounded-2xl border border-slate-100 p-4"
                      >
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
                          <Icon size={18} />
                        </div>

                        <div className="flex-1">
                          <p className="font-bold text-sm text-slate-800">
                            {activity.title}
                          </p>

                          <p className="text-sm text-slate-500 mt-1 leading-6">
                            {activity.description}
                          </p>

                          <p className="text-xs text-slate-400 mt-2">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "books" && (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-black text-lg">My Books</h3>

                  <Link
                    to="/books/new"
                    className="text-sm font-bold text-blue-600"
                  >
                    Add Book
                  </Link>
                </div>

                {books.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    아직 작성한 책이 없습니다.
                  </p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {books.map((book) => (
                      <Link
                        key={book.id}
                        to={`/books/${book.id}`}
                        className="rounded-2xl border border-slate-100 p-5 hover:border-blue-200 hover:bg-blue-50/30 transition"
                      >
                        <BookOpen size={22} className="text-blue-600" />
                        <h4 className="font-black mt-3">{book.name}</h4>
                        <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                          {book.intro || "No introduction."}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "scraps" && (
              <div className="card p-6">
                <h3 className="font-black text-lg mb-5">Saved Scraps</h3>

                {scraps.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    저장한 문장이 없습니다.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {scraps.map((scrap) => (
                      <div
                        key={scrap.id}
                        className="rounded-2xl border border-slate-100 p-5"
                      >
                        <p className="text-xs font-bold text-blue-600">
                          {scrap.book_name}
                        </p>

                        <p className="text-sm text-slate-700 leading-6 mt-2">
                          {scrap.sentence_content}
                        </p>

                        <p className="text-xs text-slate-400 mt-3">
                          Saved at {new Date(scrap.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "comments" && (
              <div className="card p-6">
                <h3 className="font-black text-lg mb-5">My Comments</h3>

                {comments.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    작성한 댓글이 없습니다.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="rounded-2xl border border-slate-100 p-5"
                      >
                        <div className="flex items-start gap-3">
                          <MessageSquare
                            size={18}
                            className="text-violet-600 mt-1"
                          />

                          <div className="flex-1">
                            <p className="text-sm text-slate-700 leading-6">
                              {comment.content}
                            </p>

                            <div className="flex items-center gap-4 text-xs text-slate-400 mt-3">
                              <span>Likes: {comment.like_count}</span>
                              <span>
                                {new Date(comment.created_at).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        </section>
      </main>
    </PageShell>
  );
}