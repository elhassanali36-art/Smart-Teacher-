import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, studentProfiles } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { hashPassword } from "@/lib/auth";
import { eq } from "drizzle-orm";

const STUDENT_FIELDS = {
  id: studentProfiles.id, userId: studentProfiles.userId,
  displayName: studentProfiles.displayName, grade: studentProfiles.grade,
  stage: studentProfiles.stage, age: studentProfiles.age,
  preferredLanguage: studentProfiles.preferredLanguage,
  learningLevel: studentProfiles.learningLevel, xpPoints: studentProfiles.xpPoints,
  streakDays: studentProfiles.streakDays, totalStudyMinutes: studentProfiles.totalStudyMinutes,
  selectedAvatarId: studentProfiles.selectedAvatarId,
  weakSubjects: studentProfiles.weakSubjects, strongSubjects: studentProfiles.strongSubjects,
  microphoneAllowed: studentProfiles.microphoneAllowed, cameraAllowed: studentProfiles.cameraAllowed,
  maxDailyMinutes: studentProfiles.maxDailyMinutes, lastActiveDate: studentProfiles.lastActiveDate,
  parentId: studentProfiles.parentId,
} as const;

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.role !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const rows = await db.select(STUDENT_FIELDS).from(studentProfiles);
    return NextResponse.json({ students: rows });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { displayName, grade, stage, age, preferredLanguage } = body;
    if (!displayName || !grade || !stage)
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const email = `student_${Date.now()}@edulearn.ai`;
    const passwordHash = await hashPassword(`pwd${Date.now()}`);
    const nameParts = displayName.split(" ");
    const [studentUser] = await db.insert(users).values({
      email, passwordHash, role: "student",
      firstName: nameParts[0] || displayName,
      lastName: nameParts.slice(1).join(" ") || "",
    }).returning();

    const [profile] = await db.insert(studentProfiles).values({
      userId: studentUser.id,
      parentId: studentUser.id,
      displayName,
      grade: parseInt(grade),
      stage: stage as "kindergarten"|"primary"|"middle"|"high",
      age: age ? parseInt(age) : null,
      preferredLanguage: preferredLanguage || "en",
    }).returning();

    return NextResponse.json({ student: profile });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
