import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Database, LogIn, UserPlus } from "lucide-react";
import { getLoginUsers, loginUser, registerUser } from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [dbUsers, setDbUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  useEffect(() => {
    getLoginUsers()
      .then((data) => {
        setDbUsers(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error("Failed to load DB users:", error);
        setDbUsers([]);
      })
      .finally(() => {
        setLoadingUsers(false);
      });
  }, []);

  const handleLoginChange = (event) => {
    const { name, value } = event.target;

    setLoginForm((prev) => ({
      ...prev,
      [name]: value,
    }));
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
  };

  const handleLogin = async (event) => {
    event.preventDefault();

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
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      setError("로그인 실패: 이메일 또는 비밀번호가 올바르지 않습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    if (!registerForm.name.trim()) {
      setError("이름을 입력하세요.");
      return;
    }

    if (!registerForm.email.trim()) {
      setError("이메일을 입력하세요.");
      return;
    }

    if (!registerForm.password.trim()) {
      setError("비밀번호를 입력하세요.");
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
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      setError("회원가입 실패: 이미 존재하는 이메일이거나 백엔드 오류입니다.");
    } finally {
      setLoading(false);
    }
  };

  const selectDbUser = (email) => {
    setLoginForm((prev) => ({
      ...prev,
      email,
    }));
    setMode("login");
    setError("");
  };

  return (
    <main className="min-h-screen bg-slate-100 grid lg:grid-cols-[1fr_430px]">
      <section className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-blue-700 via-blue-600 to-violet-700 text-white">
        <div>
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mb-8">
            <BookOpen size={30} />
          </div>

          <h1 className="text-5xl font-black leading-tight">
            Interactive
            <br />
            Reading Platform
          </h1>

          <p className="text-blue-100 mt-6 leading-7 max-w-xl">
            실제 PostgreSQL DB와 연결된 로그인 페이지입니다. 회원가입하면 users 테이블에 저장되고,
            로그인하면 Dashboard로 이동합니다.
          </p>
        </div>

        <div className="rounded-3xl bg-white/10 border border-white/20 p-6 backdrop-blur">
          <div className="flex items-center gap-3 mb-3">
            <Database size={22} />
            <h3 className="font-black">Current DB</h3>
          </div>

          <div className="text-sm text-blue-100 leading-7">
            <p>PostgreSQL Docker</p>
            <p>DB Name: ajou_se_db</p>
            <p>User: postgres</p>
            <p>Port: 5432</p>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-4">
              <BookOpen size={28} />
            </div>

            <h1 className="text-2xl font-black text-slate-900">
              {mode === "login" ? "Login" : "Register"}
            </h1>

            <p className="text-sm text-slate-500 mt-2">
              이메일과 비밀번호로 로그인합니다.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-slate-100 rounded-2xl p-1 mb-6">
            <button
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className={`rounded-xl py-3 text-sm font-bold transition ${
                mode === "login"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Login
            </button>

            <button
              onClick={() => {
                setMode("register");
                setError("");
              }}
              className={`rounded-xl py-3 text-sm font-bold transition ${
                mode === "register"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="mb-5 rounded-xl bg-red-50 text-red-600 text-sm px-4 py-3">
              {error}
            </div>
          )}

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Email
                </label>

                <input
                  name="email"
                  value={loginForm.email}
                  onChange={handleLoginChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="email in DB"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Password
                </label>

                <input
                  name="password"
                  type="password"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white rounded-xl py-3 font-bold inline-flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50"
              >
                <LogIn size={18} />
                {loading ? "Logging in..." : "Login"}
              </button>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold text-slate-500 mb-3">
                  DB Users
                </p>

                {loadingUsers ? (
                  <p className="text-xs text-slate-400">
                    Loading users from DB...
                  </p>
                ) : dbUsers.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    아직 DB에 user가 없습니다. Register로 먼저 생성하세요.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {dbUsers.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => selectDbUser(user.email)}
                        className="w-full text-left rounded-xl bg-white border border-slate-100 px-3 py-2 hover:border-blue-200"
                      >
                        <p className="text-sm font-bold text-slate-700">
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {user.email}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Name
                </label>

                <input
                  name="name"
                  value={registerForm.name}
                  onChange={handleRegisterChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Email
                </label>

                <input
                  name="email"
                  value={registerForm.email}
                  onChange={handleRegisterChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Password
                </label>

                <input
                  name="password"
                  type="password"
                  value={registerForm.password}
                  onChange={handleRegisterChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="At least 4 characters"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Gender
                  </label>

                  <select
                    name="gender"
                    value={registerForm.gender}
                    onChange={handleRegisterChange}
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
                    value={registerForm.age}
                    onChange={handleRegisterChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Introduction
                </label>

                <textarea
                  name="intro"
                  value={registerForm.intro}
                  onChange={handleRegisterChange}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 resize-none"
                  placeholder="Short introduction"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white rounded-xl py-3 font-bold inline-flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50"
              >
                <UserPlus size={18} />
                {loading ? "Creating..." : "Register"}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}