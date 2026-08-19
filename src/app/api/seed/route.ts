import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  subjects, avatars, achievements, lessons, questions,
  users, studentProfiles, systemSettings,
} from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { defaultSubjects, defaultAvatars, defaultAchievements, defaultLessons, defaultQuestions } from "@/lib/seed-data";
import { eq, sql } from "drizzle-orm";

export async function POST() {
  try {
    // ── Clear in dependency order ──────────────────────────────────────────────
    await db.delete(questions);
    await db.delete(lessons);
    await db.delete(subjects);
    await db.delete(avatars);
    await db.delete(achievements);

    // ── 1. Subjects ────────────────────────────────────────────────────────────
    for (const s of defaultSubjects) {
      await db.insert(subjects).values({
        name: s.name, nameAr: s.nameAr, slug: s.slug,
        description: s.description, iconEmoji: s.iconEmoji,
        color: s.color, stages: s.stages, sortOrder: s.sortOrder, isActive: true,
      });
    }

    // ── 2. Avatars ─────────────────────────────────────────────────────────────
    for (const a of defaultAvatars) {
      await db.insert(avatars).values({
        name: a.name, nameAr: a.nameAr,
        type: a.type as "cartoon" | "ai_human" | "professional",
        gender: a.gender, description: a.description,
        emoji: a.emoji ?? null, imageUrl: a.imageUrl ?? null,
        voiceTone: a.voiceTone, stages: a.stages,
        isPremium: a.isPremium, isActive: true, sortOrder: a.sortOrder,
      });
    }

    // ── 3. Achievements ────────────────────────────────────────────────────────
    for (const a of defaultAchievements) {
      await db.insert(achievements).values({
        name: a.name, nameAr: a.nameAr,
        description: a.description, descriptionAr: a.descriptionAr,
        iconEmoji: a.iconEmoji, category: a.category,
        xpReward: a.xpReward, condition: a.condition, isActive: true,
      });
    }

    // ── 4. Lessons ─────────────────────────────────────────────────────────────
    const allSubjects = await db.select().from(subjects);
    const slugToId    = Object.fromEntries(allSubjects.map(s => [s.slug, s.id]));

    for (const l of defaultLessons) {
      const subjectId = slugToId[l.subjectSlug] ?? allSubjects[0]?.id;
      if (!subjectId) continue;
      await db.insert(lessons).values({
        subjectId, title: l.title, titleAr: l.titleAr,
        description: l.description, content: l.content,
        stage: l.stage, grade: l.grade, difficulty: l.difficulty,
        contentType: l.contentType, durationMinutes: l.durationMinutes,
        xpReward: l.xpReward, isPublished: l.isPublished, sortOrder: l.sortOrder,
      });
    }

    // ── 5. Questions ───────────────────────────────────────────────────────────
    const allLessons = await db.select().from(lessons);
    for (const q of defaultQuestions) {
      const subjectId  = slugToId[q.subjectSlug] ?? allSubjects[0]?.id;
      const lessonMatch = allLessons.find(l => l.stage === q.stage && l.grade === q.grade);
      await db.insert(questions).values({
        lessonId: lessonMatch?.id ?? null,
        subjectId: subjectId ?? null,
        text: q.text, type: q.type, options: q.options,
        correctAnswer: q.correctAnswer, explanation: q.explanation,
        difficulty: q.difficulty, grade: q.grade, stage: q.stage,
        xpReward: q.xpReward, hints: q.hints ?? [],
      });
    }

    // ── 6. Demo Users — Admin + Student ONLY (no Parent/Teacher) ──────────────
    const demoUsers: Array<{
      email: string; password: string;
      role: "admin" | "student";
      firstName: string; lastName: string;
    }> = [
      { email: "admin@edulearn.ai",   password: "admin123",   role: "admin",   firstName: "Admin",  lastName: "EduLearn" },
      { email: "student@edulearn.ai", password: "student123", role: "student", firstName: "Layla",  lastName: "Al-Rashid" },
    ];

    const created: Record<string, typeof users.$inferSelect> = {};
    for (const u of demoUsers) {
      const [ex] = await db.select().from(users).where(eq(users.email, u.email)).limit(1);
      if (ex) { created[u.role] = ex; continue; }
      const hash = await hashPassword(u.password);
      const [nu]  = await db.insert(users).values({
        email: u.email, passwordHash: hash, role: u.role,
        firstName: u.firstName, lastName: u.lastName,
      }).returning();
      created[u.role] = nu;
    }

    // ── 7. Demo Student Profile ────────────────────────────────────────────────
    const studentUser = created["student"];
    if (studentUser) {
      const [ex] = await db.select().from(studentProfiles)
        .where(eq(studentProfiles.userId, studentUser.id)).limit(1);
      if (!ex) {
        await db.insert(studentProfiles).values({
          userId: studentUser.id,
          parentId: studentUser.id,     // self-managed
          displayName: "Layla Al-Rashid",
          grade: 5, stage: "primary", age: 10,
          preferredLanguage: "en", learningLevel: "intermediate",
          xpPoints: 350, streakDays: 5,
        });
      }
    }

    // ── 8. System Settings ─────────────────────────────────────────────────────
    const settings = [
      { key: "platform_name",    value: "EduLearn AI",    description: "Platform name" },
      { key: "curriculum",       value: "british",         description: "Curriculum standard" },
      { key: "ai_tutor_enabled", value: "true",            description: "AI tutor enabled" },
      { key: "monthly_price",    value: "100",             description: "Monthly price USD" },
      { key: "yearly_price",     value: "1000",            description: "Yearly price USD" },
    ];
    for (const s of settings) {
      await db.insert(systemSettings).values(s)
        .onConflictDoUpdate({
          target: systemSettings.key,
          set:    { value: s.value, updatedAt: sql`now()` },
        });
    }

    return NextResponse.json({
      success: true,
      message: "EduLearn AI seeded — Admin & Student accounts only",
      counts: {
        subjects:     allSubjects.length,
        lessons:      defaultLessons.length,
        questions:    defaultQuestions.length,
        achievements: defaultAchievements.length,
      },
      accounts: {
        admin:   { email: "admin@edulearn.ai",   password: "admin123" },
        student: { email: "student@edulearn.ai", password: "student123" },
      },
      pricing: {
        monthly: "$100/month",
        yearly:  "$1000/year (save $200)",
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
