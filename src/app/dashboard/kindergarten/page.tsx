"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import toast from "react-hot-toast";
import { Volume2, Star, Heart, Smile, ArrowRight, RotateCcw, CheckCircle } from "lucide-react";

const kgLessons = [
  {
    id: "letters-a",
    title: "Letter A",
    emoji: "🍎",
    letter: "A",
    sound: "Ay",
    word: "Apple",
    color: "from-red-400 to-rose-500",
    bgColor: "bg-red-50",
    description: "Learn the letter A",
    examples: ["🍎 Apple", "🐜 Ant", "✈️ Airplane"],
  },
  {
    id: "letters-b",
    title: "Letter B",
    emoji: "🏀",
    letter: "B",
    sound: "Bee",
    word: "Ball",
    color: "from-blue-400 to-blue-500",
    bgColor: "bg-blue-50",
    description: "Learn the letter B",
    examples: ["🏀 Ball", "🦋 Butterfly", "📚 Book"],
  },
  {
    id: "numbers-1-5",
    title: "Numbers 1-5",
    emoji: "🔢",
    letter: "123",
    sound: "Numbers",
    word: "One to Five",
    color: "from-purple-400 to-violet-500",
    bgColor: "bg-purple-50",
    description: "Count from 1 to 5",
    examples: ["1️⃣ One", "2️⃣ Two", "3️⃣ Three", "4️⃣ Four", "5️⃣ Five"],
  },
  {
    id: "colors",
    title: "Colors",
    emoji: "🎨",
    letter: "🌈",
    sound: "Colors",
    word: "Rainbow",
    color: "from-amber-400 to-orange-500",
    bgColor: "bg-amber-50",
    description: "Learn beautiful colors",
    examples: ["🔴 Red", "🟡 Yellow", "🔵 Blue", "🟢 Green"],
  },
  {
    id: "shapes",
    title: "Shapes",
    emoji: "⭐",
    letter: "△○□",
    sound: "Shapes",
    word: "Circle, Square, Triangle",
    color: "from-green-400 to-emerald-500",
    bgColor: "bg-green-50",
    description: "Learn basic shapes",
    examples: ["⭕ Circle", "⬛ Square", "🔺 Triangle", "⭐ Star"],
  },
  {
    id: "animals",
    title: "Animals",
    emoji: "🐾",
    letter: "🐘",
    sound: "Animals",
    word: "Lion, Cat, Dog",
    color: "from-teal-400 to-cyan-500",
    bgColor: "bg-teal-50",
    description: "Meet friendly animals",
    examples: ["🦁 Lion", "🐱 Cat", "🐶 Dog", "🐘 Elephant"],
  },
];

const avatarEmojis = ["🤖", "🦊", "🐸", "🦄", "🌟", "🐻"];

