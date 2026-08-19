"use client";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import Link from "next/link";
import { BookOpen, Filter, Search, Clock, Zap, Play, CheckCircle, Lock } from "lucide-react";

interface Lesson {
  id: number;
  title: string;
  titleAr?: string;
  description: string;
  subjectName: string;
  subjectEmoji: string;
  subjectColor: string;
  durationMinutes: number;
  xpReward: number;
  difficulty: string;
  stage: string;
  grade: number;
  progress: { status: string; progressPercent: number };
}

interface Subject {
  id: number;
  name: string;
  slug: string;
  iconEmoji: string;
  color: string;
}

export default function LessonsPage() {
  const { studentProfile, user } = useAuthStore();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, [studentProfile]);

  async function fetchData() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (studentProfile) {
        params.set("stage", studentProfile.stage);
        params.set("grade", studentProfile.grade.toString());
        params.set("studentId", studentProfile.id.toString());
      }
      if (selectedSubject) params.set("subjectId", selectedSubject.toString());

      const [lessonsRes, subjectsRes] = await Promise.all([
        api(`/api/lessons?${params}`),
        api(`/api/subjects?stage=${studentProfile?.stage || ""}`),
      ]);
      const lessonsData = await lessonsRes.json();
      const subjectsData = await subjectsRes.json();
      setLessons(lessonsData.lessons || []);
      setSubjects(subjectsData.subjects || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const filteredLessons = lessons.filter(l => {
    const matchSearch = !search || l.title.toLowerCase().includes(search.toLowerCase()) || l.subjectName.toLowerCase().includes(search.toLowerCase());
    const matchDiff = !selectedDifficulty || l.difficulty === selectedDifficulty;
    return matchSearch && matchDiff;
  });

  const difficultyColor: Record<string, string> = {
    beginner: "success",
    elementary: "info",
    intermediate: "warning",
    advanced: "danger",
    expert: "secondary",
  };

  const statusIcon = (status: string) => {
    if (status === "completed") return <CheckCircle size={14} className="text-emerald-500" />;
    if (status === "in_progress") return <Play size={14} className="text-indigo-500" />;
    return <Lock size={14} className="text-slate-300" />;
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
              <BookOpen size={26} className="text-indigo-500" />
              Lessons
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              {studentProfile ? `${filteredLessons.length} lessons for Grade ${studentProfile.grade}` : "Browse all lessons"}
            </p>
          </div>
          {(user?.role === "admin" || user?.role === "teacher") && (
            <Link
              href="/dashboard/lessons/create"
              className="flex items-center gap-2 bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-indigo-600 transition-colors"
            >
              + New Lesson
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search lessons..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <select
            value={selectedDifficulty}
            onChange={e => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          >
            <option value="">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="elementary">Elementary</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Subject Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedSubject(null)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              !selectedSubject ? "bg-indigo-500 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-200"
            }`}
          >
            All Subjects
          </button>
          {subjects.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedSubject(selectedSubject === s.id ? null : s.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                selectedSubject === s.id ? "text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-200"
              }`}
              style={selectedSubject === s.id ? { background: s.color } : {}}
            >
              {s.iconEmoji} {s.name}
            </button>
          ))}
        </div>

        {/* Lessons Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredLessons.length === 0 ? (
          <Card padding="lg" className="text-center">
            <div className="text-5xl mb-4">📚</div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">No lessons found</h3>
            <p className="text-slate-500 text-sm">Try adjusting your filters or check back later</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredLessons.map(lesson => (
              <Link
                key={lesson.id}
                href={`/dashboard/lessons/${lesson.id}`}
                className="group"
              >
                <Card hover padding="md" className="h-full">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
                      style={{ background: `${lesson.subjectColor}20` }}
                    >
                      {lesson.subjectEmoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-slate-800 text-sm leading-tight group-hover:text-indigo-700 transition-colors">
                          {lesson.title}
                        </h3>
                        {statusIcon(lesson.progress.status)}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{lesson.description}</p>

                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock size={12} /> {lesson.durationMinutes}m
                        </span>
                        <span className="text-xs text-amber-600 font-semibold flex items-center gap-1">
                          <Zap size={12} /> +{lesson.xpReward} XP
                        </span>
                        <Badge variant={difficultyColor[lesson.difficulty] as "success" | "info" | "warning" | "danger" | "secondary"} size="sm">
                          {lesson.difficulty}
                        </Badge>
                      </div>

                      {lesson.progress.status === "in_progress" && (
                        <ProgressBar value={lesson.progress.progressPercent} size="sm" className="mt-2" />
                      )}
                      {lesson.progress.status === "completed" && (
                        <div className="mt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1">
                          <CheckCircle size={12} /> Completed
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
