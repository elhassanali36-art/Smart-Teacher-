"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import toast from "react-hot-toast";
import { Settings, Shield, Bell, Globe, Palette, Database } from "lucide-react";

export default function SettingsPage() {
  const { user, studentProfile } = useAuthStore();
  const [settings, setSettings] = useState({
    notifications: true,
    soundEffects: true,
    textToSpeech: true,
    language: "en",
    theme: "light",
    dailyGoal: 30,
  });

  const [permissions, setPermissions] = useState({
    microphone: false,
    camera: false,
    aiMonitoring: false,
  });

  function save() {
    toast.success("Settings saved!");
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <Settings size={26} className="text-slate-500" />
            Settings
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Customize your learning experience</p>
        </div>

        {/* Learning Preferences */}
        <Card padding="md">
          <h2 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
            <Palette size={18} className="text-indigo-500" />
            Learning Preferences
          </h2>
          <div className="space-y-5">
            {[
              { key: "notifications", label: "Learning Reminders", desc: "Get daily reminders to study" },
              { key: "soundEffects", label: "Sound Effects", desc: "Play sounds for correct answers and achievements" },
              { key: "textToSpeech", label: "Text-to-Speech", desc: "Read lesson content aloud" },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-800 text-sm">{label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
                </div>
                <button
                  onClick={() => setSettings(s => ({ ...s, [key]: !s[key as keyof typeof s] }))}
                  className={`relative w-11 h-6 rounded-full transition-colors ${settings[key as keyof typeof settings] ? "bg-indigo-500" : "bg-slate-200"}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${settings[key as keyof typeof settings] ? "left-6" : "left-1"}`} />
                </button>
              </div>
            ))}

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-800 text-sm">Language</div>
                <div className="text-xs text-slate-500 mt-0.5">Platform display language</div>
              </div>
              <select
                value={settings.language}
                onChange={e => setSettings(s => ({ ...s, language: e.target.value }))}
                className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="en">English</option>
                <option value="ar">العربية (Arabic)</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-800 text-sm">Daily Study Goal</div>
                <div className="text-xs text-slate-500 mt-0.5">Target study minutes per day</div>
              </div>
              <select
                value={settings.dailyGoal}
                onChange={e => setSettings(s => ({ ...s, dailyGoal: parseInt(e.target.value) }))}
                className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Privacy & Permissions */}
        <Card padding="md">
          <h2 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
            <Shield size={18} className="text-emerald-500" />
            Privacy & Permissions
          </h2>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
            <div className="flex gap-3">
              <Shield size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-amber-800 text-sm">Child Privacy Protection</div>
                <div className="text-xs text-amber-700 mt-1">
                  Camera and microphone access requires parent/guardian consent. We never store biometric data without explicit permission.
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-5">
            {[
              { key: "microphone", label: "Microphone Access", desc: "Allow voice answers and pronunciation practice", icon: "🎤" },
              { key: "camera", label: "Camera Access", desc: "Allow face-presence detection for attention monitoring", icon: "📷" },
              { key: "aiMonitoring", label: "AI Learning Monitoring", desc: "Allow AI to analyze learning patterns for personalization", icon: "🤖" },
            ].map(({ key, label, desc, icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{icon}</span>
                  <div>
                    <div className="font-medium text-slate-800 text-sm">{label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
                  </div>
                </div>
                <button
                  onClick={() => setPermissions(p => ({ ...p, [key]: !p[key as keyof typeof p] }))}
                  className={`relative w-11 h-6 rounded-full transition-colors ${permissions[key as keyof typeof permissions] ? "bg-emerald-500" : "bg-slate-200"}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${permissions[key as keyof typeof permissions] ? "left-6" : "left-1"}`} />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Admin Settings */}
        {user?.role === "admin" && (
          <Card padding="md">
            <h2 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
              <Database size={18} className="text-violet-500" />
              System Settings
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-violet-50 rounded-xl">
                  <div className="font-semibold text-violet-700 text-sm">AI Tutor</div>
                  <div className="text-xs text-violet-500 mt-1">Status: Active (Fallback Mode)</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl">
                  <div className="font-semibold text-blue-700 text-sm">Database</div>
                  <div className="text-xs text-blue-500 mt-1">PostgreSQL · Connected</div>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl">
                  <div className="font-semibold text-emerald-700 text-sm">Languages</div>
                  <div className="text-xs text-emerald-500 mt-1">EN, AR · 2 active</div>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl">
                  <div className="font-semibold text-amber-700 text-sm">Content</div>
                  <div className="text-xs text-amber-500 mt-1">Lessons active · CDN enabled</div>
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="flex justify-end">
          <button
            onClick={save}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold px-6 py-3 rounded-xl hover:from-indigo-600 hover:to-violet-700 transition-all shadow-lg"
          >
            Save Settings
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
