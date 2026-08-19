"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={40} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-800 mb-2">
          Oops! Something went wrong
        </h1>
        <p className="text-slate-500 mb-2">
          We encountered an unexpected error. Your progress is safe.
        </p>
        {error?.digest && (
          <p className="text-xs text-slate-400 font-mono bg-slate-100 px-3 py-1.5 rounded-lg mb-6 inline-block">
            Error: {error.digest}
          </p>
        )}
        <div className="flex justify-center gap-3 flex-wrap">
          <button
            onClick={reset}
            className="flex items-center gap-2 bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-600 transition-colors"
          >
            <RotateCcw size={16} /> Try Again
          </button>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 bg-slate-100 text-slate-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-slate-200 transition-colors"
          >
            <Home size={16} /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
