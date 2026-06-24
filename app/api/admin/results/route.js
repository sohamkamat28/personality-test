import { NextResponse } from "next/server";
import { getDb } from "@/lib/server/db";
import { getAdminSession } from "@/lib/server/session";
import { assessmentQuestions } from "@/data/personalityQuestions";
import { scoreAssessment } from "@/lib/scoring";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  let db;
  try {
    db = await getDb();
  } catch {
    return NextResponse.json(
      { message: "Database connection failed. Please check MONGODB_URI and MongoDB Atlas network access." },
      { status: 503 }
    );
  }

  const results = db.submissions
    .slice()
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .map((submission) => ({
      email: submission.email,
      name: submission.name || "",
      submittedAt: submission.submittedAt,
      result: scoreAssessment(submission.answers)
    }));

  return NextResponse.json({ questions: assessmentQuestions.map((question) => question.prompt), results });
}
