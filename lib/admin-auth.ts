import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const ADMIN_COOKIE = "wedding_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 12;

function getAdminPassword() {
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    throw new Error("Missing ADMIN_PASSWORD");
  }

  return password;
}

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

function safeEqual(left: Buffer, right: Buffer) {
  return left.length === right.length && timingSafeEqual(left, right);
}

function signSessionPayload(payload: string) {
  return createHmac("sha256", getAdminPassword())
    .update(`ben-and-chloe-admin:${payload}`)
    .digest("base64url");
}

function createSessionToken() {
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = `v1.${expiresAt}`;

  return `${payload}.${signSessionPayload(payload)}`;
}

function verifySessionToken(token: string) {
  const [version, expiresAtValue, signature, ...extraParts] = token.split(".");
  const expiresAt = Number(expiresAtValue);

  if (
    version !== "v1" ||
    extraParts.length > 0 ||
    !signature ||
    !Number.isSafeInteger(expiresAt) ||
    expiresAt <= Date.now()
  ) {
    return false;
  }

  const payload = `${version}.${expiresAtValue}`;
  const expectedSignature = signSessionPayload(payload);

  return safeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature),
  );
}

export function verifyAdminPassword(candidate: string) {
  return safeEqual(digest(candidate), digest(getAdminPassword()));
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE)?.value;

  return Boolean(session && verifySessionToken(session));
}

export async function createAdminSession() {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
    priority: "high",
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}
