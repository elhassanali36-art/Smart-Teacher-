"use client";
import { api } from "@/lib/api";
import { useEffect, useState, useCallback, useRef } from "react";
import { useAuthStore } from "@/store/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ArrowLeft, BookOpen, Clock, Zap, Brain,
  CheckCircle, ChevronRight, Volume2, HelpCircle,
  RotateCcw, XCircle,
} from "lucide-react";

interface LessonData {
  id: number;
  title: string;
  description: string;
  content: string;
  subjectName: string;
  subjectEmoji: string;
  subjectColor: string;
  durationMinutes: number;
  xpReward: number;
  difficulty: string;
  stage: string;
  grade: number;
}

interface QuestionData {
  id: number;
  text: string;
  type: string;
  options: string[];
  explanation: string;
  hints: string[];
  xpReward: number;
}

interface ProgressData {
  status: string;
  progressPercent: number;
  timeSpentMinutes: number;
  score?: number;
}

type Phase = "intro" | "learn" | "quiz" | "complete";

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { studentProfile } = useAuthStore();

  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [questionList, setQuestionList] = useState<QuestionData[]>([]);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  const [phase, setPhase] = useState<Phase>("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [serverFeedback, setServerFeedback] = useState<{ correct: boolean; explanation: string; correctAnswer: string } | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizScore, setQuizScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  const startTimeRef = useRef<number>(Date.now());

  // ── Fetch lesson ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (id) fetchLesson();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchLesson() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (studentProfile) params.set("studentId", studentProfile.id.toString());
      const res = await api(`/api/lessons/${id}?${params}`);
      if (!res.ok) {
        toast.error("Lesson not found");
        router.push("/dashboard/lessons");
        return;
      }
      const data = await res.json();
      setLesson(data.lesson);
      setQuestionList(data.questions ?? []);
      setProgress(data.progress ?? null);
      if (data.progress?.status === "in_progress") setPhase("learn");
    } catch {
      toast.error("Failed to load lesson");
    } finally {
      setLoading(false);
    }
  }

  // ── Progress update ───────────────────────────────────────────────────────
  const saveProgress = useCallback(
    async (status: string, pct: number, score?: number) => {
      if (!studentProfile || !lesson) return;
      const minutes = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 60_000));
      await api("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: studentProfile.id,
          lessonId: lesson.id,
          status,
          progressPercent: pct,
          timeSpentMinutes: minutes,
          score,
        }),
      });
    },
    [studentProfile, lesson]
  );

  // ── Phases ────────────────────────────────────────────────────────────────
  async function startLesson() {
    setPhase("learn");
    startTimeRef.current = Date.now();
    await saveProgress("in_progress", 10);
  }

  async function startQuiz() {
    if (questionList.length === 0) {
      await finishLesson(100);
      return;
    }
    setPhase("quiz");
    setCurrentQ(0);
    setSelectedAnswer("");
    setSubmitted(false);
    setIsCorrect(null);
    setServerFeedback(null);
    setQuizAnswers({});
    setQuizScore(0);
    await saveProgress("in_progress", 60);
  }

  async function submitAnswer() {
    if (!selectedAnswer || submittingQuiz) return;
    setSubmittingQuiz(true);

    const q = questionList[currentQ];
    const newAnswers = { ...quizAnswers, [q.id.toString()]: selectedAnswer };
    setQuizAnswers(newAnswers);

    try {
      // Server-side evaluation
      const res = await api("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: studentProfile?.id,
          answers: { [q.id.toString()]: selectedAnswer },
          questionIds: [q.id],
        }),
      });
      const data = await res.json();
      const fb = data.feedback?.[q.id.toString()];
      if (fb) {
        setServerFeedback(fb);
        setIsCorrect(fb.correct);
        if (fb.correct) setQuizScore((s) => s + 1);
      }
    } catch {
      // Fallback: mark as answered
      setIsCorrect(null);
    }

    setSubmitted(true);
    setSubmittingQuiz(false);
  }

  function nextQuestion() {
    if (currentQ < questionList.length - 1) {
      setCurrentQ((c) => c + 1);
      setSelectedAnswer("");
      setSubmitted(false);
      setIsCorrect(null);
      setServerFeedback(null);
      setShowHint(false);
    } else {
      const finalScore = Math.round(((quizScore + (isCorrect ? 1 : 0)) / questionList.length) * 100);
      finishLesson(finalScore);
    }
  }

  async function finishLesson(finalScore: number) {
    setPhase("complete");
    await saveProgress("completed", 100, finalScore);
    toast.success(`🎉 Lesson complete! +${lesson?.xpReward ?? 0} XP earned!`);
  }

  // ── TTS ───────────────────────────────────────────────────────────────────
  function speak(text: string) {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text.replace(/[#*`]/g, ""));
      utt.rate = 0.9;
      window.speechSynthesis.speak(utt);
    }
  }

  // ── Markdown renderer ─────────────────────────────────────────────────────
  function renderMd(md: string) {
    return md.split("\n").map((line, i) => {
      if (line.startsWith("# ")) return <h1 key={i} className="text-2xl font-extrabold text-slate-800 mt-4 mb-2">{line.slice(2)}</h1>;
      if (line.startsWith("## ")) return <h2 key={i} className="text-lg font-bold text-slate-800 mt-4 mb-1.5">{line.slice(3)}</h2>;
      if (line.startsWith("### ")) return <h3 key={i} className="text-base font-bold text-slate-700 mt-3 mb-1">{line.slice(4)}</h3>;
      if (line.startsWith("- ")) return <li key={i} className="text-slate-700 ml-5 mb-1 list-disc">{line.slice(2)}</li>;
      if (line.startsWith("|")) return <p key={i} className="font-mono text-sm text-slate-700 bg-slate-50 px-2 py-0.5 rounded">{line}</p>;
      if (line.trim() === "") return <div key={i} className="h-2" />;
      // bold inline
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} className="text-slate-700 leading-relaxed">
          {parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}
        </p>
      );
    });
  }

  const diffVariant: Record<string, "success" | "info" | "warning" | "danger"> = {
    beginner: "success", elementary: "info", intermediate: "warning", advanced: "danger", expert: "danger",
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
          <div className="h-8 bg-white rounded-xl w-32" />
          <div className="h-40 bg-white rounded-2xl" />
          <div className="h-64 bg-white rounded-2xl" />
        </div>
      </DashboardLayout>
    );
  }
  if (!lesson) return null;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Back */}
        <Link href="/dashboard/lessons" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors">
          <ArrowLeft size={16} /> Back to Lessons
        </Link>

        {/* Header banner */}
        <div className="rounded-2xl p-6 text-white relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${lesson.subjectColor ?? "#6366f1"}, ${lesson.subjectColor ?? "#6366f1"}99)` }}>
          <div className="absolute right-4 top-4 text-6xl opacity-20 select-none">{lesson.subjectEmoji}</div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-white/80 text-sm font-medium">{lesson.subjectName}</span>
              <span className="text-white/40">·</span>
              <Badge variant="outline" size="sm" className="text-white/80 border-white/30 bg-white/10">
                {lesson.difficulty}
              </Badge>
              <Badge variant="outline" size="sm" className="text-white/80 border-white/30 bg-white/10">
                Grade {lesson.grade}
              </Badge>
            </div>
            <h1 className="text-2xl font-extrabold mb-2 leading-tight">{lesson.title}</h1>
            <p className="text-white/80 text-sm">{lesson.description}</p>
            <div className="flex items-center gap-5 mt-4 text-sm text-white/80">
              <span className="flex items-center gap-1.5"><Clock size={14} />{lesson.durationMinutes} min</span>
              <span className="flex items-center gap-1.5"><Zap size={14} />+{lesson.xpReward} XP</span>
              <span className="flex items-center gap-1.5"><BookOpen size={14} />{questionList.length} questions</span>
            </div>
          </div>
        </div>

        {/* ── INTRO ── */}
        {phase === "intro" && (
          <Card padding="lg">
            <div className="text-center">
              <div className="text-6xl mb-4">{lesson.subjectEmoji}</div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Ready to Learn?</h2>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">{lesson.description}</p>
              {progress?.status === "completed" && (
                <div className="mb-5 flex items-center justify-center gap-2 text-emerald-600 font-semibold text-sm">
                  <CheckCircle size={16} /> You&apos;ve completed this lesson before — great for revision!
                </div>
              )}
              <div className="flex justify-center gap-4 flex-wrap">
                <button onClick={startLesson}
                  className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold px-8 py-3 rounded-xl hover:from-indigo-600 hover:to-violet-700 transition-all shadow-lg">
                  Start Lesson <ChevronRight size={18} />
                </button>
                <button onClick={() => speak(lesson.description)}
                  className="flex items-center gap-2 bg-slate-100 text-slate-700 font-semibold px-5 py-3 rounded-xl hover:bg-slate-200 transition-colors">
                  <Volume2 size={18} /> Listen
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* ── LEARN ── */}
        {phase === "learn" && (
          <div className="space-y-4">
            <Card padding="lg">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                  <BookOpen size={18} className="text-indigo-500" /> Lesson Content
                </h2>
                <button onClick={() => speak(lesson.content ?? lesson.title)}
                  className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors">
                  <Volume2 size={16} /> Read Aloud
                </button>
              </div>
              <div className="space-y-1.5 max-w-none">
                {lesson.content ? renderMd(lesson.content) : <p className="text-slate-400 text-center py-12">Content coming soon…</p>}
              </div>
            </Card>

            <div className="flex justify-between items-center">
              <button onClick={() => setPhase("intro")}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium">
                <ArrowLeft size={16} /> Back
              </button>
              <button onClick={startQuiz}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg">
                {questionList.length > 0 ? "Take Quiz" : "Complete Lesson"}
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ── QUIZ ── */}
        {phase === "quiz" && questionList.length > 0 && (
          <div className="space-y-4">
            {/* Quiz progress bar */}
            <Card padding="sm">
              <div className="flex justify-between text-sm font-semibold text-slate-600 mb-2">
                <span>Question {currentQ + 1} of {questionList.length}</span>
                <span className="text-amber-600">{quizScore} correct so far</span>
              </div>
              <ProgressBar value={currentQ} max={questionList.length} />
            </Card>

            {/* Question */}
            <Card padding="lg">
              <div className="flex items-start justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold text-slate-800 leading-relaxed flex-1">
                  {questionList[currentQ].text}
                </h2>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => speak(questionList[currentQ].text)}
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors" title="Read aloud">
                    <Volume2 size={18} />
                  </button>
                  {questionList[currentQ].hints?.length > 0 && (
                    <button onClick={() => setShowHint(!showHint)}
                      className="p-2 rounded-xl hover:bg-amber-50 text-amber-500 transition-colors" title="Hint">
                      <HelpCircle size={18} />
                    </button>
                  )}
                </div>
              </div>

              {showHint && questionList[currentQ].hints?.[0] && (
                <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700 flex items-start gap-2">
                  <span>💡</span>
                  <span><strong>Hint:</strong> {questionList[currentQ].hints[0]}</span>
                </div>
              )}

              {/* Multiple choice options */}
              <div className="space-y-3">
                {questionList[currentQ].options?.map((option, i) => {
                  let cls = "border-slate-200 hover:border-indigo-200 text-slate-700 hover:bg-indigo-50/50";
                  if (submitted) {
                    if (serverFeedback && option === serverFeedback.correctAnswer) {
                      cls = "border-emerald-500 bg-emerald-50 text-emerald-800";
                    } else if (option === selectedAnswer && serverFeedback && !serverFeedback.correct) {
                      cls = "border-red-400 bg-red-50 text-red-700";
                    } else {
                      cls = "border-slate-200 text-slate-500 opacity-60";
                    }
                  } else if (selectedAnswer === option) {
                    cls = "border-indigo-500 bg-indigo-50 text-indigo-800";
                  }
                  return (
                    <button key={i} onClick={() => !submitted && setSelectedAnswer(option)} disabled={submitted}
                      className={`w-full text-left p-4 rounded-xl border-2 font-medium text-sm transition-all ${cls}`}>
                      <span className="font-bold mr-3 text-slate-400">{["A", "B", "C", "D"][i]}.</span>
                      {option}
                    </button>
                  );
                })}
              </div>

              {/* Feedback */}
              {submitted && serverFeedback && (
                <div className={`mt-4 p-4 rounded-xl border ${serverFeedback.correct ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
                  <div className={`font-bold mb-1 flex items-center gap-2 ${serverFeedback.correct ? "text-emerald-700" : "text-red-700"}`}>
                    {serverFeedback.correct ? <><CheckCircle size={16} /> Correct! Well done!</> : <><XCircle size={16} /> Not quite right.</>}
                  </div>
                  {!serverFeedback.correct && (
                    <p className="text-sm text-slate-600 mb-1">Correct answer: <strong>{serverFeedback.correctAnswer}</strong></p>
                  )}
                  <p className="text-sm text-slate-600">{serverFeedback.explanation}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end mt-5">
                {!submitted ? (
                  <button onClick={submitAnswer} disabled={!selectedAnswer || submittingQuiz}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold px-6 py-3 rounded-xl disabled:opacity-50 hover:from-indigo-600 hover:to-violet-700 transition-all shadow-md">
                    {submittingQuiz ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Checking…</> : "Submit Answer"}
                  </button>
                ) : (
                  <button onClick={nextQuestion}
                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all shadow-md">
                    {currentQ < questionList.length - 1 ? "Next Question" : "Finish Lesson"}
                    <ChevronRight size={18} />
                  </button>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* ── COMPLETE ── */}
        {phase === "complete" && (
          <Card padding="lg" className="text-center">
            <div className="text-7xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Lesson Complete!</h2>
            <p className="text-slate-500 mb-8">Excellent work! You&apos;ve finished this lesson.</p>

            <div className="grid grid-cols-3 gap-4 mb-8 max-w-xs mx-auto">
              <div className="bg-amber-50 rounded-xl p-4">
                <div className="text-2xl font-extrabold text-amber-600">+{lesson.xpReward}</div>
                <div className="text-xs text-amber-500 mt-1">XP Earned</div>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4">
                <div className="text-2xl font-extrabold text-emerald-600">
                  {questionList.length > 0 ? `${Math.round((quizScore / questionList.length) * 100)}%` : "100%"}
                </div>
                <div className="text-xs text-emerald-500 mt-1">Score</div>
              </div>
              <div className="bg-indigo-50 rounded-xl p-4">
                <div className="text-2xl">⭐</div>
                <div className="text-xs text-indigo-500 mt-1">Earned!</div>
              </div>
            </div>

            <div className="flex justify-center gap-3 flex-wrap">
              <Link href="/dashboard/lessons"
                className="flex items-center gap-2 bg-slate-100 text-slate-700 font-semibold px-5 py-3 rounded-xl hover:bg-slate-200 transition-colors">
                More Lessons
              </Link>
              <Link href="/dashboard/ai-tutor"
                className="flex items-center gap-2 bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-bold px-5 py-3 rounded-xl hover:opacity-90 transition-all">
                <Brain size={18} /> Ask AI Tutor
              </Link>
              <button onClick={() => { setPhase("intro"); setQuizScore(0); setCurrentQ(0); }}
                className="flex items-center gap-2 bg-indigo-50 text-indigo-700 font-semibold px-4 py-3 rounded-xl hover:bg-indigo-100 transition-colors">
                <RotateCcw size={16} /> Redo
              </button>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
