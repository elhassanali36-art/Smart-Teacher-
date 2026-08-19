"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { Sidebar } from "./Sidebar";
import { useRouter } from "next/navigation";
import { Menu, Bell, Search, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
}

export function DashboardLayout({ children, requiredRole }: DashboardLayoutProps) {
  const { user, isLoading, isInitialized, initialize } = useAuthStore();
  const router = useRouter();
  const [collapsed,   setCollapsed]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  // Always force-fetch on mount so cookie is read fresh
  useEffect(() => { initialize(true); }, []); // eslint-disable-line

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) { router.replace("/login"); return; }
    if (requiredRole) {
      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      if (!roles.includes(user.role) && user.role !== "admin") {
        router.replace("/dashboard");
      }
    }
  }, [isInitialized, user, requiredRole, router]);

  // Loading screen
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
            <GraduationCap size={30} className="text-white" />
          </div>
          <p className="text-slate-500 text-sm font-medium">Loading EduLearn AI…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* Desktop sidebar */}
      <div className="hidden md:block flex-shrink-0">
        <Sidebar collapsed={collapsed} />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 z-10">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0 transition-all duration-300",
        collapsed ? "md:ml-16" : "md:ml-64"
      )}>

        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-slate-100 px-4 py-3 flex items-center gap-3">
          <button className="md:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600"
            onClick={() => setMobileOpen(true)}>
            <Menu size={20} />
          </button>
          <button className="hidden md:flex p-2 rounded-xl hover:bg-slate-100 text-slate-600"
            onClick={() => setCollapsed(!collapsed)}>
            <Menu size={20} />
          </button>

          <div className="flex-1 max-w-md hidden sm:flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2">
            <Search size={15} className="text-slate-400 flex-shrink-0" />
            <input placeholder="Search lessons, subjects…"
              className="bg-transparent text-sm text-slate-600 placeholder:text-slate-400 outline-none flex-1" />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-500">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2 pl-1">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold select-none">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-semibold text-slate-800 leading-tight">{user.firstName}</div>
                <div className="text-xs text-slate-400 capitalize">{user.role}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
