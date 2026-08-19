import Link from "next/link";
import { GraduationCap, Zap, CheckCircle, ArrowRight } from "lucide-react";

export default function HomePage() {
  const features = [
    { icon: "🤖", title: "AI-Powered Tutoring",    desc: "Personalised AI tutor that adapts to each student's pace, level and learning style" },
    { icon: "🎓", title: "K–12 British Curriculum", desc: "Complete coverage from EYFS / Kindergarten through GCSE — all core subjects" },
    { icon: "🌍", title: "Arabic & English",        desc: "Full bilingual support — Arabic RTL and English LTR" },
    { icon: "📊", title: "Real-time Progress",      desc: "Detailed analytics and progress tracking for every student" },
    { icon: "🏆", title: "Gamification",            desc: "XP, badges, streaks and achievements that make learning genuinely fun" },
    { icon: "🔒", title: "Child-Safe by Design",    desc: "Full admin controls and strict child privacy protection" },
  ];

  const stages = [
    { emoji: "🌈", stage: "Kindergarten",  desc: "Colourful, animated, playful learning",       color: "from-amber-400 to-orange-400",  ages: "Ages 4–6" },
    { emoji: "🌱", stage: "Primary",        desc: "Interactive AI-guided lessons",               color: "from-emerald-400 to-teal-500",  ages: "Years 1–6" },
    { emoji: "🚀", stage: "Middle School",  desc: "Structured learning with advanced topics",     color: "from-indigo-400 to-violet-500", ages: "Years 7–9" },
    { emoji: "🎯", stage: "High School",    desc: "GCSE exam preparation & academic excellence",  color: "from-blue-500 to-indigo-600",   ages: "Years 10–13" },
  ];

  const avatarGroups = [
    {
      label: "Cartoon Avatars — for Kindergarten", color: "bg-emerald-50 border-emerald-200",
      note: "Fun animated characters chosen for young learners",
      items: [
        { emoji: "☀️", name: "Sunny" }, { emoji: "🐶", name: "Biscuit" }, { emoji: "🌙", name: "Luna" },
        { emoji: "🤖", name: "Robo" },  { emoji: "🦁", name: "Leo" },     { emoji: "⭐", name: "Stella" },
      ],
    },
    {
      label: "AI Human Tutors — for older students", color: "bg-amber-50 border-amber-300",
      note: "Lifelike AI teachers with natural voice and personality",
      items: [
        { emoji: "👩‍🏫", name: "Ms. Sarah" }, { emoji: "👨‍🏫", name: "Mr. James" },
        { emoji: "👩‍🔬", name: "Dr. Aisha" }, { emoji: "👨‍🎓", name: "Prof. Omar" },
      ],
    },
  ];

  // Subscription-only pricing — NO free plan
  const plans = [
    {
      label: "Monthly", price: "$100", period: "/month",
      features: ["Full K–12 British Curriculum", "AI Human Tutors + Cartoon Avatars", "Natural voice AI teaching", "Advanced analytics", "Cancel anytime"],
      highlight: false,
    },
    {
      label: "Yearly", price: "$1000", period: "/year",
      features: ["Everything in Monthly", "Save $200 — 2 months free", "Priority support", "Early access to new features"],
      highlight: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900">

      {/* Nav */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <GraduationCap size={22} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-xl text-white">EduLearn AI</span>
              <span className="text-xs text-slate-400 ml-2 hidden sm:inline">British Curriculum</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">
              Sign In
            </Link>
            <Link href="/register"
              className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:from-indigo-600 hover:to-violet-700 transition-all shadow-lg">
              Join Now
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.2s" }} />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-sm px-4 py-2 rounded-full mb-8 border border-white/20">
            <Zap size={14} className="text-amber-400" />
            British Curriculum · AI-Powered · K–12 · Premium Education
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
            The Smart
            <span className="block bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
              AI School
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            A complete digital school from Kindergarten to High School — no human teacher needed.
            AI tutors teach, explain, evaluate and adapt to every student.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register"
              className="group flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold text-lg px-8 py-4 rounded-2xl hover:from-indigo-600 hover:to-violet-700 transition-all shadow-2xl shadow-indigo-500/30">
              Create Student Account
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login"
              className="flex items-center justify-center gap-2 bg-white/10 text-white font-semibold text-lg px-8 py-4 rounded-2xl hover:bg-white/20 border border-white/20 transition-all">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Stages */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">One Platform, Every Stage</h2>
            <p className="text-slate-400">Age-appropriate interfaces that grow with the student</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {stages.map(s => (
              <div key={s.stage} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{s.emoji}</div>
                <div className={`inline-block text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r ${s.color} text-white mb-3`}>
                  {s.ages}
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{s.stage}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Avatars */}
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">AI Tutor Avatars</h2>
            <p className="text-slate-400">Cartoon characters for kindergarten · Lifelike AI humans for older students</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {avatarGroups.map(group => (
              <div key={group.label} className={`border-2 ${group.color} rounded-2xl p-6`}>
                <h3 className="font-bold text-slate-800 text-lg mb-1">{group.label}</h3>
                <p className="text-xs text-slate-500 mb-4">{group.note}</p>
                <div className="grid grid-cols-3 gap-3">
                  {group.items.map(item => (
                    <div key={item.name} className="bg-white/80 rounded-xl p-3 text-center">
                      <div className="text-3xl mb-1">{item.emoji}</div>
                      <div className="font-bold text-slate-800 text-xs">{item.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Everything Students Need</h2>
            <p className="text-slate-400">A complete AI teacher — no human intervention required</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(f => (
              <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing — subscription only, NO free plan */}
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Subscription Plans</h2>
            <p className="text-slate-400">Premium AI education — choose monthly or yearly</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map(plan => (
              <div key={plan.label}
                className={`rounded-2xl p-8 border-2 relative ${plan.highlight ? "border-amber-400 bg-white/10" : "border-white/10 bg-white/5"}`}>
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-extrabold px-4 py-1 rounded-full whitespace-nowrap">
                    BEST VALUE — SAVE $200
                  </div>
                )}
                <div className="font-bold text-white text-xl mb-2">{plan.label}</div>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-5xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-slate-400">{plan.period}</span>
                </div>
                <div className="space-y-3 mb-8">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle size={15} className="text-emerald-400 flex-shrink-0" />{f}
                    </div>
                  ))}
                </div>
                <Link href="/register"
                  className={`block text-center py-3 rounded-xl font-bold transition-all ${
                    plan.highlight
                      ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600"
                      : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                  }`}>
                  Get {plan.label} Plan
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-slate-500 text-sm mt-6">
            Prices in USD · Cancel anytime · Secure payment
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-12 shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Ready to Start?</h2>
            <p className="text-indigo-200 text-lg mb-8">
              Join the smartest AI school — where every student gets a personal AI teacher.
            </p>
            <Link href="/register"
              className="inline-block bg-white text-indigo-700 font-bold text-lg px-10 py-4 rounded-2xl hover:bg-indigo-50 transition-all shadow-lg">
              Create Student Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <GraduationCap size={16} className="text-white" />
            </div>
            <span className="text-white font-semibold">EduLearn AI</span>
            <span className="text-slate-400 text-xs">British Curriculum Platform</span>
          </div>
          <p className="text-slate-500 text-sm">© 2024 EduLearn AI — AI-Powered Education</p>
          <div className="flex gap-6 text-slate-400 text-sm">
            <Link href="#" className="hover:text-white">Privacy</Link>
            <Link href="#" className="hover:text-white">Terms</Link>
            <Link href="#" className="hover:text-white">Child Safety</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
