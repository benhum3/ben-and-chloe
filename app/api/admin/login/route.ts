import { NextResponse } from "next/server";

import {
  createAdminSession,
  verifyAdminPassword,
} from "@/lib/admin-auth";
import {
  clearRateLimit,
  consumeRateLimit,
} from "@/lib/rate-limit";

const MAX_ATTEMPTS = 5;
const ATTEMPT_WINDOW = 15 * 60 * 1000;
const RATE_LIMIT_NAMESPACE = "admin-login";

export async function POST(request: Request) {
  try {
    const rateLimit = consumeRateLimit(request, {
      namespace: RATE_LIMIT_NAMESPACE,
      limit: MAX_ATTEMPTS,
      windowMs: ATTEMPT_WINDOW,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again in 15 minutes." },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfter) },
        },
      );
    }

    const body = (await request.json()) as { password?: unknown };
    const password =
      typeof body.password === "string" ? body.password : "";

    if (!verifyAdminPassword(password)) {
      return NextResponse.json(
        { error: "Incorrect password." },
        { status: 401 },
      );
    }

    await createAdminSession();
    clearRateLimit(request, RATE_LIMIT_NAMESPACE);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin login failed:", error);

    return NextResponse.json(
      { error: "Unable to sign in." },
      { status: 500 },
    );
  }
}
