"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "sans-serif", background: "#f8fafc" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: "400px" }}>
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>⚠️</div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#1e293b", marginBottom: "8px" }}>
              Application Error
            </h1>
            <p style={{ color: "#64748b", marginBottom: "8px" }}>
              A critical error occurred. Please refresh the page.
            </p>
            {error?.digest && (
              <p style={{ fontSize: "12px", color: "#94a3b8", fontFamily: "monospace", marginBottom: "24px" }}>
                Error: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              style={{
                background: "#6366f1",
                color: "white",
                border: "none",
                padding: "10px 24px",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Reload Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
