import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { lessonProgress, studentProfiles, lessons, studentAchievements, achievements } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and, sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { studentId, lessonId, progressPercent, status, timeSpentMinutes, score } = await req.json();
    if (!studentId || !lessonId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const [existing] = await db.select().from(lessonProgress)
      .where(and(eq(lessonProgress.studentId, studentId), eq(lessonProgress.lessonId, lessonId))).limit(1);

    let xpEarned = 0;
    if (!existing) {
      await db.insert(lessonProgress).values({
        studentId, lessonId, status: status || "in_progress",
        progressPercent: progressPercent || 0, timeSpentMinutes: timeSpentMinutes || 0,
        score, attempts: 1,
        completedAt: status === "completed" ? new Date() : undefined,
      });
    } else {
      const wasCompleted = existing.status === "completed";
      await db.update(lessonProgress).set({
        status: status || existing.status,
        progressPercent: Math.max(existing.progressPercent, progressPercent || 0),
        timeSpentMinutes: (existing.timeSpentMinutes || 0) + (timeSpentMinutes || 0),
        score, attempts: existing.attempts + 1,
        completedAt: status === "completed" && !wasCompleted ? new Date() : existing.completedAt,
        updatedAt: new Date(),
      }).where(and(eq(lessonProgress.studentId, studentId), eq(lessonProgress.lessonId, lessonId)));

      if (status === "completed" && !wasCompleted) {
        const [lesson] = await db.select().from(lessons).where(eq(lessons.id, lessonId)).limit(1);
        xpEarned = lesson?.xpReward || 10;
        await db.update(studentProfiles).set({
          xpPoints: sql`${studentProfiles.xpPoints} + ${xpEarned}`,
          totalStudyMinutes: sql`${studentProfiles.totalStudyMinutes} + ${timeSpentMinutes || 0}`,
          lastActiveDate: new Date(), updatedAt: new Date(),
        }).where(eq(studentProfiles.id, studentId));
        await checkAchievements(studentId);
      }
    }

    await db.update(studentProfiles).set({ lastActiveDate: new Date(), updatedAt: new Date() })
      .where(eq(studentProfiles.id, studentId));

    return NextResponse.json({ success: true, xpEarned });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

async function checkAchievements(studentId: number) {
  try {
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(lessonProgress)
      .where(and(eq(lessonProgress.studentId, studentId), eq(lessonProgress.status, "completed")));
    const all = await db.select().from(achievements).where(eq(achievements.isActive, true));
    const earned = await db.select({ aid: studentAchievements.achievementId }).from(studentAchievements)
      .where(eq(studentAchievements.studentId, studentId));
    const earnedSet = new Set(earned.map(e => e.aid));
    for (const a of all) {
      if (earnedSet.has(a.id)) continue;
      const cond = a.condition as Record<string,unknown>;
      if (cond.type === "lessons_completed" && Number(count) >= Number(cond.value)) {
        await db.insert(studentAchievements).values({ studentId, achievementId: a.id }).onConflictDoNothing();
        await db.update(studentProfiles).set({ xpPoints: sql`${studentProfiles.xpPoints} + ${a.xpReward}` })
          .where(eq(studentProfiles.id, studentId));
      }
    }
  } catch (e) { console.error("Achievement check:", e); }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const studentId = new URL(req.url).searchParams.get("studentId");
    if (!studentId) return NextResponse.json({ error: "Missing studentId" }, { status: 400 });
    const progress = await db.select().from(lessonProgress)
      .where(eq(lessonProgress.studentId, parseInt(studentId)));
    return NextResponse.json({ progress });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
