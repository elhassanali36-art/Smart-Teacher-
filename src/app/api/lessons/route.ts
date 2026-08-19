import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { lessons, subjects, lessonProgress } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const stage     = searchParams.get("stage");
    const subjectId = searchParams.get("subjectId");
    const studentId = searchParams.get("studentId");

    const conds = [eq(lessons.isPublished, true)];
    if (stage)     conds.push(eq(lessons.stage, stage as "kindergarten"|"primary"|"middle"|"high"));
    if (subjectId) conds.push(eq(lessons.subjectId, parseInt(subjectId)));

    const rows = await db.select({
      id: lessons.id, title: lessons.title, titleAr: lessons.titleAr,
      description: lessons.description, stage: lessons.stage, grade: lessons.grade,
      difficulty: lessons.difficulty, contentType: lessons.contentType,
      durationMinutes: lessons.durationMinutes, xpReward: lessons.xpReward,
      sortOrder: lessons.sortOrder, subjectId: lessons.subjectId,
      subjectName: subjects.name, subjectNameAr: subjects.nameAr,
      subjectEmoji: subjects.iconEmoji, subjectColor: subjects.color,
    }).from(lessons)
      .innerJoin(subjects, eq(lessons.subjectId, subjects.id))
      .where(and(...conds))
      .orderBy(lessons.grade, lessons.sortOrder);

    let progressMap: Record<number,{status:string;progressPercent:number}> = {};
    if (studentId) {
      const prog = await db.select().from(lessonProgress)
        .where(eq(lessonProgress.studentId, parseInt(studentId)));
      progressMap = Object.fromEntries(prog.map(p => [p.lessonId, { status: p.status, progressPercent: p.progressPercent }]));
    }

    return NextResponse.json({
      lessons: rows.map(l => ({ ...l, progress: progressMap[l.id] || { status:"not_started", progressPercent:0 } })),
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const [lesson] = await db.insert(lessons).values({
      subjectId: parseInt(body.subjectId), title: body.title, titleAr: body.titleAr,
      description: body.description, content: body.content, contentAr: body.contentAr,
      stage: body.stage, grade: parseInt(body.grade),
      difficulty: body.difficulty || "beginner", contentType: body.contentType || "text",
      durationMinutes: body.durationMinutes || 15, xpReward: body.xpReward || 10,
      sortOrder: body.sortOrder || 0, isPublished: false,
    }).returning();
    return NextResponse.json({ lesson });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
