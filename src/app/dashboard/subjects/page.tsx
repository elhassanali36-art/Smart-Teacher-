"use client";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import toast from "react-hot-toast";
import { Globe, Plus, Edit, Search } from "lucide-react";

interface Subject {
  id: number;
  name: string;
  nameAr?: string;
  slug: string;
  description?: string;
  iconEmoji: string;
  color: string;
  stages: string[];
  isActive: boolean;
  sortOrder: number;
}

export default function SubjectsPage() {
  const { user } = useAuthStore();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "", nameAr: "", slug: "", description: "",
    iconEmoji: "📚", color: "#6366f1",
    stages: ["primary", "middle", "high"], sortOrder: 0,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  async function fetchSubjects() {
    setLoading(true);
    try {
      const res = await api("/api/subjects");
      const data = await res.json();
      setSubjects(data.subjects || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to create subject");
        return;
      }
      toast.success("Subject created!");
      setShowModal(false);
      fetchSubjects();
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const filtered = subjects.filter(s =>
    !search ||
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.slug.toLowerCase().includes(search.toLowerCase())
  );

  const stageColors: Record<string, string> = {
    kindergarten: "bg-amber-100 text-amber-700",
    primary: "bg-emerald-100 text-emerald-700",
    middle: "bg-indigo-100 text-indigo-700",
    high: "bg-blue-100 text-blue-700",
  };

  return (
    <DashboardLayout requiredRole="admin">
      <div className="max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
              <Globe size={26} className="text-teal-500" />
              Subjects
            </h1>
            <p className="text-slate-500 mt-1 text-sm">{filtered.length} subjects configured</p>
          </div>
          {(user?.role === "admin" || user?.role === "teacher") && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-teal-500 text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-teal-600 transition-colors"
            >
              <Plus size={16} /> Add Subject
            </button>
          )}
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search subjects..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filtered.map(subject => (
              <Card key={subject.id} hover padding="md">
                <div className="flex items-start gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: `${subject.color}20`, border: `2px solid ${subject.color}40` }}
                  >
                    {subject.iconEmoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800 truncate">{subject.name}</div>
                    {subject.nameAr && (
                      <div className="text-sm text-slate-500" dir="rtl">{subject.nameAr}</div>
                    )}
                    <div className="text-xs text-slate-400 mt-1 truncate">{subject.description}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {(subject.stages as string[]).map(stage => (
                    <span
                      key={stage}
                      className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${stageColors[stage] || "bg-slate-100 text-slate-600"}`}
                    >
                      {stage}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Add Subject Modal */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Subject">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Name (English)</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                  placeholder="Mathematics"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Name (Arabic)</label>
                <input
                  value={form.nameAr}
                  onChange={e => setForm(f => ({ ...f, nameAr: e.target.value }))}
                  placeholder="الرياضيات"
                  dir="rtl"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Slug (URL)</label>
              <input
                value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                required
                placeholder="mathematics"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Emoji Icon</label>
                <input
                  value={form.iconEmoji}
                  onChange={e => setForm(f => ({ ...f, iconEmoji: e.target.value }))}
                  placeholder="📚"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Color</label>
                <input
                  type="color"
                  value={form.color}
                  onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                  className="w-full h-10 rounded-xl border border-slate-200 cursor-pointer"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Educational Stages</label>
              <div className="flex flex-wrap gap-2">
                {["kindergarten", "primary", "middle", "high"].map(stage => (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => {
                      const stages = form.stages.includes(stage)
                        ? form.stages.filter(s => s !== stage)
                        : [...form.stages, stage];
                      setForm(f => ({ ...f, stages }));
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                      form.stages.includes(stage)
                        ? "bg-teal-500 text-white"
                        : "bg-teal-50 text-teal-700 hover:bg-teal-100"
                    }`}
                  >
                    {stage}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? "Saving..." : "Create Subject"}
            </button>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
