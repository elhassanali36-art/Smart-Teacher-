"use client";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import toast from "react-hot-toast";
import { Star, CheckCircle, XCircle, Zap, Timer, Trophy, RotateCcw, ChevronRight, HelpCircle } from "lucide-react";

interface Question {
  id: number;
  text: string;
  type: string;
  options: string[];
  hints: string[];
  xpReward: number;
  grade: number;
  stage: string;
}

interface QuizResult {
  score: number;
  correct: number;
  total: number;
  passed: boolean;
  xpEarned: number;
  feedback: Record<string, { correct: boolean; explanation: string; correctAnswer: string }>;
}

export default function QuizPage() {
  const { studentProfile } = useAuthStore();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<"setup" | "quiz" | "results">("setup");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [quizConfig, setQuizConfig] = useState({
    questionCount: 5,
    subject: "all",
    timed: false,
    timeLimit: 300,
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (phase === "quiz" && quizConfig.timed && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            submitQuiz();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [phase, quizConfig.timed, timeLeft]);

  async function startQuiz() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: quizConfig.questionCount.toString(),
      });
      if (studentProfile) {
        params.set("stage", studentProfile.stage);
        params.set("grade", studentProfile.grade.toString());
      }

      const res = await api(`/api/quiz?${params}`);
      const data = await res.json();

      if (!data.questions?.length) {
        toast.error("No questions available. Please seed the database first!");
        return;
      }

      setQuestions(data.questions);
      setAnswers({});
      setCurrentQ(0);
      setSelectedAnswer("");
      setResult(null);
      setStartTime(new Date());
      setTimeLeft(quizConfig.timeLimit);
      setPhase("quiz");
    } catch (error) {
      toast.error("Failed to load quiz");
    } finally {
      setLoading(false);
    }
  }

  function selectAnswer(answer: string) {
    setSelectedAnswer(answer);
  }

  function nextQuestion() {
    if (!selectedAnswer) {
      toast.error("Please select an answer!");
      return;
    }

    const newAnswers = { ...answers, [questions[currentQ].id.toString()]: selectedAnswer };
    setAnswers(newAnswers);
    setSelectedAnswer("");
    setShowHint(false);

    if (currentQ < questions.length - 1) {
      setCurrentQ(c => c + 1);
    } else {
      submitQuiz(newAnswers);
    }
  }

  async function submitQuiz(finalAnswers?: Record<string, string>) {
    const answersToSubmit = finalAnswers || { ...answers, [questions[currentQ]?.id?.toString()]: selectedAnswer };
    setLoading(true);
    try {
      const timeTaken = startTime ? Math.round((Date.now() - startTime.getTime()) / 1000) : undefined;
      const questionIds = questions.map(q => q.id);

      const res = await api("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: studentProfile?.id,
          answers: answersToSubmit,
          questionIds,
          timeTakenSeconds: timeTaken,
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);
      setResult(data);
      setPhase("results");

      if (data.passed) {
        toast.success(`🎉 Quiz passed! +${data.xpEarned} XP earned!`);
      } else {
        toast.error("Keep practicing — you'll get it next time!");
      }
    } catch (error) {
      toast.error("Failed to submit quiz");
    } finally {
      setLoading(false);
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <Star size={26} className="text-amber-500" />
            Practice Quiz
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Test your knowledge and earn XP!</p>
        </div>

        {/* Setup Phase */}
        {phase === "setup" && (
          <div className="space-y-6">
            <Card padding="lg">
              <h2 className="font-bold text-slate-800 mb-5">Quiz Settings</h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Number of Questions</label>
                  <div className="flex gap-2">
                    {[3, 5, 10, 15].map(n => (
                      <button
                        key={n}
                        onClick={() => setQuizConfig(c => ({ ...c, questionCount: n }))}
                        className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                          quizConfig.questionCount === n
                            ? "bg-amber-500 text-white"
                            : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Timed Mode</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuizConfig(c => ({ ...c, timed: !c.timed }))}
                      className={`relative w-12 h-6 rounded-full transition-colors ${quizConfig.timed ? "bg-amber-500" : "bg-slate-200"}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${quizConfig.timed ? "left-7" : "left-1"}`} />
                    </button>
                    <span className="text-sm text-slate-600">
                      {quizConfig.timed ? `${quizConfig.timeLimit / 60} minute limit` : "Untimed practice"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-amber-50 rounded-xl">
                <div className="flex items-start gap-3">
                  <Trophy size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-amber-700">Rewards</div>
                    <div className="text-sm text-amber-600 mt-1">
                      Earn up to {quizConfig.questionCount * 10} XP · Passing score: 70%
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={startQuiz}
                disabled={loading}
                className="w-full mt-5 py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold rounded-xl hover:from-amber-500 hover:to-orange-600 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Loading...</>
                ) : (
                  <><Star size={18} />Start Quiz</>
                )}
              </button>
            </Card>
          </div>
        )}

        {/* Quiz Phase */}
        {phase === "quiz" && questions.length > 0 && (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm text-slate-500 mb-1">
                  <span>Question {currentQ + 1} of {questions.length}</span>
                  {quizConfig.timed && (
                    <span className={`flex items-center gap-1 font-semibold ${timeLeft < 30 ? "text-red-500" : "text-slate-600"}`}>
                      <Timer size={14} /> {formatTime(timeLeft)}
                    </span>
                  )}
                </div>
                <ProgressBar value={currentQ} max={questions.length} />
              </div>
            </div>

            {/* Question */}
            <Card padding="lg">
              <div className="flex items-start justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold text-slate-800 leading-relaxed flex-1">
                  {questions[currentQ].text}
                </h2>
                {questions[currentQ].hints?.length > 0 && (
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="p-2 rounded-xl hover:bg-amber-50 text-amber-500 transition-colors flex-shrink-0"
                  >
                    <HelpCircle size={20} />
                  </button>
                )}
              </div>

              {showHint && questions[currentQ].hints?.[0] && (
                <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700">
                  💡 Hint: {questions[currentQ].hints[0]}
                </div>
              )}

              {/* Options */}
              {questions[currentQ].type === "multiple_choice" && (
                <div className="space-y-3">
                  {questions[currentQ].options?.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => selectAnswer(option)}
                      className={`w-full text-left p-4 rounded-xl border-2 font-medium text-sm transition-all ${
                        selectedAnswer === option
                          ? "border-amber-400 bg-amber-50 text-amber-800"
                          : "border-slate-200 hover:border-amber-200 text-slate-700 hover:bg-amber-50/50"
                      }`}
                    >
                      <span className="font-bold mr-3 text-slate-400">{["A", "B", "C", "D"][i]}.</span>
                      {option}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex justify-end mt-6">
                <button
                  onClick={nextQuestion}
                  disabled={!selectedAnswer || loading}
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold px-6 py-3 rounded-xl disabled:opacity-50 hover:from-amber-500 hover:to-orange-600 transition-all shadow-md"
                >
                  {currentQ < questions.length - 1 ? "Next Question" : "Submit Quiz"}
                  <ChevronRight size={18} />
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* Results Phase */}
        {phase === "results" && result && (
          <div className="space-y-6">
            <Card padding="lg" className="text-center">
              <div className={`text-7xl mb-4 ${result.passed ? "" : "grayscale"}`}>
                {result.passed ? "🏆" : "📚"}
              </div>
              <h2 className={`text-3xl font-extrabold mb-2 ${result.passed ? "text-amber-600" : "text-slate-700"}`}>
                {result.passed ? "Quiz Passed!" : "Keep Practicing!"}
              </h2>
              <p className="text-slate-500 mb-6">
                {result.passed
                  ? "Excellent work! You've mastered this material!"
                  : "Don't give up — review the answers and try again!"}
              </p>

              {/* Score */}
              <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-8">
                <div className="bg-amber-50 rounded-xl p-4">
                  <div className="text-3xl font-extrabold text-amber-600">{result.score}%</div>
                  <div className="text-xs text-amber-500 mt-1">Score</div>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4">
                  <div className="text-3xl font-extrabold text-emerald-600">{result.correct}/{result.total}</div>
                  <div className="text-xs text-emerald-500 mt-1">Correct</div>
                </div>
                <div className="bg-indigo-50 rounded-xl p-4">
                  <div className="text-3xl font-extrabold text-indigo-600">+{result.xpEarned}</div>
                  <div className="text-xs text-indigo-500 mt-1">XP Earned</div>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setPhase("setup")}
                  className="flex items-center gap-2 bg-amber-50 text-amber-700 font-semibold px-6 py-3 rounded-xl hover:bg-amber-100 transition-colors"
                >
                  <RotateCcw size={16} /> Try Again
                </button>
                <button
                  onClick={startQuiz}
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold px-6 py-3 rounded-xl hover:from-amber-500 hover:to-orange-600 transition-all shadow-md"
                >
                  <Star size={18} /> New Quiz
                </button>
              </div>
            </Card>

            {/* Answer Review */}
            {result.feedback && Object.keys(result.feedback).length > 0 && (
              <Card padding="md">
                <h3 className="font-bold text-slate-800 mb-4">Answer Review</h3>
                <div className="space-y-3">
                  {questions.map((q, i) => {
                    const fb = result.feedback[q.id.toString()];
                    if (!fb) return null;
                    return (
                      <div key={i} className={`p-4 rounded-xl border ${fb.correct ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
                        <div className="flex items-start gap-2">
                          {fb.correct ? <CheckCircle size={16} className="text-emerald-500 mt-0.5" /> : <XCircle size={16} className="text-red-500 mt-0.5" />}
                          <div className="flex-1">
                            <div className="font-medium text-slate-800 text-sm">{q.text}</div>
                            {!fb.correct && (
                              <div className="text-xs text-slate-500 mt-1">
                                Correct answer: <span className="font-semibold text-emerald-700">{fb.correctAnswer}</span>
                              </div>
                            )}
                            {fb.explanation && (
                              <div className="text-xs text-slate-500 mt-1">{fb.explanation}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
