import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const [sub] = await db.select().from(subscriptions)
      .where(eq(subscriptions.parentId, session.userId)).limit(1);
    return NextResponse.json({ subscription: sub ?? null });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin")
      return NextResponse.json({ error: "Unauthorized — admin only" }, { status: 401 });

    const { plan } = await req.json() as { plan: "monthly" | "yearly" };
    if (!["monthly", "yearly"].includes(plan))
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

    const start = new Date();
    const end   = new Date();
    end.setMonth(end.getMonth() + (plan === "yearly" ? 12 : 1));

    const [existing] = await db.select().from(subscriptions)
      .where(eq(subscriptions.parentId, session.userId)).limit(1);

    if (existing) {
      await db.update(subscriptions).set({
        plan, status: "active", aiAvatarEnabled: true,
        currentPeriodStart: start, currentPeriodEnd: end, updatedAt: new Date(),
      }).where(eq(subscriptions.parentId, session.userId));
    } else {
      await db.insert(subscriptions).values({
        parentId: session.userId, plan, status: "active", aiAvatarEnabled: true,
        currentPeriodStart: start, currentPeriodEnd: end,
      });
    }

    const [sub] = await db.select().from(subscriptions)
      .where(eq(subscriptions.parentId, session.userId)).limit(1);
    return NextResponse.json({ subscription: sub, success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await db.update(subscriptions).set({
      status: "cancelled", aiAvatarEnabled: false,
      cancelledAt: new Date(), updatedAt: new Date(),
    }).where(eq(subscriptions.parentId, session.userId));
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
