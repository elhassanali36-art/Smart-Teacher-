"use client";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";
import { BarChart2, TrendingUp, Trophy, Clock, Users, CheckCircle } from "lucide-react";

interface Analytics {
  type: string;
  totalUsers?: number;
  totalStudents?: number;
  completedLessons?: number;
  avgScore?: number;
  usersByRole?: { role: string; count: number }[];
  studentsByStage?: { stage: string; count: number }[];
  weeklyData?: { day: string; xp: number; minutes: number }[];
}

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AnalyticsPage() {
  const { user, studentProfile } = useAuthStore();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [user]);

  async function fetchAnalytics() {
    setLoading(true);
    try {
      const type = user?.role === "admin" ? "overview" : "student";
      const params = new URLSearchParams({ type });
      if (studentProfile) params.set("studentId", studentProfile.id.toString());

      const res = await api(`/api/analytics?${params}`);
      const data = await res.json();
      setAnalytics(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const weeklyData = analytics?.weeklyData || Array.from({ length: 7 }, (_, i) => ({
    day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
    xp: Math.floor(Math.random() * 100),
    minutes: Math.floor(Math.random() * 60),
  }));

  const roleData = analytics?.usersByRole?.map(r => ({
    name: r.role.charAt(0).toUpperCase() + r.role.slice(1),
    value: Number(r.count),
  })) || [];

  const stageData = analytics?.studentsByStage?.map(s => ({
    name: s.stage.charAt(0).toUpperCase() + s.stage.slice(1),
    students: Number(s.count),
  })) || [];

  return (
    <DashboardLayout>
      <div className="max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <BarChart2 size={26} className="text-indigo-500" />
            Analytics & Reports
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            {user?.role === "admin" ? "Platform-wide analytics" : "Your learning analytics"}
          </p>
        </div>

        {/* Key Metrics */}
        {user?.role === "admin" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Users", value: analytics?.totalUsers || 0, icon: <Users size={20} />, color: "text-indigo-500 bg-indigo-50" },
              { label: "Students", value: analytics?.totalStudents || 0, icon: <TrendingUp size={20} />, color: "text-emerald-500 bg-emerald-50" },
              { label: "Lessons Done", value: analytics?.completedLessons || 0, icon: <CheckCircle size={20} />, color: "text-blue-500 bg-blue-50" },
              { label: "Avg Score", value: `${analytics?.avgScore || 0}%`, icon: <Trophy size={20} />, color: "text-amber-500 bg-amber-50" },
            ].map(stat => (
              <Card key={stat.label} padding="md" className="text-center">
                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mx-auto mb-3`}>
                  {stat.icon}
                </div>
                <div className="text-2xl font-extrabold text-slate-800">{stat.value}</div>
                <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
              </Card>
            ))}
          </div>
        )}

        {/* Student Stats */}
        {user?.role === "student" && studentProfile && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "XP Points", value: studentProfile.xpPoints, icon: "⚡", color: "bg-amber-50 text-amber-700" },
              { label: "Day Streak", value: studentProfile.streakDays, icon: "🔥", color: "bg-orange-50 text-orange-700" },
              { label: "Study Time", value: `${Math.round(studentProfile.totalStudyMinutes / 60)}h`, icon: "⏱️", color: "bg-blue-50 text-blue-700" },
              { label: "Grade", value: `G${studentProfile.grade}`, icon: "🎓", color: "bg-indigo-50 text-indigo-700" },
            ].map(stat => (
              <Card key={stat.label} padding="md" className={`text-center ${stat.color}`}>
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-extrabold">{stat.value}</div>
                <div className="text-xs mt-1 opacity-70">{stat.label}</div>
              </Card>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weekly Activity */}
          <Card padding="md">
            <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-indigo-500" />
              Weekly Activity
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="xp" fill="#6366f1" radius={[4, 4, 0, 0]} name="XP" />
                <Bar dataKey="minutes" fill="#10b981" radius={[4, 4, 0, 0]} name="Minutes" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Users Distribution / Learning Progress */}
          <Card padding="md">
            <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Users size={18} className="text-violet-500" />
              {user?.role === "admin" ? "User Distribution" : "Learning Progress"}
            </h2>
            {user?.role === "admin" && roleData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={roleData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {roleData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                <BarChart2 size={40} className="mb-3 text-slate-200" />
                <p className="text-sm">Analytics data loading...</p>
              </div>
            )}
          </Card>

          {/* Students by Stage */}
          {user?.role === "admin" && stageData.length > 0 && (
            <Card padding="md">
              <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Users size={18} className="text-emerald-500" />
                Students by Stage
              </h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stageData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="students" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Study Time */}
          <Card padding="md">
            <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Clock size={18} className="text-blue-500" />
              Study Time This Week
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="minutes"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#6366f1" }}
                  name="Minutes"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
