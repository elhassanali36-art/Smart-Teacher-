// Next.js instrumentation - runs once when the server starts
// Used to auto-apply database schema on cold start

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { exec } = await import("child_process");
      const { promisify } = await import("util");
      const execAsync = promisify(exec);

      console.log("[instrumentation] Applying database schema...");
      const { stdout, stderr } = await execAsync("npx drizzle-kit push --config=drizzle.config.json", {
        cwd: process.cwd(),
        timeout: 30_000,
        env: { ...process.env },
      });
      if (stdout) console.log("[instrumentation] drizzle-kit push:", stdout.trim());
      if (stderr && !stderr.includes("No changes")) console.warn("[instrumentation] drizzle-kit stderr:", stderr.trim());
      console.log("[instrumentation] Database schema ready ✓");
    } catch (err) {
      // Non-fatal — app can still run if schema already exists
      console.warn("[instrumentation] Schema push warning (non-fatal):", String(err).slice(0, 200));
    }
  }
}
