import { NextResponse } from "next/server";
import { getDb, normalizeEmail } from "@/lib/server/db";
import { verifyGoogleIdToken } from "@/lib/server/google";
import { setStudentSession } from "@/lib/server/session";

export async function POST(request) {
  const { credential } = await request.json().catch(() => ({}));
  if (!credential) {
    return NextResponse.json({ message: "Missing Google credential." }, { status: 400 });
  }

  const verified = await verifyGoogleIdToken(credential);
  if (!verified.ok) {
    return NextResponse.json({ message: verified.message }, { status: verified.status });
  }

  const db = await getDb();
  const email = normalizeEmail(verified.email);
  const registered = db.students.some((student) => normalizeEmail(student.email) === email);
  if (!registered) {
    return NextResponse.json({ message: "This email is not registered for the assessment." }, { status: 403 });
  }

  const hasSubmitted = db.submissions.some((submission) => normalizeEmail(submission.email) === email);
  if (hasSubmitted) {
    return NextResponse.json({ message: "This account has already submitted the assessment." }, { status: 409 });
  }

  await setStudentSession(email, verified.name);
  return NextResponse.json({ ok: true, redirectTo: "/quiz" });
}
