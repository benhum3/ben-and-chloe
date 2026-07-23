import { NextResponse } from "next/server";

import {
  createAdminSession,
  verifyAdminPassword,
} from "@/lib/admin-auth";

const MAX_ATTEMPTS = 5;
const ATTEMPT_WINDOW = 15 * 60 * 1000;
const loginAttempts = new Map<
  string,
  { attempts: number; resetsAt: number }
>();

function getClientKey(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}

export async function POST(request: Request) {
  try {
    const clientKey = getClientKey(request);
    const now = Date.now();
    const currentAttempts = loginAttempts.get(clientKey);

    if (currentAttempts && currentAttempts.resetsAt > now) {
      if (currentAttempts.attempts >= MAX_ATTEMPTS) {
        return NextResponse.json(
          { error: "Too many attempts. Please try again in 15 minutes." },
          { status: 429 },
        );
      }
    } else {
      loginAttempts.delete(clientKey);
    }

    const body = (await request.json()) as { password?: unknown };
    const password =
      typeof body.password === "string" ? body.password : "";

    if (!verifyAdminPassword(password)) {
      const attempts = loginAttempts.get(clientKey);
      loginAttempts.set(clientKey, {
        attempts: (attempts?.attempts ?? 0) + 1,
        resetsAt: attempts?.resetsAt ?? now + ATTEMPT_WINDOW,
      });

      return NextResponse.json(
        { error: "Incorrect password." },
        { status: 401 },
      );
    }

    await createAdminSession();
    loginAttempts.delete(clientKey);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin login failed:", error);

    return NextResponse.json(
      { error: "Unable to sign in." },
      { status: 500 },
    );
  }
}
