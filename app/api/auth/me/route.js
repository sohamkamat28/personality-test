import { NextResponse } from "next/server";
import { getDb, normalizeEmail } from "@/lib/server/db";
import { getStudentSession } from "@/lib/server/session";

export async function GET() {
  const session = await getStudentSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const db = await getDb();
  const email = normalizeEmail(session.email);
  const activeSession = (db.activeSessions || []).find((item) => normalizeEmail(item.email) === email);
  const isCurrentSession =
    session.sessionId &&
    activeSession?.sessionId === session.sessionId &&
    (!activeSession.expiresAt || new Date(activeSession.expiresAt).getTime() > Date.now());

  if (!isCurrentSession) {
    return NextResponse.json({ message: "This session is no longer active." }, { status: 409 });
  }

  const hasSubmitted = db.submissions.some((submission) => normalizeEmail(submission.email) === email);
  const progress = (db.progress || []).find((item) => normalizeEmail(item.email) === email);

  return NextResponse.json({
    user: { email: session.email, name: session.name, hasSubmitted },
    progress: progress
      ? {
          answers: progress.answers,
          currentIndex: progress.currentIndex,
          updatedAt: progress.updatedAt
        }
      : null
  });
}
