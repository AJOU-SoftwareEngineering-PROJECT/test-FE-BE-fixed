import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { loginUser, registerUser } from "../services/api";

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#1877F2"
        d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669c1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"
      />
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    gender: "MALE",
    age: 20,
    intro: "",
  });

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterChange = (event) => {
    const { name, value } = event.target;
    setRegisterForm((prev) => ({
      ...prev,
      [name]: name === "age" ? Number(value) : value,
    }));
  };

  const saveLoginUser = (user) => {
    localStorage.setItem("currentUser", JSON.stringify(user));
    localStorage.setItem("currentUserId", String(user.id));
    localStorage.setItem("rememberMe", rememberMe ? "1" : "0");
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setNotice("");

    if (!loginForm.email.trim()) {
      setError("이메일을 입력하세요.");
      return;
    }
    if (!loginForm.password.trim()) {
      setError("비밀번호를 입력하세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const user = await loginUser(
        loginForm.email.trim(),
        loginForm.password.trim()
      );
      saveLoginUser(user);
      navigate("/home");
    } catch (err) {
      console.error(err);
      setError("로그인 실패: 이메일 또는 비밀번호가 올바르지 않습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setNotice("");

    if (!registerForm.name.trim()) {
      setError("이름을 입력하세요.");
      return;
    }
    if (!registerForm.email.trim()) {
      setError("이메일을 입력하세요.");
      return;
    }
    if (registerForm.password.trim().length < 4) {
      setError("비밀번호는 최소 4자 이상이어야 합니다.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const user = await registerUser({
        name: registerForm.name.trim(),
        email: registerForm.email.trim(),
        password: registerForm.password.trim(),
        gender: registerForm.gender,
        age: Number(registerForm.age),
        intro: registerForm.intro.trim(),
      });
      saveLoginUser(user);
      navigate("/home");
    } catch (err) {
      console.error(err);
      setError("회원가입 실패: 이미 존재하는 이메일이거나 백엔드 오류입니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = (provider) => {
    setError("");
    setNotice(`${provider} 로그인은 아직 준비 중인 기능입니다.`);
  };

  const inputBase =
    "w-full rounded-xl border border-sand-200 bg-white pl-11 pr-4 py-3 text-sand-800 placeholder:text-sand-400 outline-none focus:border-clay-400 focus:ring-2 focus:ring-clay-100 transition";

  return (
    <main className="min-h-screen bg-sand-50 flex flex-col items-center justify-center px-4 py-6">
      {/* Brand */}
      <div className="flex items-center gap-2.5 mb-2">
        <BookOpen className="text-clay-600" size={30} strokeWidth={2.2} />
        <h1 className="text-2xl font-bold text-sand-900 tracking-tight">
          Interactive Reader
        </h1>
      </div>
      <p className="text-sm text-sand-500 mb-5">문장별 댓글과 음악이 함께하는 독서</p>

      {/* Card */}
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-[0_10px_40px_-12px_rgba(0,0,0,0.15)] border border-sand-100 p-6 sm:p-8">
        <h2 className="text-xl font-bold text-sand-900 mb-5">
          {mode === "login" ? "로그인" : "회원가입"}
        </h2>

        {error && (
          <div className="mb-5 rounded-xl bg-red-50 text-red-600 text-sm px-4 py-3">
            {error}
          </div>
        )}
        {notice && (
          <div className="mb-5 rounded-xl bg-clay-50 text-clay-600 text-sm px-4 py-3">
            {notice}
          </div>
        )}

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-sand-700 mb-2">
                이메일
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sand-400"
                  size={18}
                />
                <input
                  name="email"
                  type="email"
                  value={loginForm.email}
                  onChange={handleLoginChange}
                  className={inputBase}
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-sand-700 mb-2">
                비밀번호
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sand-400"
                  size={18}
                />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  className={`${inputBase} pr-11`}
                  placeholder="password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sand-400 hover:text-sand-600"
                  aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember / Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-sand-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-sand-300 text-clay-600 focus:ring-clay-400"
                />
                로그인 유지
              </label>
              <button
                type="button"
                onClick={() =>
                  setNotice("비밀번호 찾기는 아직 준비 중인 기능입니다.")
                }
                className="text-sm font-semibold text-clay-600 hover:text-clay-700"
              >
                비밀번호 찾기
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-clay-600 text-white rounded-xl py-3 font-bold hover:bg-clay-700 disabled:opacity-50 transition"
            >
              {loading ? "로그인 중..." : "로그인"}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 py-1">
              <span className="h-px flex-1 bg-sand-200" />
              <span className="text-sm text-sand-400">또는</span>
              <span className="h-px flex-1 bg-sand-200" />
            </div>

            {/* Social */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleSocial("Google")}
                className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-sand-200 bg-white py-3 font-semibold text-sand-700 hover:bg-sand-50 transition"
              >
                <GoogleIcon />
                Google로 계속하기
              </button>
              <button
                type="button"
                onClick={() => handleSocial("Facebook")}
                className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-sand-200 bg-white py-3 font-semibold text-sand-700 hover:bg-sand-50 transition"
              >
                <FacebookIcon />
                Facebook으로 계속하기
              </button>
            </div>

            {/* Footer */}
            <p className="text-center text-sm text-sand-500 pt-2">
              계정이 없으신가요?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError("");
                  setNotice("");
                }}
                className="font-bold text-clay-600 hover:text-clay-700"
              >
                회원가입
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-sand-700 mb-2">
                이름
              </label>
              <input
                name="name"
                value={registerForm.name}
                onChange={handleRegisterChange}
                className="w-full rounded-xl border border-sand-200 px-4 py-3 outline-none focus:border-clay-400 focus:ring-2 focus:ring-clay-100"
                placeholder="이름"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-sand-700 mb-2">
                이메일
              </label>
              <input
                name="email"
                type="email"
                value={registerForm.email}
                onChange={handleRegisterChange}
                className="w-full rounded-xl border border-sand-200 px-4 py-3 outline-none focus:border-clay-400 focus:ring-2 focus:ring-clay-100"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-sand-700 mb-2">
                비밀번호
              </label>
              <input
                name="password"
                type="password"
                value={registerForm.password}
                onChange={handleRegisterChange}
                className="w-full rounded-xl border border-sand-200 px-4 py-3 outline-none focus:border-clay-400 focus:ring-2 focus:ring-clay-100"
                placeholder="최소 4자 이상"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-sand-700 mb-2">
                  성별
                </label>
                <select
                  name="gender"
                  value={registerForm.gender}
                  onChange={handleRegisterChange}
                  className="w-full rounded-xl border border-sand-200 px-4 py-3 outline-none focus:border-clay-400 focus:ring-2 focus:ring-clay-100 bg-white"
                >
                  <option value="MALE">남성</option>
                  <option value="FEMALE">여성</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-sand-700 mb-2">
                  나이
                </label>
                <input
                  name="age"
                  type="number"
                  value={registerForm.age}
                  onChange={handleRegisterChange}
                  className="w-full rounded-xl border border-sand-200 px-4 py-3 outline-none focus:border-clay-400 focus:ring-2 focus:ring-clay-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-sand-700 mb-2">
                소개
              </label>
              <textarea
                name="intro"
                value={registerForm.intro}
                onChange={handleRegisterChange}
                rows={3}
                className="w-full rounded-xl border border-sand-200 px-4 py-3 outline-none focus:border-clay-400 focus:ring-2 focus:ring-clay-100 resize-none"
                placeholder="간단한 소개"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-clay-600 text-white rounded-xl py-3 font-bold hover:bg-clay-700 disabled:opacity-50 transition"
            >
              {loading ? "가입 중..." : "회원가입"}
            </button>

            <p className="text-center text-sm text-sand-500 pt-2">
              이미 계정이 있으신가요?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setNotice("");
                }}
                className="font-bold text-clay-600 hover:text-clay-700"
              >
                로그인
              </button>
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
