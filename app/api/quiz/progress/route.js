import { NextResponse } from "next/server";
import { assessmentQuestions } from "@/data/personalityQuestions";
import { normalizeEmail, updateDb } from "@/lib/server/db";
import { getStudentSession } from "@/lib/server/session";

const allowedAnswersByQuestion = assessmentQuestions.map((question) => new Set(question.options.map((option) => option.value)));

function sanitizeAnswers(answers) {
  if (!Array.isArray(answers) || answers.length !== assessmentQuestions.length) return null;
  const sanitized = answers.map((answer, index) => {
    if (answer === null || answer === undefined || answer === "") return null;
    return allowedAnswersByQuestion[index]?.has(answer) ? answer : undefined;
  });
  return sanitized.some((answer) => answer === undefined) ? null : sanitized;
}

function sanitizeIndex(index) {
  const number = Number(index);
  if (!Number.isInteger(number)) return 0;
  return Math.min(assessmentQuestions.length - 1, Math.max(0, number));
}

function isCurrentActiveSession(db, email, sessionId) {
  const activeSession = (db.activeSessions || []).find((item) => normalizeEmail(item.email) === email);
  return (
    sessionId &&
    activeSession?.sessionId === sessionId &&
    (!activeSession.expiresAt || new Date(activeSession.expiresAt).getTime() > Date.now())
  );
}

export async function GET() {
  const session = await getStudentSession();
  if (!session) {
    return NextResponse.json({ message: "Please sign in before continuing." }, { status: 401 });
  }

  const email = normalizeEmail(session.email);
  const result = await updateDb((db) => {
    if (!isCurrentActiveSession(db, email, session.sessionId)) {
      return { status: 409, message: "This session is no longer active." };
    }

    const progress = (db.progress || []).find((item) => normalizeEmail(item.email) === email);
    return {
      status: 200,
      progress: progress
        ? {
            answers: progress.answers,
            currentIndex: progress.currentIndex,
            updatedAt: progress.updatedAt
          }
        : null
    };
  });

  if (result.status !== 200) {
    return NextResponse.json({ message: result.message }, { status: result.status });
  }

  return NextResponse.json({ progress: result.progress });
}

export async function POST(request) {
  const session = await getStudentSession();
  if (!session) {
    return NextResponse.json({ message: "Please sign in before continuing." }, { status: 401 });
  }

  const { answers, currentIndex } = await request.json().catch(() => ({}));
  const sanitizedAnswers = sanitizeAnswers(answers);
  if (!sanitizedAnswers) {
    return NextResponse.json({ message: "Progress could not be saved because one or more answers are invalid." }, { status: 400 });
  }

  const email = normalizeEmail(session.email);
  const index = sanitizeIndex(currentIndex);
  const result = await updateDb((db) => {
    const registered = db.students.some((student) => normalizeEmail(student.email) === email);
    if (!registered) return { status: 403, message: "This email is no longer registered for the assessment." };

    const alreadySubmitted = db.submissions.some((submission) => normalizeEmail(submission.email) === email);
    if (alreadySubmitted) return { status: 409, message: "This account has already submitted the assessment." };

    if (!isCurrentActiveSession(db, email, session.sessionId)) {
      return { status: 409, message: "This account is already active on another device." };
    }

    db.progress = db.progress || [];
    const existing = db.progress.find((item) => normalizeEmail(item.email) === email);
    const saved = {
      email,
      name: session.name || "",
      answers: sanitizedAnswers,
      currentIndex: index,
      updatedAt: new Date().toISOString()
    };

    if (existing) {
      Object.assign(existing, saved);
    } else {
      db.progress.push(saved);
    }

    return { status: 200, progress: saved };
  });

  if (result.status !== 200) {
    return NextResponse.json({ message: result.message }, { status: result.status });
  }

  return NextResponse.json({ ok: true, progress: result.progress });
}
