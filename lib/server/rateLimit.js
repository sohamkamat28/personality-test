import { updateDb } from "@/lib/server/db";

function clientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

export async function checkRateLimit(request, { key, limit, windowMs }) {
  const now = Date.now();
  const id = `${key}:${clientIp(request)}`;

  return updateDb((db) => {
    db.rateLimits = (db.rateLimits || []).filter((entry) => entry.expiresAt > now);
    const existing = db.rateLimits.find((entry) => entry.id === id);

    if (!existing) {
      db.rateLimits.push({
        id,
        count: 1,
        expiresAt: now + windowMs
      });
      return { allowed: true };
    }

    existing.count += 1;
    if (existing.count <= limit) {
      return { allowed: true };
    }

    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((existing.expiresAt - now) / 1000))
    };
  });
}

export function rateLimitResponse(retryAfter) {
  return Response.json(
    { message: "Too many attempts. Please wait a moment before trying again." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter || 60)
      }
    }
  );
}
