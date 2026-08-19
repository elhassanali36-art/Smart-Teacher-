// AI Service abstraction layer
// Provides fallback behavior when external AI APIs are unavailable

export interface TutorMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface TutorResponse {
  message: string;
  hints?: string[];
  nextStep?: string;
  isCorrect?: boolean;
  feedback?: string;
  encouragement?: string;
}

export interface MathProblemAnalysis {
  problem: string;
  steps: string[];
  answer: string;
  explanation: string;
  difficulty: string;
}

export interface PersonalizationData {
  studentLevel: string;
  weakSubjects: string[];
  recentScores: number[];
  completedLessons: number;
  streakDays: number;
}

// ─── Math Tutor (Fallback) ─────────────────────────────────────────────────

function analyzeMathProblemFallback(problem: string): MathProblemAnalysis {
  return {
    problem,
    steps: [
      "Read the problem carefully",
      "Identify what you need to find",
      "Choose the right method",
      "Solve step by step",
      "Check your answer",
    ],
    answer: "Work through the steps above",
    explanation:
      "Break the problem into smaller parts and solve each one carefully.",
    difficulty: "intermediate",
  };
}

// ─── AI Tutor Service ──────────────────────────────────────────────────────

class AITutorService {
  private openaiKey: string | undefined;

  constructor() {
    this.openaiKey = process.env.OPENAI_API_KEY;
  }

  async chat(
    messages: TutorMessage[],
    context: {
      subject?: string;
      grade?: number;
      stage?: string;
      studentLevel?: string;
    }
  ): Promise<TutorResponse> {
    if (this.openaiKey) {
      try {
        return await this.chatWithOpenAI(messages, context);
      } catch (error) {
        console.error("OpenAI error, using fallback:", error);
      }
    }
    return this.fallbackResponse(messages, context);
  }

  private async chatWithOpenAI(
    messages: TutorMessage[],
    context: {
      subject?: string;
      grade?: number;
      stage?: string;
      studentLevel?: string;
    }
  ): Promise<TutorResponse> {
    const systemPrompt = this.buildSystemPrompt(context);
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    return {
      message: content,
      encouragement: this.getEncouragement(),
    };
  }

  private buildSystemPrompt(context: {
    subject?: string;
    grade?: number;
    stage?: string;
    studentLevel?: string;
  }): string {
    const { subject, grade, stage, studentLevel } = context;
    return `You are a patient, encouraging AI tutor for a ${stage || "primary"} school student in grade ${grade || 1}.
Subject: ${subject || "General"}
Student level: ${studentLevel || "beginner"}

Rules:
- Never give away the full answer directly. Guide the student step by step.
- Ask clarifying questions to help them think.
- Give hints, not solutions.
- Use simple language appropriate for the grade level.
- Be encouraging and positive.
- If they are wrong, gently explain why and guide them to try again.
- Keep responses concise and age-appropriate.`;
  }

