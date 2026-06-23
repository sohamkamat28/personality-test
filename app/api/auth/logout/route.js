import { NextResponse } from "next/server";
import { normalizeEmail, updateDb } from "@/lib/server/db";
import { clearStudentSession, getStudentSession } from "@/lib/server/session";

export async function POST() {
  const session = await getStudentSession();
  if (session?.email && session?.sessionId) {
    const email = normalizeEmail(session.email);
    await updateDb((db) => {
      db.activeSessions = (db.activeSessions || []).filter((item) => {
        return normalizeEmail(item.email) !== email || item.sessionId !== session.sessionId;
      });
    });
  }

  await clearStudentSession();
  return NextResponse.json({ ok: true });
}
