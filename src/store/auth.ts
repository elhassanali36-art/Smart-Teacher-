import { create } from "zustand";
import { api, setToken, clearToken } from "@/lib/api";

export interface User {
  id: number;
  email: string;
  role: "student" | "admin" | string;
  firstName: string;
  lastName: string;
  preferredLanguage?: string;
}

export interface StudentProfile {
  id: number;
  userId: number;
  parentId: number;
  displayName: string;
  grade: number;
  stage: string;
  age?: number;
  preferredLanguage: string;
  learningLevel: string;
  xpPoints: number;
  streakDays: number;
  totalStudyMinutes: number;
  selectedAvatarId?: number;
  weakSubjects?: string[];
  strongSubjects?: string[];
  microphoneAllowed: boolean;
  cameraAllowed: boolean;
  maxDailyMinutes?: number;
  lastActiveDate?: string;
}

export interface Subscription {
  id: number;
  parentId: number;
  plan: string;
  status: string;
  aiAvatarEnabled: boolean;
  trialEndsAt?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
}

interface AuthState {
  user: User | null;
  studentProfile: StudentProfile | null;
  subscription: Subscription | null;
  isLoading: boolean;
  isInitialized: boolean;
  setStudentProfile: (p: StudentProfile | null) => void;
  loginSuccess: (token: string) => Promise<void>;
  initialize: (force?: boolean) => Promise<void>;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

async function fetchMe() {
  const res = await api("/api/auth/me");
  if (!res.ok) return null;
  return res.json();
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user:           null,
  studentProfile: null,
  subscription:   null,
  isLoading:      false,
  isInitialized:  false,

  setStudentProfile: (p) => set({ studentProfile: p }),

  // Called after successful login/register — stores token then loads profile
  loginSuccess: async (token: string) => {
    setToken(token);
    set({ isLoading: true });
    try {
      const d = await fetchMe();
      if (d) {
        set({
          user:           d.user           ?? null,
          studentProfile: d.studentProfile ?? null,
          subscription:   d.subscription   ?? null,
          isInitialized:  true,
        });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  initialize: async (force = false) => {
    if (get().isInitialized && !force) return;
    set({ isLoading: true });
    try {
      const d = await fetchMe();
      if (d) {
        set({
          user:           d.user           ?? null,
          studentProfile: d.studentProfile ?? null,
          subscription:   d.subscription   ?? null,
          isInitialized:  true,
        });
      } else {
        set({ user: null, studentProfile: null, subscription: null, isInitialized: true });
      }
    } catch {
      set({ user: null, studentProfile: null, subscription: null, isInitialized: true });
    } finally {
      set({ isLoading: false });
    }
  },

  refresh: async () => {
    set({ isLoading: true });
    try {
      const d = await fetchMe();
      if (d) {
        set({
          user:           d.user           ?? null,
          studentProfile: d.studentProfile ?? null,
          subscription:   d.subscription   ?? null,
          isInitialized:  true,
        });
      }
    } catch { /* ignore */ }
    finally { set({ isLoading: false }); }
  },

  logout: async () => {
    try { await api("/api/auth/logout", { method: "POST" }); } catch { /* ignore */ }
    clearToken();
    set({ user: null, studentProfile: null, subscription: null, isInitialized: false });
    window.location.href = "/";
  },
}));
