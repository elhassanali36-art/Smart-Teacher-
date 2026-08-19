"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">😔</div>
        <h1 className="text-2xl font-extrabold text-slate-800 mb-2">
          Something went wrong
        </h1>
        <p className="text-slate-500 mb-2">
          An unexpected error occurred. Please try again.
        </p>
        {error?.digest && (
          <p className="text-xs text-slate-400 font-mono mb-6">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex justify-center gap-3 flex-wrap">
          <button
            onClick={reset}
            className="bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-indigo-600 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="bg-slate-100 text-slate-700 font-semibold px-6 py-2.5 rounded-xl hover:bg-slate-200 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
