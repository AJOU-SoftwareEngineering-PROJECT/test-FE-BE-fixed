import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, ExternalLink, Mail, Music2, Sparkles } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("reader@example.com");
  const [password, setPassword] = useState("1234");
  const [error, setError] = useState(false);

  const handleLogin = (event) => {
    event.preventDefault();
    if (!email.includes("@") || password.length < 4) {
      setError(true);
      return;
    }
    navigate("/dashboard");
  };

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <section className="w-full max-w-5xl grid lg:grid-cols-[1.1fr_0.9fr] bg-white rounded-[2rem] shadow-soft overflow-hidden border border-slate-200">
        <div className="hidden lg:flex relative bg-gradient-to-br from-blue-600 via-violet-600 to-slate-900 p-12 text-white flex-col justify-between">
          <div>
            <div className="w-14 h-14 rounded-3xl bg-white/15 backdrop-blur flex items-center justify-center mb-8">
              <BookOpen size={28} />
            </div>
            <h1 className="text-4xl font-black leading-tight">Interactive Reader</h1>
            <p className="text-blue-100 mt-4 leading-7">
              문장별 댓글과 음악 스트리밍을 결합한 새로운 독서 플랫폼입니다.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-3xl p-5 border border-white/10">
              <Sparkles className="mb-3" />
              <p className="font-bold">Sentence Comments</p>
              <p className="text-xs text-blue-100 mt-1">각 문장마다 의견 공유</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-3xl p-5 border border-white/10">
              <Music2 className="mb-3" />
              <p className="font-bold">Music Streaming</p>
              <p className="text-xs text-blue-100 mt-1">책에 어울리는 음악 추천</p>
            </div>
          </div>
        </div>

        <div className="p-8 sm:p-12">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
              <BookOpen size={21} />
            </div>
            <div>
              <h2 className="font-black text-xl">Interactive Reader</h2>
              <p className="text-xs text-slate-500">로그인 후 독서 플랫폼을 이용하세요</p>
            </div>
          </div>

          <h1 className="text-3xl font-black mb-2">Log in</h1>
          <p className="text-sm text-slate-500 mb-8">Welcome back. Continue your reading journey.</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <input
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(false);
                }}
                className={`w-full rounded-xl border px-4 py-3 outline-none focus:ring-4 focus:ring-blue-100 ${error ? "border-red-400" : "border-slate-200"}`}
                placeholder="reader@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Password</label>
              <input
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                type="password"
                className={`w-full rounded-xl border px-4 py-3 outline-none focus:ring-4 focus:ring-blue-100 ${error ? "border-red-400" : "border-slate-200"}`}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3">
                로그인 정보가 올바르지 않습니다. 이메일과 비밀번호를 확인하세요.
              </div>
            )}

            <button className="primary-button w-full">Log in</button>
          </form>

          <div className="my-7 flex items-center gap-3 text-xs text-slate-400">
            <div className="h-px bg-slate-200 flex-1" />
            or continue with
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="secondary-button flex items-center justify-center gap-2">
              <Mail size={17} /> Google
            </button>
            <button className="secondary-button flex items-center justify-center gap-2">
              <ExternalLink size={17} /> GitHub
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
