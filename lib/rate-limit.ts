import "server-only";

type RateLimitEntry = {
  attempts: number;
  resetsAt: number;
};

type RateLimitOptions = {
  namespace: string;
  limit: number;
  windowMs: number;
};

const attempts = new Map<string, RateLimitEntry>();
const MAX_TRACKED_CLIENTS = 5_000;

function getClientAddress(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}

function removeExpiredEntries(now: number) {
  for (const [key, entry] of attempts) {
    if (entry.resetsAt <= now) attempts.delete(key);
  }
}

export function consumeRateLimit(
  request: Request,
  { namespace, limit, windowMs }: RateLimitOptions,
) {
  const now = Date.now();

  if (attempts.size >= MAX_TRACKED_CLIENTS) {
    removeExpiredEntries(now);
  }

  const key = `${namespace}:${getClientAddress(request)}`;
  const current = attempts.get(key);

  if (!current && attempts.size >= MAX_TRACKED_CLIENTS) {
    const oldestKey = attempts.keys().next().value;
    if (oldestKey) attempts.delete(oldestKey);
  }

  if (!current || current.resetsAt <= now) {
    attempts.set(key, { attempts: 1, resetsAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }

  if (current.attempts >= limit) {
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((current.resetsAt - now) / 1000)),
    };
  }

  current.attempts += 1;
  return { allowed: true, retryAfter: 0 };
}

export function clearRateLimit(request: Request, namespace: string) {
  attempts.delete(`${namespace}:${getClientAddress(request)}`);
}
