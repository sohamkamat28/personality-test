import { NextResponse } from "next/server";
import { getDb, normalizeEmail } from "@/lib/server/db";
import { getStudentSession } from "@/lib/server/session";

export async function GET() {
  const session = await getStudentSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const db = await getDb();
  const hasSubmitted = db.submissions.some((submission) => normalizeEmail(submission.email) === normalizeEmail(session.email));
  return NextResponse.json({ user: { email: session.email, name: session.name, hasSubmitted } });
}
