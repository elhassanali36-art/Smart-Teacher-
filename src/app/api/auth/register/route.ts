import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, studentProfiles } from "@/db/schema";
import { hashPassword, createSession, setSessionCookie } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName, grade, stage, age } = body;

    if (!email || !password || !firstName || !lastName)
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    if (password.length < 6)
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });

    // Public registration = STUDENT only. Admin accounts exist via seed.
    const [existing] = await db.select({ id: users.id }).from(users)
      .where(eq(users.email, email.toLowerCase())).limit(1);
    if (existing)
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });

    const passwordHash = await hashPassword(password);
    const [user] = await db.insert(users).values({
      email: email.toLowerCase(), passwordHash,
      role: "student", firstName, lastName,
    }).returning();

    const displayName = `${firstName} ${lastName}`.trim();
    await db.insert(studentProfiles).values({
      userId: user.id,
      parentId: user.id,
      displayName,
      grade: parseInt(grade) || 1,
      stage: (stage as "kindergarten"|"primary"|"middle"|"high") || "primary",
      age: age ? parseInt(age) : null,
      preferredLanguage: "en",
    });

    const token = await createSession({
      userId: user.id, role: user.role,
      email: user.email, firstName: user.firstName, lastName: user.lastName,
    });
    await setSessionCookie(token);

    return NextResponse.json({
      token,
      user: {
        id: user.id, email: user.email, role: user.role,
        firstName: user.firstName, lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
