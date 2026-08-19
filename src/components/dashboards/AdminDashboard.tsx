"use client";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import toast from "react-hot-toast";
import { Users, BookOpen, Globe, Settings, Database, TrendingUp, Zap, CheckCircle, ArrowRight, BarChart2, Crown } from "lucide-react";

interface Analytics { totalUsers:number; totalStudents:number; completedLessons:number; avgScore:number; usersByRole:{role:string;count:number}[]; studentsByStage:{stage:string;count:number}[]; }

export function AdminDashboard() {
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState<Analytics|null>(null);
  const [loading,   setLoading]   = useState(true);
  const [seeding,   setSeeding]   = useState(false);

  useEffect(() => { fetchAnalytics(); }, []);
  async function fetchAnalytics() {
    try {
      const res = await api("/api/analytics?type=overview");
      if (res.ok) setAnalytics(await res.json());
    } catch { /**/ } finally { setLoading(false); }
  }

  async function seed() {
    setSeeding(true);
    try {
      const res = await api("/api/seed", { method:"POST" });
      const d = await res.json();
      if (res.ok) { toast.success("Platform seeded! 🎉"); fetchAnalytics(); }
      else toast.error(d.error || "Seed failed");
    } catch { toast.error("Seed failed"); } finally { setSeeding(false); }
  }

  const roleLabel: Record<string,string> = { admin:"🛡️ Admin", parent:"👨‍👩‍👧 Parent", student:"🎓 Student" };
  const stageLabel: Record<string,string> = { kindergarten:"🌈 Kindergarten", primary:"🌱 Primary", middle:"🚀 Middle", high:"🎯 High" };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="bg-gradient-to-r from-violet-600 to-indigo-700 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute right-6 top-3 text-[80px] opacity-10 leading-none">🛡️</div>
        <div className="relative flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-extrabold mb-1">Admin Dashboard 🛡️</h1>
            <p className="opacity-90 text-sm">Welcome, {user?.firstName}! Full platform control.</p>
          </div>
          <button onClick={seed} disabled={seeding}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
            {seeding ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Seeding…</> : <><Database size={15}/>Seed Data</>}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? [...Array(4)].map((_,i) => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse"/>) : (
          [
            { label:"Total Users",    value:analytics?.totalUsers    || 0, icon:<Users size={18}/>,       color:"text-indigo-500 bg-indigo-50" },
            { label:"Students",       value:analytics?.totalStudents || 0, icon:<TrendingUp size={18}/>,  color:"text-emerald-500 bg-emerald-50" },
            { label:"Lessons Done",   value:analytics?.completedLessons||0,icon:<CheckCircle size={18}/>, color:"text-blue-500 bg-blue-50" },
            { label:"Avg Quiz Score", value:`${analytics?.avgScore   || 0}%`,icon:<Zap size={18}/>,       color:"text-amber-500 bg-amber-50" },
          ].map(s => (
            <Card key={s.label} padding="md">
              <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center mb-3`}>{s.icon}</div>
              <div className="text-2xl font-extrabold text-slate-800">{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </Card>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card padding="md">
          <h2 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Users size={16} className="text-indigo-500"/>Users by Role</h2>
          {analytics?.usersByRole?.length ? analytics.usersByRole.map(r => (
            <div key={r.role} className="flex justify-between py-2 border-b border-slate-50 last:border-0">
              <span className="text-sm text-slate-600">{roleLabel[r.role] || r.role}</span>
              <span className="font-bold text-slate-800">{Number(r.count)}</span>
            </div>
          )) : <div className="text-center py-4 text-slate-400 text-sm">No data yet. <button onClick={seed} className="text-indigo-600 font-semibold">Seed</button></div>}
        </Card>

        <Card padding="md">
          <h2 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><BarChart2 size={16} className="text-violet-500"/>Students by Stage</h2>
          {analytics?.studentsByStage?.length ? analytics.studentsByStage.map(s => (
            <div key={s.stage} className="flex justify-between py-2 border-b border-slate-50 last:border-0">
              <span className="text-sm text-slate-600">{stageLabel[s.stage] || s.stage}</span>
              <span className="font-bold text-slate-800">{Number(s.count)}</span>
            </div>
          )) : <div className="text-center py-4 text-slate-400 text-sm">No students yet</div>}
        </Card>

        <Card padding="md">
          <h2 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Zap size={16} className="text-amber-500"/>Quick Actions</h2>
          <div className="space-y-1.5">
            {[
              { href:"/dashboard/users",    label:"Manage Users",    icon:"👥" },
              { href:"/dashboard/subjects", label:"Manage Subjects", icon:"📚" },
              { href:"/dashboard/lessons",  label:"Manage Lessons",  icon:"📖" },
              { href:"/dashboard/analytics",label:"Analytics",       icon:"📊" },
              { href:"/dashboard/seed",     label:"Seed Data",       icon:"🌱" },
              { href:"/dashboard/settings", label:"Settings",        icon:"⚙️" },
            ].map(a => (
              <Link key={a.href} href={a.href}
                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-sm font-medium transition-colors">
                <span>{a.icon}</span>{a.label}
                <ArrowRight size={11} className="ml-auto text-slate-300"/>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* Management Grid */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { href:"/dashboard/users",    label:"Users",    icon:"👥", color:"from-indigo-400 to-indigo-600" },
          { href:"/dashboard/subjects", label:"Subjects", icon:"🌍", color:"from-violet-400 to-violet-600" },
          { href:"/dashboard/lessons",  label:"Lessons",  icon:"📖", color:"from-blue-400 to-blue-600" },
          { href:"/dashboard/analytics",label:"Analytics",icon:"📊", color:"from-amber-400 to-orange-500" },
          { href:"/dashboard/seed",     label:"Seed",     icon:"🌱", color:"from-emerald-400 to-emerald-600" },
          { href:"/dashboard/settings", label:"Settings", icon:"⚙️", color:"from-slate-400 to-slate-600" },
        ].map(item => (
          <Link key={item.href} href={item.href}
            className={`bg-gradient-to-br ${item.color} text-white rounded-2xl p-4 text-center hover:scale-105 transition-transform`}>
            <div className="text-3xl mb-1.5">{item.icon}</div>
            <div className="font-bold text-xs">{item.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
