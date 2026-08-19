import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { questions, quizAttempts, studentProfiles, studentAchievements, achievements } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and, inArray, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const stage     = searchParams.get("stage") as "kindergarten"|"primary"|"middle"|"high"|null;
    const subjectId = searchParams.get("subjectId");
    const limit     = Math.min(parseInt(searchParams.get("limit") ?? "5"), 20);

    const conds = [];
    if (stage)     conds.push(eq(questions.stage, stage));
    if (subjectId) conds.push(eq(questions.subjectId, parseInt(subjectId)));

    const all = await db.select().from(questions)
      .where(conds.length ? and(...conds) : undefined).limit(limit * 3);
    const shuffled = [...all].sort(() => Math.random() - 0.5).slice(0, limit);
    // Strip correct answer
    return NextResponse.json({ questions: shuffled.map(({ correctAnswer: _ca, ...q }) => q) });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { studentId, answers, questionIds, timeTakenSeconds } = await req.json() as {
      studentId?: number; answers: Record<string,string>; questionIds: number[]; timeTakenSeconds?: number;
    };
    if (!answers || !questionIds?.length) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const qs = await db.select().from(questions).where(inArray(questions.id, questionIds));
    let correct = 0;
    const feedback: Record<string,{correct:boolean;explanation:string;correctAnswer:string}> = {};
    for (const q of qs) {
      const ans = (answers[q.id.toString()] ?? "").trim().toLowerCase();
      const ok  = ans === q.correctAnswer.trim().toLowerCase();
      if (ok) correct++;
      feedback[q.id.toString()] = { correct: ok, explanation: q.explanation ?? "", correctAnswer: q.correctAnswer };
    }

    const total = qs.length;
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    const passed = score >= 70;
    const xpEarned = passed ? Math.max(10, correct * 10) : Math.max(0, correct * 3);

    const [attempt] = await db.insert(quizAttempts).values({
      studentId: studentId ?? 0, score, totalQuestions: total, correctAnswers: correct,
      timeTakenSeconds: timeTakenSeconds ?? null, answers, passed, xpEarned,
    }).returning();

    if (studentId && xpEarned > 0) {
      await db.update(studentProfiles).set({
        xpPoints: sql`${studentProfiles.xpPoints} + ${xpEarned}`, updatedAt: new Date(),
      }).where(eq(studentProfiles.id, studentId));
    }

    if (score === 100 && studentId) {
      const [a] = await db.select().from(achievements).where(eq(achievements.name, "Perfect Score")).limit(1);
      if (a) await db.insert(studentAchievements).values({ studentId, achievementId: a.id }).onConflictDoNothing();
    }

    return NextResponse.json({ attempt, score, correct, total, passed, xpEarned, feedback });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
