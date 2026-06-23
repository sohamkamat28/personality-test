import { NextResponse } from "next/server";
import { normalizeEmail } from "@/lib/server/db";
import { setAdminSession } from "@/lib/server/session";

export async function POST(request) {
  const { email, password } = await request.json().catch(() => ({}));
  const adminEmail = normalizeEmail(process.env.ADMIN_EMAIL);
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return NextResponse.json({ message: "ADMIN_EMAIL and ADMIN_PASSWORD must be configured in .env.local." }, { status: 500 });
  }

  if (normalizeEmail(email) !== adminEmail || String(password || "") !== adminPassword) {
    return NextResponse.json({ message: "Invalid admin credentials." }, { status: 401 });
  }

  await setAdminSession(adminEmail);
  return NextResponse.json({ ok: true, redirectTo: "/admin" });
}
