"use client";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import toast from "react-hot-toast";
import { Crown, Star, Shield, Zap } from "lucide-react";

interface Sub {
  id: number; plan: string; status: string; aiAvatarEnabled: boolean;
  currentPeriodEnd?: string;
}

const PLANS = [
  {
    id:      "monthly" as const,
    label:   "Monthly",
    price:   "$100",
    period:  "/month",
    subtext: "Billed monthly · Cancel anytime",
    badge:   "",
    saving:  "",
    btn:     "Subscribe Monthly",
    style:   "border-slate-200 bg-white hover:border-indigo-300",
    btnStyle:"bg-indigo-500 hover:bg-indigo-600",
  },
  {
    id:      "yearly" as const,
    label:   "Yearly",
    price:   "$1000",
    period:  "/year",
    subtext: "Save $200 vs monthly billing",
    badge:   "BEST VALUE",
    saving:  "2 months free",
    btn:     "Subscribe Yearly 👑",
    style:   "border-amber-400 bg-gradient-to-br from-amber-50 to-yellow-50",
    btnStyle:"bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 shadow-lg",
  },
];

const FEATURES = [
  { icon: "🤖", title: "AI Human Tutors",       desc: "4 lifelike AI tutors — Ms. Sarah, Mr. James, Dr. Aisha, Prof. Omar" },
  { icon: "🎨", title: "Cartoon Avatars",        desc: "6 fun cartoon characters for kindergarten students" },
  { icon: "🎓", title: "British Curriculum",     desc: "Full K-12 curriculum — EYFS through GCSE" },
  { icon: "🧠", title: "Smart AI Teaching",      desc: "AI that explains, questions, evaluates and adapts — 24/7" },
  { icon: "📊", title: "Advanced Analytics",     desc: "Detailed progress reports and learning insights" },
  { icon: "🔒", title: "Full Admin Control",     desc: "Manage students, content, permissions and settings" },
];

export default function SubscriptionPage() {
  const { refresh } = useAuthStore();
  const [sub,     setSub]     = useState<Sub | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy,    setBusy]    = useState(false);

  useEffect(() => { fetchSub(); }, []);

  async function fetchSub() {
    try {
      const r = await api("/api/subscription");
      const d = await r.json();
      setSub(d.subscription ?? null);
    } catch { /* ignore */ } finally { setLoading(false); }
  }

  async function subscribe(plan: "monthly" | "yearly") {
    setBusy(true);
    try {
      const r = await api("/api/subscription", {
        method: "POST",
        body: JSON.stringify({ plan }),
      });
      const d = await r.json();
      if (!r.ok) { toast.error(d.error || "Failed"); return; }
      toast.success(`🎉 ${plan === "yearly" ? "Yearly ($1000)" : "Monthly ($100)"} plan activated!`);
      await refresh();
      fetchSub();
    } catch { toast.error("Payment failed"); } finally { setBusy(false); }
  }

  async function cancel() {
    if (!confirm("Are you sure you want to cancel your subscription?")) return;
    setBusy(true);
    try {
      await api("/api/subscription", { method: "DELETE" });
      toast("Subscription cancelled.");
      await refresh();
      fetchSub();
    } catch { toast.error("Failed"); } finally { setBusy(false); }
  }

  const isActive = sub?.status === "active";

  return (
    <DashboardLayout requiredRole="admin">
      <div className="max-w-4xl space-y-6">

        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <Crown size={26} className="text-amber-500" /> Subscription Management
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Platform access requires an active subscription — $100/month or $1000/year
          </p>
        </div>

        {/* Current Status */}
        {loading ? (
          <div className="h-28 bg-white rounded-2xl animate-pulse" />
        ) : (
          <div className={`rounded-2xl p-6 border-2 ${isActive ? "border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50" : "border-red-200 bg-red-50"}`}>
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${isActive ? "bg-amber-100" : "bg-red-100"}`}>
                {isActive ? "👑" : "🔒"}
              </div>
              <div className="flex-1">
                <div className="font-bold text-slate-800 text-lg">
                  {isActive
                    ? `Subscription Active — ${sub?.plan === "yearly" ? "Yearly ($1000/yr)" : "Monthly ($100/mo)"}`
                    : "No Active Subscription"}
                </div>
                <div className="text-sm text-slate-500 mt-0.5">
                  {isActive && sub?.currentPeriodEnd
                    ? `Renews on ${new Date(sub.currentPeriodEnd).toLocaleDateString()}`
                    : "Subscribe to unlock the full platform for your students"}
                </div>
                {isActive && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">✓ All Features Unlocked</span>
                    <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">✓ AI Human Tutors</span>
                  </div>
                )}
              </div>
              {isActive && (
                <button onClick={cancel} disabled={busy}
                  className="text-sm text-red-500 hover:text-red-700 font-semibold px-4 py-2 rounded-xl hover:bg-red-50 transition-colors flex-shrink-0">
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}

        {/* Plans */}
        {!isActive && !loading && (
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-4">Subscription Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PLANS.map(plan => (
                <div key={plan.id} className={`border-2 ${plan.style} rounded-2xl p-6 relative`}>
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-extrabold px-4 py-1 rounded-full whitespace-nowrap">
                      {plan.badge}
                    </div>
                  )}
                  <div className="font-bold text-slate-800 text-lg mb-1">{plan.label}</div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                    <span className="text-sm text-slate-400">{plan.period}</span>
                  </div>
                  {plan.saving && (
                    <div className="text-xs font-bold text-emerald-600 mb-1">{plan.saving}</div>
                  )}
                  <div className="text-sm text-slate-500 mb-5">{plan.subtext}</div>
                  <button
                    onClick={() => subscribe(plan.id)}
                    disabled={busy}
                    className={`w-full py-3 ${plan.btnStyle} text-white font-bold rounded-xl disabled:opacity-50 transition-all`}>
                    {busy ? "Processing…" : plan.btn}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Included */}
        <Card padding="md">
          <h2 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
            <Star size={18} className="text-amber-500" /> Everything included
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FEATURES.map(f => (
              <div key={f.title} className="flex gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="text-2xl flex-shrink-0">{f.icon}</div>
                <div>
                  <div className="font-semibold text-slate-800 text-sm">{f.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Safety */}
        <Card padding="md" className="bg-emerald-50 border-emerald-100">
          <div className="flex gap-4">
            <Shield size={24} className="text-emerald-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-emerald-800 mb-2">Child Safety &amp; Privacy</div>
              <div className="text-sm text-emerald-700 space-y-1">
                <p>✓ All AI tutors are child-safe and age-appropriate</p>
                <p>✓ No personal data sold to third parties</p>
                <p>✓ Full admin control over camera and microphone</p>
                <p>✓ Secure, encrypted data storage</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
