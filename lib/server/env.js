export const requiredProductionEnv = [
  "NEXT_PUBLIC_GOOGLE_CLIENT_ID",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
  "COOKIE_SECRET"
];

export function missingProductionEnv() {
  if (process.env.NODE_ENV !== "production") return [];
  const missing = requiredProductionEnv.filter((key) => !String(process.env[key] || "").trim());
  if (process.env.COOKIE_SECRET && process.env.COOKIE_SECRET.length < 32) {
    missing.push("COOKIE_SECRET");
  }
  return [...new Set(missing)];
}

export function isRuntimeConfigured() {
  return missingProductionEnv().length === 0;
}
