import { auth } from "@/lib/better-auth/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { rateLimit, getRequestIdentifier } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logger } from "@/lib/logger";

const handler = toNextJsHandler(auth);

// Rate limiting only for POST (login, signup, reset)
const rateLimitOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per window
};

export async function GET(request: NextRequest) {
  const url = new URL(request.url);

  // Intercept reset-password GET requests and redirect to our custom page
  // This prevents Better Auth from validating the token server-side and showing error page
  if (url.pathname.includes("/reset-password")) {
    const token = url.searchParams.get("token");
    if (token) {
      // Redirect to our custom reset page with token in path
      const baseURL = url.origin;
      const redirectUrl = `${baseURL}/auth/reset/${encodeURIComponent(token)}`;
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Handle verify-email: let Better Auth process it, then redirect nicely
  if (url.pathname.includes("/verify-email")) {
    try {
      const response = await handler.GET(request);

      // If verification succeeded (redirect response), redirect to signin with success message
      if (response.status === 302 || response.status === 301) {
        const baseURL = url.origin;
        return NextResponse.redirect(`${baseURL}/auth/signin?verified=true`);
      }

      return response;
    } catch (error: any) {
      console.error("[Auth API] Error during email verification:", error?.message || error);
      // Redirect to signin with error message
      const baseURL = url.origin;
      return NextResponse.redirect(`${baseURL}/auth/signin?error=verification-failed`);
    }
  }

  try {
    return await handler.GET(request);
  } catch (error: any) {
    console.error("[Auth API] GET error:", error?.message || error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting only for sensitive routes
    const url = new URL(request.url);
    const isAuthAction = url.pathname.includes("/sign-in") ||
      url.pathname.includes("/sign-up") ||
      url.pathname.includes("/reset-password");

    if (isAuthAction) {
      const identifier = getRequestIdentifier(request);
      const result = await rateLimit(identifier, rateLimitOptions);

      if (!result.allowed) {
        const resetDate = new Date(result.resetTime);
        return NextResponse.json(
          {
            error: "Too many attempts. Please try again later.",
            resetTime: resetDate.toISOString(),
          },
          {
            status: 429,
            headers: {
              "Retry-After": Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
              "X-RateLimit-Limit": rateLimitOptions.maxRequests.toString(),
              "X-RateLimit-Remaining": result.remaining.toString(),
              "X-RateLimit-Reset": result.resetTime.toString(),
            },
          }
        );
      }

      // Add rate limit headers to response
      try {
        const response = await handler.POST(request);

        // If response has error status, log it
        if (response.status >= 400) {
          const responseClone = response.clone();
          try {
            const errorData = await responseClone.json();
            logger.error("Auth handler returned error", null, {
              status: response.status,
              path: url.pathname,
              error: errorData,
            });
          } catch {
            logger.error("Auth handler returned error (non-JSON)", null, {
              status: response.status,
              path: url.pathname,
            });
          }
        }

        response.headers.set("X-RateLimit-Limit", rateLimitOptions.maxRequests.toString());
        response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
        response.headers.set("X-RateLimit-Reset", result.resetTime.toString());
        return response;
      } catch (handlerError: unknown) {
        logger.error("Auth handler threw error", handlerError);
        throw handlerError;
      }
    }

    return handler.POST(request);
  } catch (error: unknown) {
    logger.error("Auth API error processing request", error);

    const errorMessage = error instanceof Error ? error.message : undefined;
    const errorStack = error instanceof Error ? error.stack : undefined;

    return NextResponse.json(
      {
        error: "Internal server error",
        message: process.env.NODE_ENV === "development" ? errorMessage : undefined,
        ...(process.env.NODE_ENV === "development" && errorStack ? { stack: errorStack } : {}),
      },
      { status: 500 }
    );
  }
}

