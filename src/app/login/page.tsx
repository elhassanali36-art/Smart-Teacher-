"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import toast from "react-hot-toast";
import { GraduationCap, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { loginSuccess } = useAuthStore();
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Invalid email or password");
        setLoading(false);
        return;
      }
      // Store token in localStorage + load profile (works in iframes!)
      await loginSuccess(data.token);
      toast.success(`Welcome back, ${data.user.firstName}! 🎉`);
      router.push("/dashboard");
    } catch {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const demos = [
    { label: "Admin",   email: "admin@edulearn.ai",   pw: "admin123",   icon: "🛡️",
      color: "bg-violet-100 text-violet-800 hover:bg-violet-200 border border-violet-200" },
    { label: "Student", email: "student@edulearn.ai", pw: "student123", icon: "🎓",
      color: "bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-200" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
              <GraduationCap size={32} className="text-white" />
            </div>
            <span className="text-2xl font-extrabold text-slate-800">EduLearn AI</span>
          </Link>
          <p className="text-slate-500 mt-2 text-sm">Sign in to continue learning</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com" required autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold text-base hover:from-indigo-600 hover:to-violet-700 transition-all shadow-lg disabled:opacity-60 flex items-center justify-center gap-2">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in…</>
                : "Sign In →"}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-400 mb-3 text-center uppercase tracking-wide">Demo Accounts</p>
            <div className="grid grid-cols-2 gap-2">
              {demos.map(d => (
                <button key={d.label} type="button"
                  onClick={() => { setEmail(d.email); setPassword(d.pw); }}
                  className={`${d.color} rounded-xl px-3 py-3 text-left transition-colors`}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span>{d.icon}</span>
                    <span className="font-bold text-sm">{d.label}</span>
                  </div>
                  <div className="text-[11px] opacity-70 truncate">{d.email}</div>
                  <div className="text-[11px] opacity-60">pw: {d.pw}</div>
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-slate-500 mt-5">
            New student?{" "}
            <Link href="/register" className="text-indigo-600 font-semibold hover:text-indigo-700">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