  private fallbackResponse(
    messages: TutorMessage[],
    context: {
      subject?: string;
      grade?: number;
      stage?: string;
    }
  ): TutorResponse {
    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || "";
    const subject = context.subject?.toLowerCase() || "general";

    // Smart fallback responses based on context
    if (lastMessage.includes("help") || lastMessage.includes("don't understand")) {
      return {
        message: `That's a great question! Let's break it down step by step. First, can you tell me what part is confusing you? Sometimes when we identify the exact tricky part, the answer becomes clearer! 🤔`,
        encouragement: this.getEncouragement(),
        hints: ["Try re-reading the question", "Look for key words", "Draw a picture if it helps"],
      };
    }

    if (lastMessage.includes("correct") || lastMessage.includes("right") || lastMessage.includes("yes")) {
      return {
        message: `Excellent work! You're thinking about this the right way! 🌟 Let's take this one step further. Can you explain WHY that's the answer? Understanding the reason will help you solve similar problems in the future.`,
        encouragement: "You're doing amazing!",
        isCorrect: true,
      };
    }

    if (subject === "math" || subject === "mathematics") {
      return {
        message: `Great effort! In mathematics, every problem has a logical path to the solution. Let's think about this together:\n\n1️⃣ What information do we have?\n2️⃣ What are we trying to find?\n3️⃣ Which math operation might help us?\n\nTake your time — there's no rush! What's your first thought? 💭`,
        hints: ["Write down what you know", "Try drawing the problem", "Think about similar examples"],
        encouragement: this.getEncouragement(),
      };
    }

    if (subject === "english" || subject === "arabic") {
      return {
        message: `Language learning takes practice and patience! 📚 Let's work through this together. Reading the sentence aloud can often help you understand it better. Would you like to try that? Or shall I give you a hint about the grammar rule involved?`,
        hints: ["Read it aloud", "Look for the subject and verb", "Check the tense"],
        encouragement: this.getEncouragement(),
      };
    }

    return {
      message: `I can see you're working hard on this! 💪 Let's think about it together. What do you already know about this topic? Sometimes starting with what we know helps us figure out what we don't know yet.`,
      encouragement: this.getEncouragement(),
      hints: ["Think about what you've learned before", "Break it into smaller steps"],
    };
  }

  private getEncouragement(): string {
    const phrases = [
      "Keep going, you're doing great! 🌟",
      "Every mistake is a learning opportunity! 💡",
      "You can do this! I believe in you! 🎯",
      "Great thinking! 🧠",
      "Amazing effort! 🏆",
      "You're getting closer! 🎉",
      "Stay curious! 🔍",
      "Learning takes practice, and you're practicing! ✨",
    ];
    return phrases[Math.floor(Math.random() * phrases.length)];
  }

  async analyzeMathProblem(problem: string, grade: number): Promise<MathProblemAnalysis> {
    if (this.openaiKey) {
      try {
        const response = await this.chat(
          [{ role: "user", content: `Analyze this math problem for a grade ${grade} student: ${problem}. Provide step-by-step guidance (not the answer).` }],
          { subject: "mathematics", grade }
        );
        return {
          problem,
          steps: response.hints || ["Identify the problem", "Choose a method", "Solve step by step"],
          answer: "Work through the steps to discover the answer",
          explanation: response.message,
          difficulty: "intermediate",
        };
      } catch {
        return analyzeMathProblemFallback(problem);
      }
    }
    return analyzeMathProblemFallback(problem);
  }

  async generateRecommendations(data: PersonalizationData): Promise<string[]> {
    const recommendations: string[] = [];

    if (data.weakSubjects.length > 0) {
      recommendations.push(`Focus on ${data.weakSubjects[0]} — it needs some extra practice`);
    }
    if (data.streakDays > 0) {
      recommendations.push(`Great job keeping a ${data.streakDays}-day streak! Keep it going!`);
    }
    if (data.recentScores.length > 0) {
      const avg = data.recentScores.reduce((a, b) => a + b, 0) / data.recentScores.length;
      if (avg < 70) {
        recommendations.push("Review recent lessons before moving forward");
      } else if (avg > 85) {
        recommendations.push("You're ready for more challenging content!");
      }
    }
    if (recommendations.length === 0) {
      recommendations.push("Keep up the great work and explore new subjects!");
    }
    return recommendations;
  }
}

export const aiTutor = new AITutorService();

// ─── Speech Service (Abstraction) ─────────────────────────────────────────

export interface SpeechServiceConfig {
  apiKey?: string;
  language?: string;
}

class SpeechService {
  isAvailable(): boolean {
    return typeof window !== "undefined" && "SpeechRecognition" in window || "webkitSpeechRecognition" in (window || {});
  }

  isTTSAvailable(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  speak(text: string, lang: string = "en-US", rate: number = 0.9): void {
    if (!this.isTTSAvailable()) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  }

  stop(): void {
    if (this.isTTSAvailable()) {
      window.speechSynthesis.cancel();
    }
  }
}

export const speechService = new SpeechService();
