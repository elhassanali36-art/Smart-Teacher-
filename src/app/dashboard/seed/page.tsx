"use client";
import { api } from "@/lib/api";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import toast from "react-hot-toast";
import { Database, CheckCircle, AlertCircle, Play } from "lucide-react";

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function handleSeed() {
    setLoading(true);
    try {
      const res = await api("/api/seed", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
        toast.success("Database seeded successfully! 🎉");
      } else {
        toast.error(data.error || "Seed failed");
      }
    } catch (err) {
      toast.error("Seed operation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout requiredRole="admin">
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <Database size={26} className="text-violet-500" />
            Database Seeding
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Populate the database with demo data for testing</p>
        </div>

        <Card padding="lg">
          <div className="text-center">
            <div className="text-6xl mb-4">🌱</div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Seed Demo Data</h2>
            <p className="text-slate-500 mb-6">
              This will create sample subjects, lessons, questions, achievements, avatars, and demo user accounts.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
              <div className="flex gap-3">
                <AlertCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-amber-800 text-sm">Warning</div>
                  <div className="text-xs text-amber-700 mt-1">
                    This will clear existing subjects, lessons, and questions. User accounts will not be deleted.
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleSeed}
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-bold rounded-xl hover:from-violet-600 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-lg"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Seeding database...</>
              ) : (
                <><Play size={18} />Run Seed</>
              )}
            </button>
          </div>
        </Card>

        {result && (
          <Card padding="md">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle size={20} className="text-emerald-500" />
              <h2 className="font-bold text-slate-800">Seed Complete!</h2>
            </div>
            <p className="text-slate-600 text-sm mb-4">{result.message}</p>

            {result.accounts && (
              <div>
                <h3 className="font-semibold text-slate-700 mb-3 text-sm">Demo Accounts Created:</h3>
                <div className="space-y-2">
                  {Object.entries(result.accounts).map(([role, creds]: [string, any]) => (
                    <div key={role} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-sm">
                      <div>
                        <span className="font-semibold capitalize text-slate-800">{role}</span>
                        <span className="text-slate-500 ml-2">{creds.email}</span>
                      </div>
                      <code className="text-xs bg-white px-2 py-1 rounded-lg border border-slate-200 text-slate-600">
                        {creds.password}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
