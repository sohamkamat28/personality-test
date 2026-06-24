import { NextResponse } from "next/server";
import { getDb, normalizeEmail, publicStudent, updateDb } from "@/lib/server/db";
import { getAdminSession } from "@/lib/server/session";

async function requireAdmin() {
  const session = await getAdminSession();
  return Boolean(session);
}

function databaseError() {
  return NextResponse.json(
    { message: "Database connection failed. Please check MONGODB_URI and MongoDB Atlas network access." },
    { status: 503 }
  );
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const db = await getDb();
    return NextResponse.json({
      students: db.students.map((student) => publicStudent(student, db.submissions))
    });
  } catch {
    return databaseError();
  }
}

export async function POST(request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { email, name } = await request.json().catch(() => ({}));
  const normalizedEmail = normalizeEmail(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return NextResponse.json({ message: "Enter a valid student email." }, { status: 400 });
  }

  try {
    const student = await updateDb((db) => {
      const existing = db.students.find((item) => normalizeEmail(item.email) === normalizedEmail);
      if (existing) {
        existing.name = String(name || existing.name || "").trim();
        return existing;
      }

      const created = {
        email: normalizedEmail,
        name: String(name || "").trim(),
        createdAt: new Date().toISOString()
      };
      db.students.push(created);
      return created;
    });

    const db = await getDb();
    return NextResponse.json({ student: publicStudent(student, db.submissions) });
  } catch {
    return databaseError();
  }
}

export async function DELETE(request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const normalizedEmail = normalizeEmail(searchParams.get("email"));
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return NextResponse.json({ message: "Enter a valid student email to remove." }, { status: 400 });
  }

  try {
    const removed = await updateDb((db) => {
      const studentsBefore = db.students.length;
      const submissionsBefore = db.submissions.length;
      const progressBefore = (db.progress || []).length;
      const activeSessionsBefore = (db.activeSessions || []).length;

      db.students = db.students.filter((student) => normalizeEmail(student.email) !== normalizedEmail);
      db.submissions = db.submissions.filter((submission) => normalizeEmail(submission.email) !== normalizedEmail);
      db.progress = (db.progress || []).filter((progress) => normalizeEmail(progress.email) !== normalizedEmail);
      db.activeSessions = (db.activeSessions || []).filter((session) => normalizeEmail(session.email) !== normalizedEmail);

      return {
        studentRemoved: studentsBefore - db.students.length,
        submissionsRemoved: submissionsBefore - db.submissions.length,
        progressRemoved: progressBefore - db.progress.length,
        activeSessionsRemoved: activeSessionsBefore - db.activeSessions.length
      };
    });

    return NextResponse.json({ ok: true, removed });
  } catch {
    return databaseError();
  }
}
