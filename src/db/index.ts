import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL environment variable is required but not set.\n" +
    "Please add DATABASE_URL to your .env file."
  );
}

// Reuse pool across hot-reloads in development
const globalForDb = globalThis as typeof globalThis & {
  __eduLearnPool?: Pool;
};

export const pool =
  globalForDb.__eduLearnPool ??
  new Pool({
    connectionString: databaseUrl,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });

// Only cache pool reference in development to survive hot-reloads
if (process.env.NODE_ENV !== "production") {
  globalForDb.__eduLearnPool = pool;
}

export const db = drizzle(pool);
