/**
 * Rate limiting with Vercel KV (Redis)
 * Falls back to in-memory storage in development or if KV is not configured
 */

import { kv } from "@vercel/kv";

interface RateLimitStore {
  count: number;
  resetTime: number;
}

// In-memory fallback for development
const memoryStore = new Map<string, RateLimitStore>();

// Check if Vercel KV is configured
const isKvConfigured = Boolean(
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
);

// Clean expired entries periodically (only for in-memory fallback)
if (typeof setInterval !== "undefined" && !isKvConfigured) {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of memoryStore.entries()) {
      if (value.resetTime < now) {
        memoryStore.delete(key);
      }
    }
  }, 60000); // Clean every minute
}

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum number of requests
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * Rate limit using Vercel KV (Redis)
 */
async function rateLimitWithKv(
  identifier: string,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const now = Date.now();
  const key = `ratelimit:${identifier}`;

  try {
    // Get current record
    const record = await kv.get<RateLimitStore>(key);

    if (!record || record.resetTime < now) {
      // Create new record or reset expired one
      const resetTime = now + options.windowMs;
      const newRecord: RateLimitStore = { count: 1, resetTime };

      // Set with expiration (in seconds)
      await kv.set(key, newRecord, { ex: Math.ceil(options.windowMs / 1000) });

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
    const updatedRecord: RateLimitStore = {
      count: record.count + 1,
      resetTime: record.resetTime,
    };

    // Update with remaining TTL
    const ttl = Math.ceil((record.resetTime - now) / 1000);
    await kv.set(key, updatedRecord, { ex: ttl > 0 ? ttl : 1 });

    return {
      allowed: true,
      remaining: options.maxRequests - updatedRecord.count,
      resetTime: record.resetTime,
    };
  } catch (error) {
    // If KV fails, allow the request but log the error
    if (process.env.NODE_ENV === "development") {
      console.error("[Rate Limit] KV error, falling back to allow:", error);
    }
    return {
      allowed: true,
      remaining: options.maxRequests,
      resetTime: now + options.windowMs,
    };
  }
}

/**
 * Rate limit using in-memory storage (fallback)
 */
function rateLimitInMemory(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const key = identifier;
  const record = memoryStore.get(key);

  if (!record || record.resetTime < now) {
    // Create new record or reset expired one
    const resetTime = now + options.windowMs;
    memoryStore.set(key, { count: 1, resetTime });
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

/**
 * Rate limit a request by identifier
 * Uses Vercel KV in production, falls back to in-memory in development
 */
export async function rateLimit(
  identifier: string,
  options: RateLimitOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 requests per window
  }
): Promise<RateLimitResult> {
  if (isKvConfigured) {
    return rateLimitWithKv(identifier, options);
  }
  return rateLimitInMemory(identifier, options);
}

/**
 * Synchronous rate limit (in-memory only, for backwards compatibility)
 * @deprecated Use async rateLimit() instead
 */
export function rateLimitSync(
  identifier: string,
  options: RateLimitOptions = {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
  }
): RateLimitResult {
  return rateLimitInMemory(identifier, options);
}

/**
 * Helper to get request IP identifier
 */
export function getRequestIdentifier(request: Request): string {
  // Try to get real IP from header (useful when behind proxy)
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0] || realIp || "unknown";

  // Use pathname to differentiate by route
  const url = new URL(request.url);
  return `${ip}:${url.pathname}`;
}

/**
 * Create rate limit response headers
 */
export function getRateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    "X-RateLimit-Limit": String(result.remaining + (result.allowed ? 0 : 1)),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetTime / 1000)),
  };
}
