import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { avatars } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const stage   = searchParams.get("stage");
    const premium = searchParams.get("premium");

    let all = await db.select().from(avatars).where(eq(avatars.isActive, true)).orderBy(avatars.sortOrder);
    if (stage)   all = all.filter(a => (a.stages as string[]).includes(stage));
    if (premium === "false") all = all.filter(a => !a.isPremium);
    if (premium === "true")  all = all.filter(a =>  a.isPremium);

    return NextResponse.json({ avatars: all });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
