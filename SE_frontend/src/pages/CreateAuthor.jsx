import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import TopHeader from "../components/TopHeader";
import { Save, UserRound } from "lucide-react";
import { createAuthor } from "../services/api";

export default function CreateAuthor() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    gender: "MALE",
    age: 20,
    intro: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "age" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("작가 이름을 입력하세요.");
      return;
    }

    if (!form.email.trim()) {
      setError("이메일을 입력하세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const author = await createAuthor({
        name: form.name.trim(),
        gender: form.gender,
        age: Number(form.age),
        intro: form.intro.trim(),
        email: form.email.trim(),
      });

      navigate(`/authors/${author.id}`);
    } catch (error) {
      console.error(error);
      setError(
        "작가 저장에 실패했습니다. 이메일이 이미 존재하거나 백엔드가 꺼져 있을 수 있습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <main className="p-5 md:p-8 max-w-5xl mx-auto">
        <TopHeader
          title="Create Author"
          subtitle="새로운 작가 정보를 실제 DB에 저장합니다."
        />

        <form onSubmit={handleSubmit} className="card p-6 mt-6 space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-clay-50 text-clay-600 flex items-center justify-center">
              <UserRound size={22} />
            </div>

            <div>
              <h3 className="font-black">Author Information</h3>
              <p className="text-sm text-sand-500">
                입력한 작가 정보는 backend database에 저장됩니다.
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
              Author Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-sand-200 px-4 py-3 outline-none focus:ring-2 focus:ring-clay-100"
              placeholder="Example: James Clear"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-sand-700 mb-2">
                Gender
              </label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full rounded-xl border border-sand-200 px-4 py-3 outline-none focus:ring-2 focus:ring-clay-100 bg-white"
              >
                <option value="MALE">MALE</option>
                <option value="FEMALE">FEMALE</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-sand-700 mb-2">
                Age
              </label>
              <input
                name="age"
                type="number"
                value={form.age}
                onChange={handleChange}
                className="w-full rounded-xl border border-sand-200 px-4 py-3 outline-none focus:ring-2 focus:ring-clay-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-sand-700 mb-2">
              Email
            </label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-sand-200 px-4 py-3 outline-none focus:ring-2 focus:ring-clay-100"
              placeholder="author@example.com"
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
              rows={5}
              className="w-full rounded-xl border border-sand-200 px-4 py-3 outline-none focus:ring-2 focus:ring-clay-100 resize-none"
              placeholder="Write a short introduction of the author."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/authors")}
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
              {loading ? "Saving..." : "Save Author"}
            </button>
          </div>
        </form>
      </main>
    </PageShell>
  );
}