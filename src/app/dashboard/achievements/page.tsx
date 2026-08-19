"use client";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { getXPForLevel } from "@/lib/utils";
import { Trophy, Star, Zap, Flame, Lock } from "lucide-react";

interface Achievement {
  id: number;
  name: string;
  nameAr?: string;
  description: string;
  iconEmoji: string;
  category: string;
  xpReward: number;
  earned: boolean;
  earnedAt?: string;
}

export default function AchievementsPage() {
  const { studentProfile } = useAuthStore();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  const xpData = getXPForLevel(studentProfile?.xpPoints || 0);

  useEffect(() => {
    fetchAchievements();
  }, [studentProfile]);

  async function fetchAchievements() {
    setLoading(true);
    try {
      const [achievementsRes, studentRes] = await Promise.all([
        api("/api/achievements"),
        studentProfile ? api(`/api/students/${studentProfile.id}`) : Promise.resolve(null),
      ]);

      const achievementsData = achievementsRes.ok ? await achievementsRes.json() : { achievements: [] };
      const studentData = studentRes?.ok ? await studentRes.json() : { achievements: [] };

      const earnedIds = new Set((studentData.achievements || []).map((a: { id: number }) => a.id));

      // Merge
      const allAchievements = (achievementsData.achievements || []).map((a: Achievement) => ({
        ...a,
        earned: earnedIds.has(a.id),
        earnedAt: studentData.achievements?.find((ea: { id: number; earnedAt: string }) => ea.id === a.id)?.earnedAt,
      }));

      setAchievements(allAchievements);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const earnedCount = achievements.filter(a => a.earned).length;
  const categories = Array.from(new Set(achievements.map(a => a.category)));

  return (
    <DashboardLayout>
      <div className="max-w-5xl space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-extrabold flex items-center gap-2 mb-2">
            <Trophy size={26} />
            Achievements
          </h1>
          <p className="opacity-90">Earn badges by completing lessons, quizzes and challenges!</p>

          <div className="grid grid-cols-3 gap-4 mt-5">
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <div className="font-extrabold text-2xl">{earnedCount}</div>
              <div className="text-xs opacity-80">Earned</div>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <div className="font-extrabold text-2xl">{achievements.length}</div>
              <div className="text-xs opacity-80">Total</div>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <div className="font-extrabold text-2xl">Lvl {xpData.level}</div>
              <div className="text-xs opacity-80">{studentProfile?.xpPoints || 0} XP</div>
            </div>
          </div>
        </div>

        {/* XP Level */}
        <Card padding="md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-amber-500" />
              <span className="font-bold text-slate-800">Level {xpData.level}</span>
            </div>
            <span className="text-sm text-slate-500">{xpData.current}/{xpData.needed} XP</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-700"
              style={{ width: `${xpData.percent}%` }}
            />
          </div>
          <div className="text-xs text-slate-400 mt-2">{xpData.needed - xpData.current} XP to Level {xpData.level + 1}</div>
        </Card>

        {/* Streak */}
        {studentProfile && (
          <Card padding="md" className="bg-orange-50 border-orange-100">
            <div className="flex items-center gap-3">
              <Flame size={24} className="text-orange-500" />
              <div>
                <div className="font-bold text-slate-800 text-lg">{studentProfile.streakDays}-Day Streak!</div>
                <div className="text-sm text-slate-500">Keep learning every day to maintain your streak</div>
              </div>
              <div className="ml-auto flex gap-1">
                {Array.from({ length: 7 }, (_, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      i < (studentProfile.streakDays % 7) ? "bg-orange-400 text-white" : "bg-slate-200 text-slate-400"
                    }`}
                  >
                    {i < (studentProfile.streakDays % 7) ? "🔥" : "○"}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Achievements by Category */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : achievements.length === 0 ? (
          <Card padding="lg" className="text-center">
            <div className="text-5xl mb-3">🏆</div>
            <h3 className="font-bold text-slate-800 mb-2">No achievements yet</h3>
            <p className="text-slate-500 text-sm">Complete lessons and quizzes to earn badges!</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {categories.map(category => {
              const catAchievements = achievements.filter(a => a.category === category);
              return (
                <div key={category}>
                  <h2 className="font-bold text-slate-700 capitalize mb-3 flex items-center gap-2">
                    <Star size={16} className="text-amber-400" />
                    {category.replace("-", " ")}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {catAchievements.map(achievement => (
                      <div
                        key={achievement.id}
                        className={`relative p-4 rounded-2xl border-2 text-center transition-all ${
                          achievement.earned
                            ? "border-amber-300 bg-amber-50"
                            : "border-slate-200 bg-slate-50 opacity-60"
                        }`}
                      >
                        {!achievement.earned && (
                          <div className="absolute top-2 right-2">
                            <Lock size={14} className="text-slate-400" />
                          </div>
                        )}
                        <div className={`text-4xl mb-2 ${!achievement.earned ? "grayscale" : ""}`}>
                          {achievement.iconEmoji}
                        </div>
                        <div className="font-bold text-slate-800 text-sm">{achievement.name}</div>
                        <div className="text-xs text-slate-500 mt-1 leading-relaxed">{achievement.description}</div>
                        <div className={`text-xs font-bold mt-2 flex items-center justify-center gap-1 ${achievement.earned ? "text-amber-600" : "text-slate-400"}`}>
                          <Zap size={10} /> +{achievement.xpReward} XP
                        </div>
                        {achievement.earned && achievement.earnedAt && (
                          <div className="text-xs text-emerald-600 mt-1">
                            Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
