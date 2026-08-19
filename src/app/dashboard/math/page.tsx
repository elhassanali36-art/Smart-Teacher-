"use client";
import { api } from "@/lib/api";
import { useState } from "react";
import { useAuthStore } from "@/store/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import toast from "react-hot-toast";
import { Calculator, Send, ChevronRight, Lightbulb, CheckCircle, RotateCcw, BookOpen, Target } from "lucide-react";

interface Step {
  step: number;
  description: string;
  hint: string;
  completed: boolean;
}

interface MathSession {
  problem: string;
  steps: string[];
  explanation: string;
  currentStep: number;
  studentAnswers: string[];
  completed: boolean;
}

const sampleProblems = [
  { label: "Addition", problem: "What is 25 + 47?", grade: 2 },
  { label: "Multiplication", problem: "Calculate 6 × 8", grade: 3 },
  { label: "Fractions", problem: "What is 3/4 + 1/2?", grade: 4 },
  { label: "Algebra", problem: "Solve for x: 2x + 5 = 13", grade: 7 },
  { label: "Geometry", problem: "Find the area of a triangle with base 8 and height 6", grade: 6 },
  { label: "Quadratic", problem: "Solve: x² - 5x + 6 = 0", grade: 10 },
];

export default function MathTutorPage() {
  const { studentProfile } = useAuthStore();
  const [problem, setProblem] = useState("");
  const [session, setSession] = useState<MathSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; isCorrect?: boolean } | null>(null);
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);

  async function analyzeProblem() {
    if (!problem.trim()) return;
    setLoading(true);
    setFeedback(null);

    try {
      const res = await api("/api/ai/math", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem,
          grade: studentProfile?.grade || 5,
        }),
      });
      const data = await res.json();

      if (data.analysis) {
        setSession({
          problem,
          steps: data.analysis.steps || [],
          explanation: data.analysis.explanation || "",
          currentStep: 0,
          studentAnswers: [],
          completed: false,
        });
        setChatMessages([
          { role: "assistant", content: `Great! Let's work through this problem together: **${problem}**\n\n${data.analysis.explanation}` },
        ]);
      }
    } catch (error) {
      toast.error("Failed to analyze problem");
    } finally {
      setLoading(false);
    }
  }

  async function evaluateAnswer() {
    if (!userAnswer.trim() || !session) return;
    setEvaluating(true);

    try {
      const res = await api("/api/ai/math", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem: session.problem,
          grade: studentProfile?.grade || 5,
          studentAnswer: userAnswer,
        }),
      });
      const data = await res.json();

      const response = data.response;
      setFeedback({ message: response.message });
      setChatMessages(prev => [
        ...prev,
        { role: "user", content: `My answer: ${userAnswer}` },
        { role: "assistant", content: response.message },
      ]);

      if (response.isCorrect) {
        setSession(prev => prev ? { ...prev, completed: true } : null);
        toast.success("🎉 Correct! Well done!");
      }
    } catch (error) {
      toast.error("Failed to evaluate answer");
    } finally {
      setEvaluating(false);
      setUserAnswer("");
    }
  }

  function reset() {
    setProblem("");
    setSession(null);
    setFeedback(null);
    setChatMessages([]);
    setUserAnswer("");
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <Calculator size={26} className="text-blue-500" />
            Math Tutor
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Learn mathematics step by step — I guide you through the reasoning, not just the answer!
          </p>
        </div>

        {!session ? (
          <div className="space-y-6">
            {/* Problem Input */}
            <Card padding="lg">
              <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Target size={18} className="text-blue-500" />
                Enter Your Problem
              </h2>
              <div className="flex gap-3">
                <input
                  value={problem}
                  onChange={e => setProblem(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && analyzeProblem()}
                  placeholder="Type your math problem here... e.g., 'Solve 2x + 5 = 13'"
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  onClick={analyzeProblem}
                  disabled={loading || !problem.trim()}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold px-5 py-3 rounded-xl disabled:opacity-50 hover:from-blue-600 hover:to-indigo-700 transition-all"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                  Analyze
                </button>
              </div>
            </Card>

            {/* Sample Problems */}
            <Card padding="md">
              <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <BookOpen size={18} className="text-indigo-500" />
                Try These Problems
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {sampleProblems.map((sp) => (
                  <button
                    key={sp.label}
                    onClick={() => setProblem(sp.problem)}
                    className="text-left p-4 rounded-xl border-2 border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all"
                  >
                    <div className="text-xs font-bold text-blue-600 mb-1">{sp.label} · Grade {sp.grade}</div>
                    <div className="text-sm font-medium text-slate-700">{sp.problem}</div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Math Concepts */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Arithmetic", emoji: "➕", desc: "Add, subtract, multiply, divide" },
                { label: "Algebra", emoji: "🔣", desc: "Variables and equations" },
                { label: "Geometry", emoji: "📐", desc: "Shapes, area, volume" },
                { label: "Statistics", emoji: "📊", desc: "Data analysis" },
              ].map(c => (
                <div key={c.label} className="bg-blue-50 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">{c.emoji}</div>
                  <div className="font-bold text-slate-800 text-sm">{c.label}</div>
                  <div className="text-xs text-slate-500 mt-1">{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Problem Steps */}
            <div className="space-y-4">
              {/* Problem */}
              <Card padding="md">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">Problem</div>
                    <div className="text-xl font-bold text-slate-800">{session.problem}</div>
                  </div>
                  <button
                    onClick={reset}
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    title="New problem"
                  >
                    <RotateCcw size={18} />
                  </button>
                </div>
              </Card>

              {/* Steps */}
              <Card padding="md">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Lightbulb size={16} className="text-amber-500" />
                  Step-by-Step Approach
                </h3>
                <div className="space-y-3">
                  {session.steps.map((step, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Answer Input */}
              {!session.completed && (
                <Card padding="md">
                  <h3 className="font-bold text-slate-800 mb-3">Your Answer</h3>
                  <div className="flex gap-3">
                    <input
                      value={userAnswer}
                      onChange={e => setUserAnswer(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && evaluateAnswer()}
                      placeholder="Type your answer..."
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                      onClick={evaluateAnswer}
                      disabled={evaluating || !userAnswer.trim()}
                      className="flex items-center gap-2 bg-blue-500 text-white font-semibold px-4 py-2.5 rounded-xl disabled:opacity-50 hover:bg-blue-600 transition-colors"
                    >
                      {evaluating ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <ChevronRight size={18} />
                      )}
                      Check
                    </button>
                  </div>
                </Card>
              )}

              {session.completed && (
                <Card padding="md" className="bg-emerald-50 border-emerald-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle size={24} className="text-emerald-500" />
                    <div>
                      <div className="font-bold text-emerald-700">Problem Solved! 🎉</div>
                      <div className="text-sm text-emerald-600">Excellent mathematical thinking!</div>
                    </div>
                  </div>
                  <button onClick={reset} className="mt-3 text-sm text-emerald-700 font-semibold hover:text-emerald-800">
                    Try another problem →
                  </button>
                </Card>
              )}
            </div>

            {/* Right: AI Chat */}
            <Card padding="md" className="flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                  <Calculator size={16} className="text-white" />
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-sm">AI Math Guide</div>
                  <div className="text-xs text-slate-400">Guiding your thinking</div>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto max-h-80 mb-4">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`${msg.role === "user" ? "ml-4" : "mr-4"}`}>
                    <div className={`rounded-xl p-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-indigo-50 text-indigo-800 ml-auto"
                        : "bg-slate-50 text-slate-700 border border-slate-100"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>

              {feedback && (
                <div className={`rounded-xl p-4 text-sm ${
                  feedback.isCorrect !== false
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : "bg-slate-50 border border-slate-200 text-slate-700"
                }`}>
                  {feedback.message}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
