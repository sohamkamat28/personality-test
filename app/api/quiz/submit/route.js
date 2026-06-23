import { NextResponse } from "next/server";
import { assessmentQuestions } from "@/data/personalityQuestions";
import { normalizeEmail, updateDb } from "@/lib/server/db";
import { getStudentSession } from "@/lib/server/session";

const allowedAnswersByQuestion = assessmentQuestions.map((question) => new Set(question.options.map((option) => option.value)));

export async function POST(request) {
  const session = await getStudentSession();
  if (!session) {
    return NextResponse.json({ message: "Please sign in before submitting." }, { status: 401 });
  }

  const { answers } = await request.json().catch(() => ({}));
  if (
    !Array.isArray(answers) ||
    answers.length !== assessmentQuestions.length ||
    answers.some((answer, index) => !allowedAnswersByQuestion[index]?.has(answer))
  ) {
    return NextResponse.json({ message: `Please answer all ${assessmentQuestions.length} questions before submitting.` }, { status: 400 });
  }

  const email = normalizeEmail(session.email);
  const result = await updateDb((db) => {
    const registered = db.students.some((student) => normalizeEmail(student.email) === email);
    if (!registered) return { status: 403, message: "This email is no longer registered for the assessment." };

    const alreadySubmitted = db.submissions.some((submission) => normalizeEmail(submission.email) === email);
    if (alreadySubmitted) return { status: 409, message: "This account has already submitted the assessment." };

    db.submissions.push({
      email,
      name: session.name || "",
      answers,
      submittedAt: new Date().toISOString(),
      userAgent: ""
    });

    return { status: 200 };
  });

  if (result.status !== 200) {
    return NextResponse.json({ message: result.message }, { status: result.status });
  }

  return NextResponse.json({
    ok: true,
    message: "Thank you for completing the assessment. Your responses have been recorded successfully, and we will get back to you soon to discuss your results with care and clarity."
  });
}
