"use client";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getXPForLevel } from "@/lib/utils";
import { TrendingUp, BookOpen, CheckCircle, Clock, Target, BarChart2 } from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";

export default function ProgressPage() {
  const { studentProfile } = useAuthStore();
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const xpData = getXPForLevel(studentProfile?.xpPoints || 0);

  useEffect(() => {
    if (studentProfile) fetchProgress();
  }, [studentProfile]);

  async function fetchProgress() {
    setLoading(true);
    try {
      const res = await api(`/api/progress?studentId=${studentProfile!.id}`);
      const data = await res.json();
      setProgress(data.progress || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const completed = progress.filter(p => p.status === "completed").length;
  const inProgress = progress.filter(p => p.status === "in_progress").length;
  const totalTime = progress.reduce((sum, p) => sum + (p.timeSpentMinutes || 0), 0);

  const weeklyData = Array.from({ length: 7 }, (_, i) => ({
    day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
    xp: Math.floor(Math.random() * 80) + 10,
    lessons: Math.floor(Math.random() * 4),
  }));

  const subjectData = [
    { subject: "Math", score: 75 },
    { subject: "English", score: 82 },
    { subject: "Science", score: 68 },
    { subject: "Arabic", score: 71 },
    { subject: "History", score: 85 },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <TrendingUp size={26} className="text-emerald-500" />
            My Progress
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Track your learning journey</p>
        </div>

        {/* XP & Level */}
        <div className="bg-gradient-to-r from-indigo-500 to-violet-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm opacity-80">Current Level</div>
              <div className="text-4xl font-extrabold">Level {xpData.level}</div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-80">Total XP</div>
              <div className="text-2xl font-bold">{studentProfile?.xpPoints || 0}</div>
            </div>
          </div>
          <ProgressBar value={xpData.percent} barClassName="bg-white" />
          <div className="text-xs opacity-70 mt-2">
            {xpData.current}/{xpData.needed} XP to Level {xpData.level + 1}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Completed", value: completed, icon: <CheckCircle size={20} />, color: "text-emerald-500 bg-emerald-50" },
            { label: "In Progress", value: inProgress, icon: <BookOpen size={20} />, color: "text-blue-500 bg-blue-50" },
            { label: "Study Time", value: `${Math.round(totalTime / 60)}h`, icon: <Clock size={20} />, color: "text-violet-500 bg-violet-50" },
            { label: "Day Streak", value: studentProfile?.streakDays || 0, icon: <Target size={20} />, color: "text-orange-500 bg-orange-50" },
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weekly XP */}
          <Card padding="md">
            <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <BarChart2 size={18} className="text-indigo-500" />
              Weekly XP Earned
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="xp" stroke="#6366f1" fill="#6366f115" strokeWidth={2} name="XP" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Subject Radar */}
          <Card padding="md">
            <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-500" />
              Subject Performance
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={subjectData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f130" />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Lesson Progress List */}
        <Card padding="md">
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BookOpen size={18} className="text-blue-500" />
            Lesson Progress
          </h2>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ) : progress.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <BookOpen size={32} className="mx-auto mb-2 text-slate-200" />
              <p>No lesson progress yet. Start learning!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {progress.map((p, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    p.status === "completed" ? "bg-emerald-100" :
                    p.status === "in_progress" ? "bg-indigo-100" : "bg-slate-100"
                  }`}>
                    {p.status === "completed" ? "✅" : p.status === "in_progress" ? "📖" : "📚"}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-700 capitalize">
                      Lesson {p.lessonId} · {p.status.replace("_", " ")}
                    </div>
                    <ProgressBar value={p.progressPercent} size="sm" className="mt-1" />
                  </div>
                  <div className="text-xs text-slate-400 text-right">
                    <div>{p.timeSpentMinutes}m</div>
                    {p.score && <div className="text-emerald-600 font-semibold">{Math.round(p.score)}%</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
