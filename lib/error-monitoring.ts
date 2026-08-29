import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";

type ErrorSeverity = "warning" | "error" | "critical";
type ErrorMetadataValue = string | number | boolean | null;

type AppErrorEvent = {
  source: string;
  message: string;
  severity?: ErrorSeverity;
  statusCode?: number;
  metadata?: Record<string, ErrorMetadataValue>;
};

function truncate(value: string, maxLength: number) {
  return value.trim().slice(0, maxLength);
}

async function createFingerprint(value: string) {
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );

  return Array.from(new Uint8Array(hash), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export async function recordAppError({
  source,
  message,
  severity = "error",
  statusCode,
  metadata = {},
}: AppErrorEvent) {
  const safeSource = truncate(source, 120) || "unknown";
  const safeMessage = truncate(message, 240) || "Unexpected application error";
  const fingerprint = await createFingerprint(
    `${safeSource}:${safeMessage}`,
  );

  try {
    const { error } = await supabaseAdmin.from("app_error_events").insert({
      source: safeSource,
      message: safeMessage,
      severity,
      status_code: statusCode ?? null,
      fingerprint,
      metadata: {
        ...metadata,
        environment:
          process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown",
        deployment:
          process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ?? null,
      },
    });

    if (error) {
      console.warn("Error monitor could not store an event:", error.code);
      return;
    }

    if (Math.random() < 0.05) {
      const { error: cleanupError } = await supabaseAdmin.rpc(
        "cleanup_app_error_events",
      );

      if (cleanupError) {
        console.warn("Error monitor cleanup failed:", cleanupError.code);
      }
    }
  } catch (monitoringError) {
    console.warn(
      "Error monitor failed safely:",
      monitoringError instanceof Error
        ? monitoringError.name
        : "Unknown monitoring error",
    );
  }
}
