"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import toast from "react-hot-toast";
import { GraduationCap, Mail, Lock, User, Eye, EyeOff, CheckCircle } from "lucide-react";

const STAGES = [
  { value: "kindergarten", label: "🌈 Kindergarten", ages: "Ages 4–6",   grades: "KG" },
  { value: "primary",      label: "🌱 Primary",      ages: "Ages 6–11",  grades: "1–5" },
  { value: "middle",       label: "🚀 Middle School", ages: "Ages 11–14", grades: "6–8" },
  { value: "high",         label: "🎯 High School",   ages: "Ages 14–18", grades: "9–12" },
];

export default function RegisterPage() {
  const { loginSuccess } = useAuthStore();
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "",
    grade: "1", stage: "primary", age: "",
  });
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);

  const up = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role: "student" }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Registration failed");
        setLoading(false);
        return;
      }
      await loginSuccess(data.token);
      toast.success("Account created! Welcome to EduLearn AI 🎉");
      window.location.href = "/dashboard";
    } catch {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
              <GraduationCap size={32} className="text-white" />
            </div>
            <span className="text-2xl font-extrabold text-slate-800">EduLearn AI</span>
          </Link>
          <p className="text-slate-500 mt-2 text-sm">Create your student account — start learning today</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={form.firstName} onChange={e => up("firstName", e.target.value)}
                    placeholder="Sarah" required
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
                <input type="text" value={form.lastName} onChange={e => up("lastName", e.target.value)}
                  placeholder="Smith" required
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" value={form.email} onChange={e => up("email", e.target.value)}
                  placeholder="student@email.com" required autoComplete="email"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type={showPw ? "text" : "password"} value={form.password}
                  onChange={e => up("password", e.target.value)}
                  placeholder="Min 6 characters" required autoComplete="new-password"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Stage */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">My School Stage</label>
              <div className="grid grid-cols-2 gap-2">
                {STAGES.map(s => (
                  <button key={s.value} type="button" onClick={() => up("stage", s.value)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      form.stage === s.value
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-slate-200 bg-white hover:border-indigo-200"
                    }`}>
                    <div className="font-semibold text-slate-800 text-sm">{s.label}</div>
                    <div className="text-xs text-slate-400 mt-0.5">Grade {s.grades} · {s.ages}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Grade + Age */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Grade</label>
                <select value={form.grade} onChange={e => up("grade", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(g => (
                    <option key={g} value={g}>Grade {g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Age (optional)</label>
                <input type="number" value={form.age} onChange={e => up("age", e.target.value)}
                  placeholder="Your age" min="4" max="18"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold hover:from-indigo-600 hover:to-violet-700 transition-all shadow-lg disabled:opacity-60 flex items-center justify-center gap-2">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account…</>
                : <><CheckCircle size={18} />Create My Account</>}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-600 font-semibold hover:text-indigo-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
