import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subjects } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const stage = searchParams.get("stage");
    let all = await db.select().from(subjects).where(eq(subjects.isActive, true)).orderBy(subjects.sortOrder);
    if (stage) all = all.filter(s => (s.stages as string[]).includes(stage));
    return NextResponse.json({ subjects: all });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const [s] = await db.insert(subjects).values({
      name: body.name, nameAr: body.nameAr, slug: body.slug,
      description: body.description, iconEmoji: body.iconEmoji || "📚",
      color: body.color || "#6366f1", stages: body.stages || ["primary","middle","high"],
      sortOrder: body.sortOrder || 0, isActive: true,
    }).returning();
    return NextResponse.json({ subject: s });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
