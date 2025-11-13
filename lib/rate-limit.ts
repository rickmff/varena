// Simple in-memory rate limiting (suitable for development)
// For production, consider using Redis or Upstash

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitStore>();

// Clean expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of store.entries()) {
    if (value.resetTime < now) {
      store.delete(key);
    }
  }
}, 60000); // Clean every minute

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum number of requests
}

export function rateLimit(
  identifier: string,
  options: RateLimitOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 requests per window
  }
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = identifier;
  const record = store.get(key);

  if (!record || record.resetTime < now) {
    // Create new record or reset expired one
    const resetTime = now + options.windowMs;
    store.set(key, {
      count: 1,
      resetTime,
    });
    return {
      allowed: true,
      remaining: options.maxRequests - 1,
      resetTime,
    };
  }

  if (record.count >= options.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  // Increment counter
  record.count++;
  return {
    allowed: true,
    remaining: options.maxRequests - record.count,
    resetTime: record.resetTime,
  };
}

// Helper to get request IP identifier
export function getRequestIdentifier(request: Request): string {
  // Try to get real IP from header (useful when behind proxy)
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0] || realIp || "unknown";

  // Use pathname to differentiate by route
  const url = new URL(request.url);
  return `${ip}:${url.pathname}`;
}