export default function KindergartenPage() {
  const { studentProfile } = useAuthStore();
  const [selectedLesson, setSelectedLesson] = useState<typeof kgLessons[0] | null>(null);
  const [phase, setPhase] = useState<"menu" | "lesson" | "practice" | "complete">("menu");
  const [selectedAvatar, setSelectedAvatar] = useState("🤖");
  const [avatarTalking, setAvatarTalking] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [stars, setStars] = useState(0);

  function speak(text: string, onDone?: () => void) {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1.3;
      utterance.lang = "en-US";
      setAvatarTalking(true);
      utterance.onend = () => {
        setAvatarTalking(false);
        if (onDone) onDone();
      };
      window.speechSynthesis.speak(utterance);
    }
  }

  function startLesson(lesson: typeof kgLessons[0]) {
    setSelectedLesson(lesson);
    setPhase("lesson");
    setTimeout(() => {
      speak(`Hello! Today we are going to learn about: ${lesson.title}! Are you ready? Let's go!`);
    }, 500);
  }

  function completePractice() {
    setPhase("complete");
    const newCompleted = new Set(completedLessons);
    newCompleted.add(selectedLesson!.id);
    setCompletedLessons(newCompleted);
    setStars(s => s + 3);
    speak("Amazing job! You did it! You are so smart! Great work!");
    toast.success("🌟 Great job! You earned 3 stars!");
  }

  const stageCheck = studentProfile?.stage;
  const isKindergarten = !stageCheck || stageCheck === "kindergarten";

  return (
    <DashboardLayout>
      {phase === "menu" && (
        <div className="max-w-4xl space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-400 to-orange-400 rounded-3xl p-6 text-white relative overflow-hidden">
            <div className="absolute right-0 bottom-0 text-[150px] opacity-10 leading-none">🌈</div>
            <div className="relative">
              <h1 className="text-3xl font-extrabold mb-2">
                🌈 Let's Learn Together!
              </h1>
              <p className="text-white/90 text-lg">Choose what you want to learn today!</p>
              <div className="flex items-center gap-2 mt-3">
                <Star className="text-yellow-200" size={20} />
                <span className="text-white font-bold text-lg">{stars} Stars earned!</span>
              </div>
            </div>
          </div>

          {/* Avatar Picker */}
          <Card padding="md">
            <h2 className="font-bold text-slate-700 mb-3 text-lg">Choose Your Tutor Friend!</h2>
            <div className="flex gap-3 flex-wrap">
              {avatarEmojis.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => setSelectedAvatar(emoji)}
                  className={`text-4xl p-3 rounded-2xl transition-all ${
                    selectedAvatar === emoji
                      ? "bg-amber-100 ring-3 ring-amber-400 scale-110"
                      : "bg-slate-100 hover:bg-slate-200 hover:scale-105"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </Card>

          {/* Lessons Grid */}
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 mb-4">📚 Today's Lessons</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {kgLessons.map(lesson => (
                <button
                  key={lesson.id}
                  onClick={() => startLesson(lesson)}
                  className={`relative ${lesson.bgColor} rounded-3xl p-5 text-left hover:scale-105 transition-transform border-2 ${
                    completedLessons.has(lesson.id) ? "border-emerald-400" : "border-transparent"
                  }`}
                >
                  {completedLessons.has(lesson.id) && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle size={20} className="text-emerald-500" />
                    </div>
                  )}
                  <div className="text-5xl mb-3">{lesson.emoji}</div>
                  <div className="font-extrabold text-slate-800 text-lg">{lesson.title}</div>
                  <div className="text-slate-500 text-sm mt-1">{lesson.description}</div>
                  <div className={`mt-3 inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r ${lesson.color} text-white`}>
                    Let's Go! <ArrowRight size={12} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {phase === "lesson" && selectedLesson && (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Back */}
          <button
            onClick={() => { setPhase("menu"); window.speechSynthesis.cancel(); }}
            className="text-slate-500 hover:text-slate-800 text-sm font-medium flex items-center gap-1"
          >
            ← Back
          </button>

          {/* Avatar + Letter */}
          <div className={`bg-gradient-to-br ${selectedLesson.color} rounded-3xl p-8 text-white text-center relative overflow-hidden`}>
            {/* Avatar */}
            <div className={`text-8xl mb-4 inline-block ${avatarTalking ? "animate-bounce" : ""}`}>
              {selectedAvatar}
            </div>

            {/* Big Letter/Symbol */}
            <div className="text-[120px] font-extrabold leading-none my-4 drop-shadow-lg">
              {selectedLesson.letter.length <= 3 ? selectedLesson.letter : selectedLesson.letter[0]}
            </div>

            {/* Word */}
            <div className="text-4xl font-extrabold mb-2">
              {selectedLesson.word}
            </div>
            <div className="text-xl opacity-80">"{selectedLesson.sound}"</div>

            {/* Speak Button */}
            <button
              onClick={() => speak(`The letter ${selectedLesson.letter} makes the sound: ${selectedLesson.sound}! Like in ${selectedLesson.word}!`)}
              className="mt-6 flex items-center gap-2 bg-white/30 hover:bg-white/40 px-6 py-3 rounded-2xl mx-auto font-bold text-lg transition-all"
            >
              <Volume2 size={24} />
              Hear it Again!
            </button>
          </div>

          {/* Examples */}
          <Card padding="md">
            <h2 className="text-xl font-extrabold text-slate-800 mb-4">🌟 Examples!</h2>
            <div className="grid grid-cols-2 gap-3">
              {selectedLesson.examples.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => speak(ex.replace(/[^\w\s]/g, ""))}
                  className={`${selectedLesson.bgColor} rounded-2xl p-4 text-center text-2xl hover:scale-105 transition-transform font-bold text-slate-800`}
                >
                  {ex}
                </button>
              ))}
            </div>
          </Card>

          {/* Practice */}
          <button
            onClick={() => setPhase("practice")}
            className={`w-full py-5 bg-gradient-to-r ${selectedLesson.color} text-white font-extrabold text-2xl rounded-3xl hover:scale-105 transition-transform shadow-xl`}
          >
            ⭐ Let's Practice! ⭐
          </button>
        </div>
      )}

      {phase === "practice" && selectedLesson && (
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-extrabold text-slate-800">
            🎯 Practice Time!
          </h2>

          <Card padding="lg">
            <div className={`text-8xl font-extrabold mb-4 bg-gradient-to-br ${selectedLesson.color} bg-clip-text text-transparent`}>
              {selectedLesson.letter.length <= 3 ? selectedLesson.letter : selectedLesson.letter[0]}
            </div>
            <p className="text-2xl font-bold text-slate-700 mb-2">
              Can you say: <span className="text-indigo-600">"{selectedLesson.sound}"</span>?
            </p>
            <p className="text-slate-500 mb-6">Say it out loud or click the button!</p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => speak(selectedLesson.sound)}
                className="flex items-center gap-2 bg-indigo-100 text-indigo-700 font-bold px-6 py-3 rounded-2xl hover:bg-indigo-200 text-lg"
              >
                <Volume2 size={20} /> Listen
              </button>
              <button
                onClick={completePractice}
                className={`flex items-center gap-2 bg-gradient-to-r ${selectedLesson.color} text-white font-bold px-6 py-3 rounded-2xl hover:scale-105 transition-transform text-lg shadow-lg`}
              >
                <CheckCircle size={20} /> I Did It! ✅
              </button>
            </div>
          </Card>
        </div>
      )}

      {phase === "complete" && selectedLesson && (
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div>
            <div className="text-[100px] animate-bounce mb-4">🎉</div>
            <h2 className="text-4xl font-extrabold text-slate-800 mb-2">
              Amazing Work!
            </h2>
            <p className="text-xl text-slate-600 mb-4">You learned about {selectedLesson.title}!</p>

            <div className="flex justify-center gap-3 mb-8">
              {[...Array(3)].map((_, i) => (
                <Star
                  key={i}
                  size={48}
                  className="text-amber-400 fill-current animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => setPhase("menu")}
              className="flex items-center gap-2 bg-slate-100 text-slate-700 font-bold px-6 py-4 rounded-2xl hover:bg-slate-200 text-lg"
            >
              🏠 More Lessons
            </button>
            <button
              onClick={() => startLesson(selectedLesson)}
              className={`flex items-center gap-2 bg-gradient-to-r ${selectedLesson.color} text-white font-bold px-6 py-4 rounded-2xl hover:scale-105 transition-transform text-lg shadow-lg`}
            >
              <RotateCcw size={20} /> Do Again!
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
