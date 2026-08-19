"use client";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Modal } from "@/components/ui/Modal";
import { getXPForLevel, getStageColor, formatMinutes } from "@/lib/utils";
import Link from "next/link";
import toast from "react-hot-toast";
import { BookOpen, Brain, Trophy, Flame, Zap, Clock, Target, ArrowRight, CheckCircle, Play, Star, Crown, Sparkles } from "lucide-react";

interface Lesson { id:number; title:string; subjectName:string; subjectEmoji:string; subjectColor:string; durationMinutes:number; xpReward:number; difficulty:string; progress:{status:string;progressPercent:number}; }
interface AvatarData { id:number; name:string; nameAr?:string; type:string; emoji?:string; imageUrl?:string; isPremium:boolean; description?:string; voiceTone?:string; }

export function StudentDashboard() {
  const { user, studentProfile, setStudentProfile } = useAuthStore();
  const [lessons,      setLessons]      = useState<Lesson[]>([]);
  const [avatars,      setAvatars]      = useState<AvatarData[]>([]);
  const [achievements, setAchievements] = useState<{name:string;iconEmoji:string}[]>([]);
  const [stats,        setStats]        = useState({ lessonsCompleted:0, avgQuizScore:0 });
  const [loading,      setLoading]      = useState(true);
  const [showAvatar,   setShowAvatar]   = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [parentSub,    setParentSub]    = useState<{aiAvatarEnabled:boolean}|null>(null);

  const xp    = getXPForLevel(studentProfile?.xpPoints || 0);
  const color = getStageColor(studentProfile?.stage || "primary");
  const stage = studentProfile?.stage || "primary";

  useEffect(() => { if (studentProfile) fetchData(); }, [studentProfile]);

  async function fetchData() {
    if (!studentProfile) return;
    setLoading(true);
    try {
      const [lr, sr, avr, subscRes] = await Promise.all([
        api(`/api/lessons?stage=${studentProfile.stage}&studentId=${studentProfile.id}`),
        api(`/api/students/${studentProfile.id}`),
        api(`/api/avatars?stage=${studentProfile.stage}`),
        api("/api/subscription"),
      ]);
      const ld = await lr.json(); const sd = await sr.json();
      const avd = await avr.json(); const subD = await subscRes.json();
      setLessons(ld.lessons || []);
      setStats(sd.stats || {});
      setAchievements(sd.achievements || []);
      setAvatars(avd.avatars || []);
      setParentSub(subD.subscription);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  async function selectAvatar(avatarId: number, isPremium: boolean) {
    if (isPremium && !parentSub?.aiAvatarEnabled) {
      toast.error("This avatar requires a Premium subscription. Ask your parent to upgrade! 👑");
      return;
    }
    setSavingAvatar(true);
    try {
      const res = await api(`/api/students/${studentProfile!.id}`, {
        method:"PATCH", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ selectedAvatarId: avatarId }),
      });
      if (res.ok) {
        setStudentProfile({ ...studentProfile!, selectedAvatarId: avatarId });
        toast.success("Avatar updated! 🎉");
        setShowAvatar(false);
      }
    } catch { toast.error("Failed to update avatar"); } finally { setSavingAvatar(false); }
  }

  const selectedAvatar = avatars.find(a => a.id === studentProfile?.selectedAvatarId);
  const inProgress     = lessons.filter(l => l.progress.status === "in_progress");
  const recommended    = lessons.filter(l => l.progress.status === "not_started").slice(0, 3);
  const isPremiumSub   = parentSub?.aiAvatarEnabled;

  const stageEmoji: Record<string,string> = { kindergarten:"🌈", primary:"🌱", middle:"🚀", high:"🎯" };
  const stageName: Record<string,string>  = { kindergarten:"Kindergarten", primary:"Primary", middle:"Middle School", high:"High School" };

  if (loading) return (
    <div className="space-y-4 max-w-5xl">
      <div className="h-36 bg-white rounded-2xl animate-pulse"/>
      <div className="grid grid-cols-4 gap-3">{[1,2,3,4].map(i=><div key={i} className="h-20 bg-white rounded-2xl animate-pulse"/>)}</div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Hero */}
      <div className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background:`linear-gradient(135deg, ${color}ee, ${color}99)` }}>
        <div className="absolute right-4 top-2 text-[80px] opacity-15 leading-none select-none">{stageEmoji[stage]}</div>
        <div className="relative flex items-start gap-4">
          {/* Avatar button */}
          <button onClick={() => setShowAvatar(true)}
            className="w-16 h-16 rounded-2xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-4xl flex-shrink-0 transition-all border-2 border-white/30 hover:border-white/60 group relative">
            {selectedAvatar ? (selectedAvatar.emoji || (selectedAvatar.type === "ai_human" ? "🧑‍🏫" : "🤖")) : "🤖"}
            <span className="absolute -bottom-1 -right-1 text-xs bg-white/90 text-slate-700 rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✏️</span>
          </button>
          <div className="flex-1">
            <div className="text-sm opacity-80 mb-0.5">{stageName[stage]} · Grade {studentProfile?.grade}</div>
            <h1 className="text-xl md:text-2xl font-extrabold leading-tight">
              {getGreeting()}, {studentProfile?.displayName?.split(" ")[0] || user?.firstName}! 👋
            </h1>
            {studentProfile?.streakDays ? (
              <p className="opacity-90 text-sm mt-1">🔥 {studentProfile.streakDays}-day streak! Keep it up!</p>
            ) : (
              <p className="opacity-80 text-sm mt-1">Start learning today!</p>
            )}
            {selectedAvatar && (
              <div className="mt-2 text-xs opacity-80 bg-white/20 inline-block px-2 py-1 rounded-lg">
                Tutor: <strong>{selectedAvatar.name}</strong>
                {selectedAvatar.isPremium && <span className="ml-1">👑</span>}
              </div>
            )}
          </div>
        </div>

        {/* XP Bar */}
        <div className="mt-5 bg-white/20 rounded-xl p-3">
          <div className="flex justify-between text-xs mb-1.5 font-medium">
            <span>⚡ Level {xp.level}</span>
            <span>{xp.current}/{xp.needed} XP → Level {xp.level+1}</span>
          </div>
          <div className="bg-white/30 rounded-full h-2.5 overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-700" style={{width:`${xp.percent}%`}}/>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label:"Lessons Done",  value:stats.lessonsCompleted,                         icon:<CheckCircle size={18}/>, color:"text-emerald-500 bg-emerald-50" },
          { label:"Day Streak",    value:studentProfile?.streakDays || 0,                icon:<Flame size={18}/>,       color:"text-orange-500 bg-orange-50" },
          { label:"Avg Score",     value:`${stats.avgQuizScore}%`,                        icon:<Target size={18}/>,      color:"text-blue-500 bg-blue-50" },
          { label:"Study Time",    value:formatMinutes(studentProfile?.totalStudyMinutes||0), icon:<Clock size={18}/>,  color:"text-violet-500 bg-violet-50" },
        ].map(s => (
          <Card key={s.label} padding="md" className="text-center">
            <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center mx-auto mb-2`}>{s.icon}</div>
            <div className="text-xl font-extrabold text-slate-800">{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main */}
        <div className="lg:col-span-2 space-y-4">
          {/* Kindergarten special */}
          {stage === "kindergarten" && (
            <Link href="/dashboard/kindergarten">
              <Card hover padding="md" className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">🌈</div>
                  <div>
                    <div className="font-extrabold text-lg">Fun Learning Time!</div>
                    <div className="text-sm opacity-90">Letters · Numbers · Colours · Animals</div>
                    <div className="mt-2 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full inline-block">Start Playing →</div>
                  </div>
                </div>
              </Card>
            </Link>
          )}

          {inProgress.length > 0 && (
            <Card padding="md">
              <h2 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Play size={16} className="text-indigo-500"/> Continue Learning
              </h2>
              <div className="space-y-2">
                {inProgress.map(l => <LessonRow key={l.id} lesson={l}/>)}
              </div>
            </Card>
          )}

          <Card padding="md">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Brain size={16} className="text-violet-500"/> Recommended
              </h2>
              <Link href="/dashboard/lessons" className="text-xs text-indigo-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                All lessons <ArrowRight size={12}/>
              </Link>
            </div>
            {recommended.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🎉</div>
                <p className="text-slate-500 text-sm font-medium">All lessons completed!</p>
              </div>
            ) : (
              <div className="space-y-2">{recommended.map(l => <LessonRow key={l.id} lesson={l}/>)}</div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card padding="md">
            <h2 className="text-sm font-bold text-slate-800 mb-3">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { href:"/dashboard/ai-tutor",    label:"Ask AI Tutor",    icon:"🤖", color:"bg-violet-50 text-violet-700 hover:bg-violet-100" },
                { href:"/dashboard/math",        label:"Maths Practice",  icon:"🔢", color:"bg-blue-50 text-blue-700 hover:bg-blue-100" },
                { href:"/dashboard/quiz",        label:"Take a Quiz",     icon:"⭐", color:"bg-amber-50 text-amber-700 hover:bg-amber-100" },
                { href:"/dashboard/lessons",     label:"Browse Lessons",  icon:"📚", color:"bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
              ].map(a => (
                <Link key={a.href} href={a.href}
                  className={`flex items-center gap-3 p-2.5 rounded-xl ${a.color} transition-colors font-medium text-sm`}>
                  <span className="text-lg">{a.icon}</span>{a.label}
                  <ArrowRight size={12} className="ml-auto"/>
                </Link>
              ))}
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Trophy size={14} className="text-amber-500"/> Achievements
              </h2>
              <Link href="/dashboard/achievements" className="text-xs text-indigo-600 font-semibold">See all</Link>
            </div>
            {achievements.length === 0 ? (
              <div className="text-center py-3">
                <span className="text-2xl">🏆</span>
                <p className="text-xs text-slate-400 mt-1">Complete lessons to earn badges!</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {achievements.slice(0,8).map((a,i) => (
                  <div key={i} className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-xl" title={a.name}>{a.iconEmoji}</div>
                ))}
              </div>
            )}
          </Card>

          {/* Progress */}
          <Card padding="md">
            <h2 className="text-sm font-bold text-slate-800 mb-3">Weekly Goal</h2>
            <div className="space-y-3">
              {[
                { label:"Lessons",     val:stats.lessonsCompleted, max:Math.max(stats.lessonsCompleted, lessons.length, 1), color:"#6366f1" },
                { label:"Streak",      val:Math.min(studentProfile?.streakDays||0,7), max:7, color:"#f97316" },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>{item.label}</span>
                    <span className="font-semibold">{item.val}/{item.max}</span>
                  </div>
                  <ProgressBar value={item.val} max={item.max} size="sm" color={item.color}/>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Avatar Selection Modal */}
      <Modal isOpen={showAvatar} onClose={() => setShowAvatar(false)} title="Choose Your AI Tutor" size="lg">
        <div className="space-y-5">
          {/* Cartoon */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🎨</span>
              <h3 className="font-bold text-slate-700">Cartoon Friends {stage === "kindergarten" && "(Recommended)"}</h3>
              <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">Free</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {avatars.filter(a => !a.isPremium).map(av => (
                <button key={av.id} onClick={() => selectAvatar(av.id, av.isPremium)} disabled={savingAvatar}
                  className={`p-3 rounded-2xl border-2 text-center transition-all hover:scale-105 ${
                    studentProfile?.selectedAvatarId === av.id ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-indigo-200"}`}>
                  <div className="text-4xl mb-1">{av.emoji || "🤖"}</div>
                  <div className="font-semibold text-slate-800 text-sm">{av.name}</div>
                  {av.nameAr && <div className="text-xs text-slate-400" dir="rtl">{av.nameAr}</div>}
                  <div className="text-xs text-slate-500 mt-1 leading-tight">{av.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* AI Human */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Crown size={16} className="text-amber-500"/>
              <h3 className="font-bold text-slate-700">AI Human Tutors</h3>
              <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">Premium</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {avatars.filter(a => a.isPremium).map(av => (
                <button key={av.id} onClick={() => selectAvatar(av.id, av.isPremium)} disabled={savingAvatar || !isPremiumSub}
                  className={`p-3 rounded-2xl border-2 text-center transition-all relative ${
                    !isPremiumSub ? "border-amber-200 bg-amber-50/50 opacity-75 cursor-not-allowed" :
                    studentProfile?.selectedAvatarId === av.id ? "border-amber-500 bg-amber-50" : "border-slate-200 hover:border-amber-300 hover:scale-105"}`}>
                  {!isPremiumSub && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-2xl">
                      <div className="text-center">
                        <Crown size={20} className="text-amber-500 mx-auto mb-1"/>
                        <div className="text-xs font-bold text-amber-700">Premium Only</div>
                      </div>
                    </div>
                  )}
                  <div className="text-4xl mb-1">{av.emoji || "🧑‍🏫"}</div>
                  <div className="font-semibold text-slate-800 text-sm">{av.name}</div>
                  {av.nameAr && <div className="text-xs text-slate-400" dir="rtl">{av.nameAr}</div>}
                  <div className="text-xs text-slate-500 mt-1 leading-tight">{av.description}</div>
                  <div className="text-xs text-amber-600 font-semibold mt-1">👑 AI Human</div>
                </button>
              ))}
            </div>
            {!isPremiumSub && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
                <p className="text-sm text-amber-700 font-medium">Ask your parent to upgrade to Premium to unlock AI Human tutors! 👑</p>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

function LessonRow({ lesson }: { lesson: Lesson }) {
  return (
    <Link href={`/dashboard/lessons/${lesson.id}`}
      className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/40 transition-all group">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background:`${lesson.subjectColor}20` }}>{lesson.subjectEmoji}</div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-slate-800 text-sm truncate">{lesson.title}</div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-slate-400">{lesson.subjectName}</span>
          <span className="text-xs text-amber-600 font-semibold">+{lesson.xpReward} XP</span>
        </div>
        {lesson.progress.status === "in_progress" && (
          <ProgressBar value={lesson.progress.progressPercent} size="sm" className="mt-1.5"/>
        )}
      </div>
      <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-500 flex-shrink-0 transition-colors"/>
    </Link>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}
