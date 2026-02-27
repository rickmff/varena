import { auth } from "@/lib/better-auth/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { rateLimit, getRequestIdentifier } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

  // Handle verify-email
  if (url.pathname.includes("/verify-email")) {
    const baseURL = url.origin;
    const acceptHeader = request.headers.get("accept") || "";
    // Direct browser navigation sends Accept: text/html; fetch/AJAX does not
    const isBrowserNavigation = acceptHeader.includes("text/html");

    if (isBrowserNavigation) {
      // For direct browser navigation (e.g. old email links hitting the API endpoint),
      // redirect to our custom verify page which has proper UI and error handling
      const token = url.searchParams.get("token");
      if (token) {
        return NextResponse.redirect(`${baseURL}/auth/verify/${encodeURIComponent(token)}`);
      }
      return NextResponse.redirect(`${baseURL}/auth/signin?error=verification-failed`);
    }

    // For API/fetch calls (from our custom verify page), pass through to Better Auth
    try {
      return await handler.GET(request);
    } catch (error: any) {
      console.error("[Auth API] Error during email verification:", error?.message || error);
      return NextResponse.json(
        { error: "Verification failed", message: error?.message },
        { status: 500 }
      );
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
      const result = rateLimit(identifier, rateLimitOptions);

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
            console.error("[Auth API] Handler returned error:", {
              status: response.status,
              path: url.pathname,
              error: errorData,
            });
          } catch (e) {
            console.error("[Auth API] Handler returned error (non-JSON):", {
              status: response.status,
              path: url.pathname,
            });
          }
        }

        response.headers.set("X-RateLimit-Limit", rateLimitOptions.maxRequests.toString());
        response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
        response.headers.set("X-RateLimit-Reset", result.resetTime.toString());
        return response;
      } catch (handlerError: any) {
        console.error("[Auth API] Handler threw error:", handlerError);
        console.error("[Auth API] Handler error stack:", handlerError?.stack);
        throw handlerError;
      }
    }

    return handler.POST(request);
  } catch (error: any) {
    console.error("[Auth API] Error processing request:", error);
    console.error("[Auth API] Error name:", error?.name);
    console.error("[Auth API] Error message:", error?.message);
    console.error("[Auth API] Error stack:", error?.stack);
    console.error("[Auth API] Error cause:", error?.cause);

    // Try to extract more details
    if (error?.message) {
      console.error("[Auth API] Full error details:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message: process.env.NODE_ENV === "development" ? error?.message : undefined,
        ...(process.env.NODE_ENV === "development" && error?.stack ? { stack: error.stack } : {}),
      },
      { status: 500 }
    );
  }
}

