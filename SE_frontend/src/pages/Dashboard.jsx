import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageShell from "../components/PageShell";
import TopHeader from "../components/TopHeader";
import StatCard from "../components/StatCard";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  FileText,
  MessageSquare,
  Music2,
  Plus,
  UserRound,
  Users,
} from "lucide-react";
import { Bar, BarChart, Tooltip, XAxis, YAxis } from "recharts";
import { getDashboard } from "../services/api";

const icons = {
  Books: BookOpen,
  Chapters: FileText,
  Comments: MessageSquare,
  Completed: CheckCircle2,
  Readers: Users,
  Playlists: Music2,
};

const activityIcons = {
  book: BookOpen,
  sentence: FileText,
  comment: MessageSquare,
  scrap: CheckCircle2,
  system: AlertCircle,
};

const quickActions = [
  {
    title: "Browse Books",
    subtitle: "Explore library",
    icon: BookOpen,
    tone: "bg-emerald-50 text-emerald-600",
    to: "/books",
  },
  {
    title: "View Scraps",
    subtitle: "Saved sentences",
    icon: MessageSquare,
    tone: "bg-blue-50 text-blue-600",
    to: "/scraps",
  },
  {
    title: "Continue Reading",
    subtitle: "Open reader",
    icon: FileText,
    tone: "bg-violet-50 text-violet-600",
    to: "/books/1",
  },
  {
    title: "Music",
    subtitle: "API will be added later",
    icon: Music2,
    tone: "bg-pink-50 text-pink-600",
    to: "/playlists",
  },
];

const fallbackDashboard = {
  stats: [
    { label: "Books", value: 0, description: "등록된 도서" },
    { label: "Chapters", value: 0, description: "전체 챕터" },
    { label: "Comments", value: 0, description: "문장별 댓글" },
    { label: "Completed", value: 0, description: "저장된 문장" },
    { label: "Readers", value: 0, description: "전체 사용자" },
    { label: "Playlists", value: 0, description: "음악 API 준비 중" },
  ],
  readingOverview: [
    { month: "Ch 1", value: 0 },
    { month: "Ch 2", value: 0 },
    { month: "Ch 3", value: 0 },
    { month: "Ch 4", value: 0 },
    { month: "Ch 5", value: 0 },
    { month: "Ch 6", value: 0 },
  ],
  recentActivities: [
    {
      type: "system",
      title: "Dashboard data is not loaded yet.",
      time: "Now",
    },
  ],
};

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(fallbackDashboard);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    getDashboard()
      .then((data) => {
        setDashboard({
          stats: Array.isArray(data?.stats)
            ? data.stats
            : fallbackDashboard.stats,
          readingOverview: Array.isArray(data?.readingOverview)
            ? data.readingOverview
            : fallbackDashboard.readingOverview,
          recentActivities: Array.isArray(data?.recentActivities)
            ? data.recentActivities
            : fallbackDashboard.recentActivities,
        });

        setStatusMessage("실제 백엔드 데이터로 업데이트되었습니다.");
      })
      .catch((error) => {
        console.error("Dashboard load failed:", error);
        setDashboard(fallbackDashboard);
        setStatusMessage("백엔드 연결 실패.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <PageShell>
      <main className="p-5 md:p-8 max-w-7xl mx-auto">
        <TopHeader
          title="Project Dashboard"
          subtitle="독서 플랫폼의 실제 DB 현황을 확인하세요."
          right={
            <Link
              to="/books"
              className="primary-button hidden sm:inline-flex items-center gap-2"
            >
              <Plus size={17} />
              Books
            </Link>
          }
        />

        <div className="mb-5">
          <div
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs ${
              loading
                ? "bg-slate-100 text-slate-500"
                : "bg-emerald-50 text-emerald-600"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                loading ? "bg-slate-400" : "bg-emerald-500"
              }`}
            />
            {loading ? "Loading real dashboard data..." : statusMessage}
          </div>
        </div>

        <section className="grid sm:grid-cols-2 xl:grid-cols-6 gap-4 mb-6">
          {dashboard.stats.map((item) => (
            <StatCard
              key={item.label}
              {...item}
              icon={icons[item.label] || BookOpen}
            />
          ))}
        </section>

        <section className="grid xl:grid-cols-[1fr_1.15fr] gap-6 mb-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black">Recent Activity</h3>
              <span className="text-xs text-slate-400">실시간 DB 기준</span>
            </div>

            <div className="space-y-4">
              {dashboard.recentActivities.map((activity, index) => {
                const Icon = activityIcons[activity.type] || AlertCircle;

                return (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
                      <Icon size={18} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700">
                        {activity.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black">Reading Overview</h3>
              <span className="text-xs text-slate-400">
                Sentences by chapter
              </span>
            </div>

            <div className="w-full overflow-x-auto overflow-y-hidden">
              <div className="min-w-[520px]">
                <BarChart
                  width={520}
                  height={288}
                  data={dashboard.readingOverview}
                  margin={{
                    top: 10,
                    right: 20,
                    left: -20,
                    bottom: 0,
                  }}
                >
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#64748b" }}
                  />

                  <YAxis hide />

                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px",
                    }}
                  />

                  <Bar
                    dataKey="value"
                    radius={[10, 10, 0, 0]}
                    fill="#3b82f6"
                  />
                </BarChart>
              </div>
            </div>
          </div>
        </section>

        <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <Link
                key={action.title}
                to={action.to}
                className="card p-5 text-left hover:-translate-y-1 transition block"
              >
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 ${action.tone}`}
                >
                  <Icon size={20} />
                </div>

                <h4 className="font-bold">{action.title}</h4>
                <p className="text-xs text-slate-500 mt-1">
                  {action.subtitle}
                </p>
              </Link>
            );
          })}
        </section>

        <section className="mt-6 card p-6 bg-gradient-to-r from-violet-50 to-blue-50 border-violet-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-violet-600 shadow-sm">
              <UserRound size={22} />
            </div>

            <div>
              <h3 className="font-black">프로젝트 핵심 차별점</h3>
              <p className="text-sm text-slate-600 mt-2 leading-6">
                문장 단위 댓글, 문장 스크랩, 독서 데이터 통계를 실제 DB와
                연결했습니다. Music API는 추후 연결 예정입니다.
              </p>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}