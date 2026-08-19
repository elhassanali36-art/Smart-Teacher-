import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { studentProfiles, lessonProgress, quizAttempts, studentAchievements, achievements } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, desc, count, avg } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const studentId = parseInt(id);

    const [profile] = await db.select().from(studentProfiles).where(eq(studentProfiles.id, studentId)).limit(1);
    if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Access control
    if (session.role === "student" && profile.userId !== session.userId)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (session.role === "parent" && profile.parentId !== session.userId)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const [completed] = await db.select({ count: count() }).from(lessonProgress)
      .where(eq(lessonProgress.studentId, studentId));
    const [quizStats] = await db.select({ attempts: count(), avgScore: avg(quizAttempts.score) })
      .from(quizAttempts).where(eq(quizAttempts.studentId, studentId));

    const earnedAch = await db.select({
      id: achievements.id, name: achievements.name, iconEmoji: achievements.iconEmoji,
      earnedAt: studentAchievements.earnedAt,
    }).from(studentAchievements)
      .innerJoin(achievements, eq(studentAchievements.achievementId, achievements.id))
      .where(eq(studentAchievements.studentId, studentId))
      .orderBy(desc(studentAchievements.earnedAt)).limit(20);

    const recentProgress = await db.select().from(lessonProgress)
      .where(eq(lessonProgress.studentId, studentId))
      .orderBy(desc(lessonProgress.updatedAt)).limit(10);

    return NextResponse.json({
      profile,
      stats: {
        lessonsCompleted: completed?.count || 0,
        quizAttempts: quizStats?.attempts || 0,
        avgQuizScore: quizStats?.avgScore ? Math.round(Number(quizStats.avgScore)) : 0,
      },
      achievements: earnedAch,
      recentProgress,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const studentId = parseInt(id);
    const body = await req.json();

    const [profile] = await db.select().from(studentProfiles).where(eq(studentProfiles.id, studentId)).limit(1);
    if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (session.role === "parent" && profile.parentId !== session.userId)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const allowed: Record<string, unknown> = {};
    const fields = ["grade","stage","age","preferredLanguage","selectedAvatarId","learningLevel",
                    "microphoneAllowed","cameraAllowed","maxDailyMinutes","displayName"];
    for (const f of fields) if (body[f] !== undefined) allowed[f] = body[f];

    await db.update(studentProfiles).set({ ...allowed, updatedAt: new Date() })
      .where(eq(studentProfiles.id, studentId));
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
