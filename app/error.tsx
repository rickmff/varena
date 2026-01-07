"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service in production
    if (process.env.NODE_ENV === "production") {
      // Could integrate with Sentry, LogRocket, etc.
      console.error("Application error:", error.digest);
    } else {
      console.error("Application error:", error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-destructive/20 flex items-center justify-center">
              <AlertTriangle className="w-12 h-12 text-destructive" />
            </div>
            <div className="absolute inset-0 rounded-full bg-destructive/10 animate-ping" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground font-[family-name:var(--font-junge)]">
            Something went wrong
          </h1>
          <p className="text-muted-foreground">
            An unexpected error occurred. Don&apos;t worry, your progress is safe.
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground/60 font-mono">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            variant="default"
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <Button
            asChild
            variant="outline"
            className="gap-2"
          >
            <Link href="/">
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          </Button>
        </div>

        {/* Decorative blood drip effect */}
        <div className="absolute top-0 left-0 w-full h-1 overflow-hidden pointer-events-none">
          <div className="blood-drip" style={{ left: "10%", animationDelay: "0s" }} />
          <div className="blood-drip" style={{ left: "30%", animationDelay: "2s" }} />
          <div className="blood-drip" style={{ left: "70%", animationDelay: "4s" }} />
          <div className="blood-drip" style={{ left: "90%", animationDelay: "6s" }} />
        </div>
      </div>
    </div>
  );
}

