import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { verifyPassword, createSession, setSessionCookie } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password)
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });

    const [user] = await db.select().from(users)
      .where(eq(users.email, email.toLowerCase())).limit(1);

    if (!user)
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    if (!user.isActive)
      return NextResponse.json({ error: "Account is disabled" }, { status: 403 });

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid)
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

    const token = await createSession({
      userId: user.id, role: user.role,
      email: user.email, firstName: user.firstName, lastName: user.lastName,
    });

    // Set cookie (fallback) AND return token (primary — for localStorage)
    await setSessionCookie(token);

    return NextResponse.json({
      token,   // ← client stores this in localStorage
      user: {
        id: user.id, email: user.email, role: user.role,
        firstName: user.firstName, lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
