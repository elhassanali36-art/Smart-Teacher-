import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-4">🔍</div>
        <h1 className="text-4xl font-extrabold text-slate-800 mb-2">404</h1>
        <h2 className="text-xl font-bold text-slate-600 mb-4">Page Not Found</h2>
        <p className="text-slate-500 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/dashboard"
            className="bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-indigo-600 transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="bg-slate-100 text-slate-700 font-semibold px-6 py-2.5 rounded-xl hover:bg-slate-200 transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
