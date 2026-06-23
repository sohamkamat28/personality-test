import { NextResponse } from "next/server";
import { getDb, normalizeEmail, publicStudent, updateDb } from "@/lib/server/db";
import { getAdminSession } from "@/lib/server/session";

async function requireAdmin() {
  const session = await getAdminSession();
  return Boolean(session);
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const db = await getDb();
  return NextResponse.json({
    students: db.students.map((student) => publicStudent(student, db.submissions))
  });
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

  const removed = await updateDb((db) => {
    const studentsBefore = db.students.length;
    const submissionsBefore = db.submissions.length;

    db.students = db.students.filter((student) => normalizeEmail(student.email) !== normalizedEmail);
    db.submissions = db.submissions.filter((submission) => normalizeEmail(submission.email) !== normalizedEmail);

    return {
      studentRemoved: studentsBefore - db.students.length,
      submissionsRemoved: submissionsBefore - db.submissions.length
    };
  });

  return NextResponse.json({ ok: true, removed });
}
