import crypto from "crypto";
import { NextResponse } from "next/server";
import { normalizeEmail } from "@/lib/server/db";
import { setAdminSession } from "@/lib/server/session";

function safeEqual(a, b) {
  const left = crypto.createHash("sha256").update(String(a || "")).digest();
  const right = crypto.createHash("sha256").update(String(b || "")).digest();
  return crypto.timingSafeEqual(left, right);
}

export async function POST(request) {
  const { email, password } = await request.json().catch(() => ({}));
  if (typeof email !== "string" || typeof password !== "string" || email.length > 254 || password.length > 256) {
    return NextResponse.json({ message: "Invalid admin credentials." }, { status: 401 });
  }

  const adminEmail = normalizeEmail(process.env.ADMIN_EMAIL);
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return NextResponse.json({ message: "Admin login is not configured." }, { status: 500 });
  }

  if (normalizeEmail(email) !== adminEmail || !safeEqual(password, adminPassword)) {
    return NextResponse.json({ message: "Invalid admin credentials." }, { status: 401 });
  }

  await setAdminSession(adminEmail);
  return NextResponse.json({ ok: true, redirectTo: "/admin" });
}
