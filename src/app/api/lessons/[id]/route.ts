import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { lessons, subjects, questions, lessonProgress } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    const [lesson] = await db.select({
      id: lessons.id, title: lessons.title, titleAr: lessons.titleAr,
      description: lessons.description, content: lessons.content, contentAr: lessons.contentAr,
      stage: lessons.stage, grade: lessons.grade, difficulty: lessons.difficulty,
      contentType: lessons.contentType, durationMinutes: lessons.durationMinutes, xpReward: lessons.xpReward,
      subjectId: lessons.subjectId, subjectName: subjects.name, subjectNameAr: subjects.nameAr,
      subjectEmoji: subjects.iconEmoji, subjectColor: subjects.color,
    }).from(lessons)
      .innerJoin(subjects, eq(lessons.subjectId, subjects.id))
      .where(eq(lessons.id, parseInt(id))).limit(1);

    if (!lesson) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const qs = await db.select().from(questions).where(eq(questions.lessonId, parseInt(id))).limit(10);

    let progress = null;
    if (studentId) {
      const [p] = await db.select().from(lessonProgress)
        .where(and(eq(lessonProgress.lessonId, parseInt(id)), eq(lessonProgress.studentId, parseInt(studentId)))).limit(1);
      progress = p ?? null;
    }

    return NextResponse.json({ lesson, questions: qs, progress });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const body = await req.json();
    await db.update(lessons).set({ ...body, updatedAt: new Date() }).where(eq(lessons.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    await db.delete(lessons).where(eq(lessons.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
