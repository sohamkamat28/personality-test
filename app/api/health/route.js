import { NextResponse } from "next/server";
import { missingProductionEnv } from "@/lib/server/env";

export async function GET() {
  const missing = missingProductionEnv();
  if (missing.length > 0) {
    return NextResponse.json({ ok: false, message: "Runtime is not fully configured." }, { status: 503 });
  }

  return NextResponse.json(
    { ok: true },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
