"use client";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  color?: string;
  animated?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  className,
  barClassName,
  showLabel,
  size = "md",
  color,
  animated = true,
}: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const sizes = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  return (
    <div className={cn("relative", className)}>
      <div className={cn("w-full bg-slate-100 rounded-full overflow-hidden", sizes[size])}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out",
            !color && "bg-gradient-to-r from-indigo-500 to-violet-500",
            barClassName
          )}
          style={{
            width: `${percent}%`,
            background: color || undefined,
          }}
        />
      </div>
      {showLabel && (
        <span className="absolute right-0 -top-5 text-xs font-semibold text-slate-600">
          {percent}%
        </span>
      )}
    </div>
  );
}
