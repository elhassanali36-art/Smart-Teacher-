import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function getGradeLabel(grade: number, stage: string): string {
  if (stage === "kindergarten") return `KG ${grade}`;
  return `Grade ${grade}`;
}

export function getStageColor(stage: string): string {
  const colors: Record<string, string> = {
    kindergarten: "#f59e0b",
    primary: "#10b981",
    middle: "#6366f1",
    high: "#3b82f6",
  };
  return colors[stage] || "#6b7280";
}

export function getLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    beginner: "Beginner",
    elementary: "Elementary",
    intermediate: "Intermediate",
    advanced: "Advanced",
    expert: "Expert",
  };
  return labels[level] || level;
}

export function getXPForLevel(xp: number): {
  level: number;
  current: number;
  needed: number;
  percent: number;
} {
  const thresholds = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7500];
  let level = 1;
  for (let i = 0; i < thresholds.length; i++) {
    if (xp >= thresholds[i]) level = i + 1;
    else break;
  }
  const current = xp - (thresholds[level - 1] || 0);
  const needed = (thresholds[level] || thresholds[thresholds.length - 1]) - (thresholds[level - 1] || 0);
  const percent = Math.min(100, Math.round((current / needed) * 100));
  return { level, current, needed, percent };
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "…";
}
