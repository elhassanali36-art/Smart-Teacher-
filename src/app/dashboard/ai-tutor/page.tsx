"use client";
import { api } from "@/lib/api";
import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import toast from "react-hot-toast";
import { Brain, Send, Volume2, User, Bot, Lightbulb, RotateCcw, Smile, BookOpen, Calculator } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  hints?: string[];
  encouragement?: string;
  timestamp: Date;
}

const quickPrompts = [
  { label: "Explain this concept", icon: "💡", text: "Can you explain this in simple terms?" },
  { label: "Math help", icon: "🔢", text: "I need help with a math problem" },
  { label: "Grammar question", icon: "📝", text: "I have a grammar question" },
  { label: "Science fact", icon: "🔬", text: "Tell me something interesting about science" },
  { label: "Study tips", icon: "📚", text: "Give me some study tips" },
  { label: "Practice question", icon: "❓", text: "Give me a practice question to test myself" },
];

export default function AITutorPage() {
  const { user, studentProfile } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hello${user ? `, ${user.firstName}` : ""}! 👋 I'm your AI tutor! I'm here to help you learn and understand any subject. Ask me anything — from math problems to grammar questions, science concepts, or just about anything you're curious about!\n\nWhat would you like to learn today? 🎓`,
      hints: ["Try asking me to explain a concept", "Ask for a practice problem", "Tell me what you're studying"],
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("general");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const subjects = [
    { value: "general", label: "General", emoji: "🌟" },
    { value: "mathematics", label: "Math", emoji: "🔢" },
    { value: "english", label: "English", emoji: "📖" },
    { value: "arabic", label: "Arabic", emoji: "📝" },
    { value: "science", label: "Science", emoji: "🔬" },
  ];

  async function sendMessage(text?: string) {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    const userMessage: Message = {
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const apiMessages = messages.map(m => ({ role: m.role, content: m.content }));
      apiMessages.push({ role: "user", content: messageText });

      const res = await api("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          context: {
            subject: selectedSubject,
            grade: studentProfile?.grade || 5,
            stage: studentProfile?.stage || "primary",
            studentLevel: studentProfile?.learningLevel || "intermediate",
          },
          studentId: studentProfile?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const response = data.response;
      const aiMessage: Message = {
        role: "assistant",
        content: response.message,
        hints: response.hints,
        encouragement: response.encouragement,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI error:", error);
      toast.error("AI tutor is temporarily unavailable");
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I'm having a little trouble right now. Please try again in a moment! 🙏",
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  }

  function speak(text: string) {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  }

  function clearChat() {
    setMessages([{
      role: "assistant",
      content: "Chat cleared! Let's start fresh. What would you like to learn today? 🎓",
      timestamp: new Date(),
    }]);
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto h-full flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
              <Brain size={26} className="text-violet-500" />
              AI Tutor
            </h1>
            <p className="text-slate-500 text-sm mt-1">Your personal AI teacher — ask me anything!</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Subject Selector */}
            <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
              {subjects.map(s => (
                <button
                  key={s.value}
                  onClick={() => setSelectedSubject(s.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedSubject === s.value
                      ? "bg-white text-violet-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                  title={s.label}
                >
                  {s.emoji}
                </button>
              ))}
            </div>
            <button
              onClick={clearChat}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
              title="Clear chat"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden" style={{ minHeight: "500px" }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                {/* Avatar */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  msg.role === "assistant"
                    ? "bg-gradient-to-br from-violet-500 to-indigo-600"
                    : "bg-gradient-to-br from-slate-400 to-slate-500"
                }`}>
                  {msg.role === "assistant" ? <Bot size={18} className="text-white" /> : <User size={18} className="text-white" />}
                </div>

                {/* Bubble */}
                <div className={`max-w-[75%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-2`}>
                  <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-tr-sm"
                      : "bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-sm"
                  }`}>
                    {msg.content}
                  </div>

                  {/* Hints */}
                  {msg.hints && msg.hints.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {msg.hints.map((hint, hi) => (
                        <button
                          key={hi}
                          onClick={() => sendMessage(hint)}
                          className="flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-medium px-3 py-1.5 rounded-xl hover:bg-amber-100 transition-colors border border-amber-200"
                        >
                          <Lightbulb size={12} /> {hint}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Encouragement + TTS */}
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-2">
                      {msg.encouragement && (
                        <span className="text-xs text-emerald-600 font-medium">{msg.encouragement}</span>
                      )}
                      <button
                        onClick={() => speak(msg.content)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                        title="Read aloud"
                      >
                        <Volume2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading */}
            {loading && (
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                  <Bot size={18} className="text-white" />
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-4 py-3 border-t border-slate-100 flex gap-2 overflow-x-auto">
            {quickPrompts.map((p) => (
              <button
                key={p.label}
                onClick={() => sendMessage(p.text)}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors border border-slate-200"
              >
                {p.icon} {p.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-100">
            <div className="flex gap-3">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Ask me anything..."
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white hover:from-violet-600 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-md"
              >
                <Send size={20} />
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">
              AI tutor helps you learn by guiding you — not just giving answers 🎓
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
