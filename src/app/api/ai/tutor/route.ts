import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { aiConversations } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { aiTutor } from "@/lib/ai-service";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { messages, context, studentId, lessonId, subjectId } = await req.json();
    if (!messages || !Array.isArray(messages))
      return NextResponse.json({ error: "Messages required" }, { status: 400 });

    const response = await aiTutor.chat(messages, context || {});

    // Log conversation (non-blocking)
    if (studentId) {
      db.insert(aiConversations).values({
        studentId, lessonId: lessonId ?? null, subjectId: subjectId ?? null,
        messages: [...messages, { role: "assistant", content: response.message }],
        context: context || {},
      }).catch(() => {});
    }

    return NextResponse.json({ response });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
