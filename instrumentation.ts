import type { Instrumentation } from "next";

export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  if (process.env.NEXT_RUNTIME === "edge") return;

  const { recordAppError } = await import("@/lib/error-monitoring");
  const digest =
    typeof error === "object" && error !== null && "digest" in error
      ? String(error.digest).slice(0, 120)
      : null;

  await recordAppError({
    source: context.routePath || request.path.split("?")[0] || "server",
    message:
      error instanceof Error
        ? `Unhandled ${error.name}`
        : "Unhandled server error",
    severity: "critical",
    statusCode: 500,
    metadata: {
      method: request.method,
      routeType: context.routeType,
      digest,
    },
  });
};
