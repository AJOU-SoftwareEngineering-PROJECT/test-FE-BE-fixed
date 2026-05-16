import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import TopHeader from "../components/TopHeader";
import {
  CheckCircle2,
  LogOut,
  Palette,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { getMyPage, updateMyPage, updateMyPassword } from "../services/api";

export default function Settings() {
  const navigate = useNavigate();

  const [profileLoading, setProfileLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    gender: "MALE",
    age: 20,
    intro: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [uiForm, setUiForm] = useState({
    appearance: localStorage.getItem("appearance") || "light",
    accentColor: localStorage.getItem("accentColor") || "violet",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    localStorage.setItem("appearance", uiForm.appearance);
    localStorage.setItem("accentColor", uiForm.accentColor);

    if (uiForm.appearance === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [uiForm]);

  const loadProfile = async () => {
    setProfileLoading(true);
    setError("");

    try {
      const data = await getMyPage();
      const profile = data?.profile;

      if (profile) {
        setProfileForm({
          name: profile.name || "",
          email: profile.email || "",
          gender: profile.gender || "MALE",
          age: profile.age || 20,
          intro: profile.intro || "",
        });
      }
    } catch (error) {
      console.error(error);
      setError("프로필 정보를 불러오지 못했습니다.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfileForm((prev) => ({
      ...prev,
      [name]: name === "age" ? Number(value) : value,
    }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUiChange = (event) => {
    const { name, value } = event.target;

    setUiForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const showSuccess = (text) => {
    setMessage(text);
    setError("");

    window.setTimeout(() => {
      setMessage("");
    }, 2000);
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    if (!profileForm.name.trim()) {
      setError("이름을 입력하세요.");
      return;
    }

    if (!profileForm.email.trim()) {
      setError("이메일을 입력하세요.");
      return;
    }

    setSavingProfile(true);
    setError("");

    try {
      const updated = await updateMyPage({
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
        gender: profileForm.gender,
        age: Number(profileForm.age),
        intro: profileForm.intro.trim(),
      });

      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          ...currentUser,
          id: updated.id,
          name: updated.name,
          email: updated.email,
          gender: updated.gender,
          age: updated.age,
          intro: updated.intro,
        })
      );

      localStorage.setItem("currentUserId", String(updated.id));

      showSuccess("프로필이 저장되었습니다.");
    } catch (error) {
      console.error(error);
      setError("프로필 저장에 실패했습니다.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async (event) => {
    event.preventDefault();

    if (!passwordForm.old_password.trim()) {
      setError("현재 비밀번호를 입력하세요.");
      return;
    }

    if (!passwordForm.new_password.trim()) {
      setError("새 비밀번호를 입력하세요.");
      return;
    }

    if (passwordForm.new_password.trim().length < 4) {
      setError("새 비밀번호는 최소 4자 이상이어야 합니다.");
      return;
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError("새 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    setSavingPassword(true);
    setError("");

    try {
      await updateMyPassword({
        old_password: passwordForm.old_password.trim(),
        new_password: passwordForm.new_password.trim(),
      });

      setPasswordForm({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });

      showSuccess("비밀번호가 변경되었습니다.");
    } catch (error) {
      console.error(error);
      setError("비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인하세요.");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("currentUserId");
    navigate("/login");
  };

  return (
    <PageShell>
      <main className="p-5 md:p-8 max-w-7xl mx-auto">
        <TopHeader
          title="Settings"
          subtitle="계정 정보, 비밀번호, 화면 설정을 관리합니다."
          right={
            <button
              onClick={handleLogout}
              className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-red-50 text-red-600 px-4 py-3 text-sm font-bold hover:bg-red-100"
            >
              <LogOut size={17} />
              Logout
            </button>
          }
        />

        {message && (
          <div className="mb-5 rounded-2xl bg-emerald-50 text-emerald-600 px-4 py-3 text-sm flex items-center gap-2">
            <CheckCircle2 size={17} />
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-2xl bg-red-50 text-red-600 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <section className="grid xl:grid-cols-[1.1fr_0.9fr] gap-6">
          <div className="space-y-6">
            <form onSubmit={handleSaveProfile} className="card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
                  <UserRound size={22} />
                </div>

                <div>
                  <h3 className="font-black text-lg">Profile Settings</h3>
                  <p className="text-sm text-slate-500">
                    DB에 저장된 사용자 정보를 수정합니다.
                  </p>
                </div>
              </div>

              {profileLoading ? (
                <p className="text-sm text-slate-500">
                  Loading profile from DB...
                </p>
              ) : (
                <div className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-2">
                        Name
                      </label>
                      <input
                        name="name"
                        value={profileForm.name}
                        onChange={handleProfileChange}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-100"
                        placeholder="Name"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-2">
                        Email
                      </label>
                      <input
                        name="email"
                        value={profileForm.email}
                        onChange={handleProfileChange}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-100"
                        placeholder="Email"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-2">
                        Gender
                      </label>
                      <select
                        name="gender"
                        value={profileForm.gender}
                        onChange={handleProfileChange}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-100 bg-white"
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
                        value={profileForm.age}
                        onChange={handleProfileChange}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2">
                      Introduction
                    </label>
                    <textarea
                      name="intro"
                      value={profileForm.intro}
                      onChange={handleProfileChange}
                      rows={5}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-100 resize-none"
                      placeholder="Short introduction"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="inline-flex items-center gap-2 rounded-xl bg-violet-600 text-white px-5 py-3 text-sm font-bold hover:bg-violet-700 disabled:opacity-50"
                  >
                    <Save size={17} />
                    {savingProfile ? "Saving..." : "Save Profile"}
                  </button>
                </div>
              )}
            </form>

            <form onSubmit={handleSavePassword} className="card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShieldCheck size={22} />
                </div>

                <div>
                  <h3 className="font-black text-lg">Password Settings</h3>
                  <p className="text-sm text-slate-500">
                    현재 비밀번호 확인 후 새 비밀번호로 변경합니다.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">
                    Current Password
                  </label>
                  <input
                    name="old_password"
                    type="password"
                    value={passwordForm.old_password}
                    onChange={handlePasswordChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="Current password"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2">
                      New Password
                    </label>
                    <input
                      name="new_password"
                      type="password"
                      value={passwordForm.new_password}
                      onChange={handlePasswordChange}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                      placeholder="New password"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2">
                      Confirm Password
                    </label>
                    <input
                      name="confirm_password"
                      type="password"
                      value={passwordForm.confirm_password}
                      onChange={handlePasswordChange}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                      placeholder="Confirm password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingPassword}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white px-5 py-3 text-sm font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                  <ShieldCheck size={17} />
                  {savingPassword ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>

          <aside className="space-y-6">
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center">
                  <Palette size={22} />
                </div>

                <div>
                  <h3 className="font-black text-lg">UI Settings</h3>
                  <p className="text-sm text-slate-500">
                    브라우저 localStorage에 저장됩니다.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">
                    Appearance
                  </label>
                  <select
                    name="appearance"
                    value={uiForm.appearance}
                    onChange={handleUiChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none bg-white"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">
                    Accent Color
                  </label>
                  <select
                    name="accentColor"
                    value={uiForm.accentColor}
                    onChange={handleUiChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none bg-white"
                  >
                    <option value="violet">Violet</option>
                    <option value="blue">Blue</option>
                    <option value="pink">Pink</option>
                    <option value="emerald">Emerald</option>
                  </select>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-xs font-bold text-slate-500 mb-3">
                    Current Settings
                  </p>
                  <div className="text-sm text-slate-600 space-y-2">
                    <p>Appearance: {uiForm.appearance}</p>
                    <p>Accent: {uiForm.accentColor}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6 bg-gradient-to-r from-red-50 to-orange-50 border-red-100">
              <h3 className="font-black text-red-600 mb-2">Logout</h3>
              <p className="text-sm text-slate-600 leading-6 mb-5">
                로그아웃하면 localStorage의 로그인 정보가 삭제되고 Login 페이지로 이동합니다.
              </p>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 text-white px-5 py-3 text-sm font-bold hover:bg-red-700"
              >
                <LogOut size={17} />
                Logout
              </button>
            </div>
          </aside>
        </section>
      </main>
    </PageShell>
  );
}