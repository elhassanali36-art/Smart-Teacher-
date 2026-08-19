import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { aiTutor } from "@/lib/ai-service";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { problem, grade, studentAnswer } = await req.json();
    if (!problem) return NextResponse.json({ error: "Problem required" }, { status: 400 });

    if (studentAnswer !== undefined) {
      const response = await aiTutor.chat(
        [{ role: "user", content: `Math problem: "${problem}". My answer: "${studentAnswer}". Is it correct? Guide without giving the answer.` }],
        { subject: "mathematics", grade: grade || 5 }
      );
      return NextResponse.json({ response, type: "evaluation" });
    }

    const analysis = await aiTutor.analyzeMathProblem(problem, grade || 5);
    return NextResponse.json({ analysis, type: "analysis" });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
