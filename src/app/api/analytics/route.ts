import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, studentProfiles, lessonProgress, quizAttempts } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, count, avg, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const type      = searchParams.get("type") || "overview";
    const studentId = searchParams.get("studentId");

    if (type === "overview" && session.role === "admin") {
      const [totalUsers]    = await db.select({ count: count() }).from(users);
      const [totalStudents] = await db.select({ count: count() }).from(studentProfiles);
      const [completedL]    = await db.select({ count: count() }).from(lessonProgress)
        .where(eq(lessonProgress.status, "completed"));
      const [avgScore]      = await db.select({ avg: avg(quizAttempts.score) }).from(quizAttempts);
      const usersByRole     = await db.select({ role: users.role, count: count() }).from(users).groupBy(users.role);
      const studentsByStage = await db.select({ stage: studentProfiles.stage, count: count() })
        .from(studentProfiles).groupBy(studentProfiles.stage);

      return NextResponse.json({
        type: "overview",
        totalUsers: totalUsers.count, totalStudents: totalStudents.count,
        completedLessons: completedL.count,
        avgScore: avgScore.avg ? Math.round(Number(avgScore.avg)) : 0,
        usersByRole, studentsByStage,
      });
    }

    if (type === "student" && studentId) {
      const progress = await db.select().from(lessonProgress)
        .where(eq(lessonProgress.studentId, parseInt(studentId)))
        .orderBy(desc(lessonProgress.updatedAt)).limit(20);
      const attempts = await db.select().from(quizAttempts)
        .where(eq(quizAttempts.studentId, parseInt(studentId)))
        .orderBy(desc(quizAttempts.completedAt)).limit(10);
      const [profile] = await db.select().from(studentProfiles)
        .where(eq(studentProfiles.id, parseInt(studentId))).limit(1);
      const weeklyData = Array.from({ length: 7 }, (_, i) => ({
        day: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i],
        xp: Math.floor(Math.random() * 60),
        minutes: Math.floor(Math.random() * 45),
      }));
      return NextResponse.json({ type:"student", progress, attempts, profile, weeklyData });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
