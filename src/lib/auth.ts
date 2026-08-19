import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies, headers } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "edulearn-ai-secret-2024-production-key"
);
const COOKIE = "edu_session";

export interface SessionPayload {
  userId: number;
  role: string;
  email: string;
  firstName: string;
  lastName: string;
}

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 12);
}

export async function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}

export async function createSession(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: true,        // required for SameSite=None
    sameSite: "none",    // allow iframe / cross-site contexts
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE);
}

/**
 * Reads session from EITHER:
 *  1. Authorization: Bearer <token> header (primary — works everywhere incl. iframes)
 *  2. Cookie (fallback)
 */
export async function getSession(): Promise<SessionPayload | null> {
  // 1) Authorization header
  try {
    const h = await headers();
    const auth = h.get("authorization");
    if (auth?.startsWith("Bearer ")) {
      const session = await verifySession(auth.slice(7));
      if (session) return session;
    }
  } catch { /* ignore */ }

  // 2) Cookie fallback
  try {
    const store = await cookies();
    const token = store.get(COOKIE)?.value;
    if (token) return verifySession(token);
  } catch { /* ignore */ }

  return null;
}
