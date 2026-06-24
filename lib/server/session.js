import crypto from "crypto";
import { cookies } from "next/headers";

const studentCookie = "typescope_student";
const adminCookie = "typescope_admin";

function secret() {
  if (process.env.COOKIE_SECRET && process.env.COOKIE_SECRET.length >= 32) return process.env.COOKIE_SECRET;
  return process.env.ADMIN_PASSWORD || "development-only-change-this-secret";
}

function sign(value) {
  return crypto.createHmac("sha256", secret()).update(value).digest("base64url");
}

function encodeSession(payload) {
  const value = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${value}.${sign(value)}`;
}

function decodeSession(token) {
  if (!token || !token.includes(".")) return null;
  const [value, signature] = token.split(".");
  const expected = sign(value);
  if (!value || !signature || signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    if (payload.expiresAt && Date.now() > payload.expiresAt) return null;
    return payload;
  } catch {
    return null;
  }
}

async function cookieStore() {
  return cookies();
}

export function createSessionId() {
  return crypto.randomBytes(24).toString("base64url");
}

export async function setStudentSession(email, name, sessionId = createSessionId()) {
  const store = await cookieStore();
  store.set(studentCookie, encodeSession({ role: "student", email, name, sessionId, expiresAt: Date.now() + 1000 * 60 * 60 * 8 }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });
  return sessionId;
}

export async function setAdminSession(email) {
  const store = await cookieStore();
  store.set(adminCookie, encodeSession({ role: "admin", email, expiresAt: Date.now() + 1000 * 60 * 60 * 6 }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 6
  });
}

export async function getStudentSession() {
  const store = await cookieStore();
  const payload = decodeSession(store.get(studentCookie)?.value);
  return payload?.role === "student" ? payload : null;
}

export async function getAdminSession() {
  const store = await cookieStore();
  const payload = decodeSession(store.get(adminCookie)?.value);
  return payload?.role === "admin" ? payload : null;
}

export async function clearStudentSession() {
  const store = await cookieStore();
  store.delete(studentCookie);
}

export async function clearAdminSession() {
  const store = await cookieStore();
  store.delete(adminCookie);
}
