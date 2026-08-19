"use client";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, BookOpen, Brain, Trophy, BarChart2, Users,
  Settings, LogOut, ChevronRight, GraduationCap,
  Star, Zap, Baby, Calculator, Globe, Database,
} from "lucide-react";

interface NavItem { href: string; label: string; icon: React.ReactNode; color?: string; }

function getNav(role: string, stage?: string): NavItem[] {
  if (role === "student") {
    const items: NavItem[] = [{ href: "/dashboard", label: "Dashboard", icon: <Home size={20} /> }];
    if (stage === "kindergarten")
      items.push({ href: "/dashboard/kindergarten", label: "🌈 Fun Learning", icon: <Baby size={20} />, color: "text-amber-500" });
    items.push(
      { href: "/dashboard/lessons",      label: "Lessons",        icon: <BookOpen size={20} /> },
      { href: "/dashboard/ai-tutor",     label: "AI Tutor",       icon: <Brain size={20} />,     color: "text-violet-600" },
      { href: "/dashboard/math",         label: "Maths Tutor",    icon: <Calculator size={20} /> },
      { href: "/dashboard/quiz",         label: "Practice Quiz",  icon: <Star size={20} /> },
      { href: "/dashboard/achievements", label: "Achievements",   icon: <Trophy size={20} />,    color: "text-amber-500" },
      { href: "/dashboard/progress",     label: "My Progress",    icon: <BarChart2 size={20} /> },
    );
    return items;
  }

  if (role === "admin") return [
    { href: "/dashboard",           label: "Dashboard",  icon: <Home size={20} /> },
    { href: "/dashboard/users",     label: "Users",      icon: <Users size={20} /> },
    { href: "/dashboard/subjects",  label: "Subjects",   icon: <Globe size={20} /> },
    { href: "/dashboard/lessons",   label: "Lessons",    icon: <BookOpen size={20} /> },
    { href: "/dashboard/analytics", label: "Analytics",  icon: <BarChart2 size={20} /> },
    { href: "/dashboard/seed",      label: "Seed Data",  icon: <Database size={20} /> },
    { href: "/dashboard/settings",  label: "Settings",   icon: <Settings size={20} /> },
  ];

  return [];
}

export function Sidebar({ collapsed }: { collapsed?: boolean }) {
  const { user, studentProfile, logout } = useAuthStore();
  const pathname = usePathname();
  const nav = getNav(user?.role || "", studentProfile?.stage);

  const stageGrad: Record<string, string> = {
    kindergarten: "from-amber-400 to-orange-500",
    primary:      "from-emerald-400 to-teal-500",
    middle:       "from-indigo-400 to-violet-500",
    high:         "from-blue-500 to-indigo-600",
  };
  const adminGrad = "from-violet-600 to-indigo-700";
  const grad = user?.role === "admin"
    ? adminGrad
    : stageGrad[studentProfile?.stage || "primary"] || "from-indigo-500 to-violet-600";

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-full bg-white border-r border-slate-100 shadow-sm z-40 flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>

      {/* Logo */}
      <div className={cn("p-4 border-b border-slate-100", collapsed && "px-2")}>
        <Link href="/" className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0",
            grad
          )}>
            <GraduationCap size={22} className="text-white" />
          </div>
          {!collapsed && (
            <div>
              <div className="font-bold text-slate-800 text-base leading-tight">EduLearn AI</div>
              <div className="text-[10px] text-slate-400 font-medium">British Curriculum</div>
            </div>
          )}
        </Link>
      </div>

      {/* User card */}
      {!collapsed && user && (
        <div className={cn("mx-3 mt-4 p-3 rounded-xl bg-gradient-to-br text-white", grad)}>
          <div className="font-semibold text-sm truncate">{user.firstName} {user.lastName}</div>
          <div className="text-xs opacity-80 capitalize mt-0.5">{user.role}</div>
          {studentProfile && (
            <div className="flex items-center gap-2 mt-2 text-xs opacity-90">
              <Zap size={11} /><span>{studentProfile.xpPoints} XP</span>
              <span>·</span><span>🔥 {studentProfile.streakDays}d</span>
            </div>
          )}
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {nav.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-800",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}>
              <span className={cn(active ? "text-indigo-600" : item.color || "text-slate-500")}>
                {item.icon}
              </span>
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {active && <ChevronRight size={14} className="text-indigo-400" />}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="p-3 border-t border-slate-100">
        <button onClick={logout}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors",
            collapsed && "justify-center"
          )}>
          <LogOut size={18} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
