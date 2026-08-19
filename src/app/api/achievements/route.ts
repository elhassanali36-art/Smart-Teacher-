import { NextResponse } from "next/server";
import { db } from "@/db";
import { achievements } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const all = await db.select().from(achievements).where(eq(achievements.isActive, true))
      .orderBy(achievements.category, achievements.xpReward);
    return NextResponse.json({ achievements: all });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
