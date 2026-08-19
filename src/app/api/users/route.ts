import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = new URL(req.url).searchParams.get("role");
    let all = await db.select({
      id: users.id, email: users.email, role: users.role,
      firstName: users.firstName, lastName: users.lastName,
      isActive: users.isActive, preferredLanguage: users.preferredLanguage, createdAt: users.createdAt,
    }).from(users).orderBy(desc(users.createdAt));
    if (role) all = all.filter(u => u.role === role);
    return NextResponse.json({ users: all });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { userId, isActive } = await req.json();
    await db.update(users).set({ isActive }).where(eq(users.id, userId));
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
