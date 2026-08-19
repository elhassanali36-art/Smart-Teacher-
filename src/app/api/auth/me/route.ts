import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { users, studentProfiles, subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const [user] = await db.select({
      id: users.id, email: users.email, role: users.role,
      firstName: users.firstName, lastName: users.lastName,
      preferredLanguage: users.preferredLanguage, createdAt: users.createdAt,
    }).from(users).where(eq(users.id, session.userId)).limit(1);

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    let studentProfile = null;
    let subscription = null;

    if (user.role === "student") {
      const [p] = await db.select().from(studentProfiles)
        .where(eq(studentProfiles.userId, user.id)).limit(1);
      studentProfile = p ?? null;
    }
    if (user.role === "parent") {
      const [s] = await db.select().from(subscriptions)
        .where(eq(subscriptions.parentId, user.id)).limit(1);
      subscription = s ?? null;
    }

    return NextResponse.json({ user, studentProfile, subscription });
  } catch (error) {
    console.error("Me error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
