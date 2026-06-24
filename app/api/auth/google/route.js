import { NextResponse } from "next/server";
import { getDb, normalizeEmail, updateDb } from "@/lib/server/db";
import { isRuntimeConfigured } from "@/lib/server/env";
import { verifyGoogleIdToken } from "@/lib/server/google";
import { checkRateLimit, rateLimitResponse } from "@/lib/server/rateLimit";
import { createSessionId, getStudentSession, setStudentSession } from "@/lib/server/session";

const sessionTtlMs = 1000 * 60 * 60 * 8;

export async function POST(request) {
  if (!isRuntimeConfigured()) {
    return NextResponse.json({ message: "Sign-in is temporarily unavailable." }, { status: 503 });
  }

  const limit = await checkRateLimit(request, {
    key: "student-google-login",
    limit: 20,
    windowMs: 10 * 60 * 1000
  });
  if (!limit.allowed) {
    return rateLimitResponse(limit.retryAfter);
  }

  const { credential } = await request.json().catch(() => ({}));
  if (typeof credential !== "string" || credential.length < 100 || credential.length > 5000) {
    return NextResponse.json({ message: "Missing Google credential." }, { status: 400 });
  }

  const verified = await verifyGoogleIdToken(credential);
  if (!verified.ok) {
    return NextResponse.json({ message: verified.message }, { status: verified.status });
  }

  const email = normalizeEmail(verified.email);
  const db = await getDb();
  const registered = db.students.some((student) => normalizeEmail(student.email) === email);
  if (!registered) {
    return NextResponse.json({ message: "This email is not registered for the assessment." }, { status: 403 });
  }

  const hasSubmitted = db.submissions.some((submission) => normalizeEmail(submission.email) === email);
  if (hasSubmitted) {
    return NextResponse.json({ message: "This account has already submitted the assessment." }, { status: 409 });
  }

  const now = Date.now();
  const existingSession = await getStudentSession();
  const sessionId = normalizeEmail(existingSession?.email) === email && existingSession?.sessionId ? existingSession.sessionId : createSessionId();
  const result = await updateDb((database) => {
    database.activeSessions = (database.activeSessions || []).filter((session) => {
      return normalizeEmail(session.email) !== email || !session.expiresAt || new Date(session.expiresAt).getTime() > now;
    });

    const activeSession = database.activeSessions.find((session) => normalizeEmail(session.email) === email);
    if (activeSession) {
      if (activeSession.sessionId === sessionId) {
        activeSession.expiresAt = new Date(now + sessionTtlMs).toISOString();
        return { status: 200 };
      }

      return {
        status: 423,
        message: "This account is already signed in on another device. Please sign out there before continuing here."
      };
    }

    database.activeSessions.push({
      email,
      sessionId,
      name: verified.name || "",
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + sessionTtlMs).toISOString()
    });

    return { status: 200 };
  });

  if (result.status !== 200) {
    return NextResponse.json({ message: result.message }, { status: result.status });
  }

  await setStudentSession(email, verified.name, sessionId);
  return NextResponse.json({ ok: true, redirectTo: "/quiz" });
}
