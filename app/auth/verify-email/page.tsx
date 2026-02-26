"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { authClient } from "@/lib/better-auth/client";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import NavBar from "@/components/NavBar";

const RESEND_COOLDOWN_SECONDS = 60;

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = useCallback(async () => {
    if (!email) {
      toast.error("No email address found. Please try signing up again.");
      return;
    }
    if (cooldown > 0 || resending) return;

    setResending(true);
    try {
      const result = await authClient.sendVerificationEmail({ email });
      if (result.error) {
        toast.error(result.error.message || "Failed to resend verification email");
      } else {
        toast.success("Verification email sent! Please check your inbox.");
        setCooldown(RESEND_COOLDOWN_SECONDS);
      }
    } catch (error: any) {
      if (error?.status === 429) {
        toast.error("Too many attempts. Please try again later.");
        setCooldown(RESEND_COOLDOWN_SECONDS);
      } else {
        toast.error(error.message || "Failed to resend verification email");
      }
    } finally {
      setResending(false);
    }
  }, [email, cooldown, resending]);

  const maskedEmail = email
    ? email.replace(/^(.{2})(.*)(@.*)$/, (_, start, middle, domain) =>
        start + "*".repeat(Math.min(middle.length, 5)) + domain
      )
    : "";

  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar />
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-32 overflow-hidden bg-gradient-to-b from-black to-black flex items-center justify-center">
        <div className="container mx-auto px-4 relative z-10 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-[#5865F2]/10 p-4">
                  <Mail className="h-10 w-10 text-[#5865F2]" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
              <CardDescription className="text-base">
                We sent a verification link to
                {maskedEmail && (
                  <span className="block font-medium text-white mt-1">{maskedEmail}</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Click the link in the email to verify your account. If you don&apos;t see it, check your spam folder.
              </p>

              <Button
                onClick={handleResend}
                disabled={resending || cooldown > 0}
                variant="outline"
                className="w-full text-sm border-2 border-[#5865F2]/30 rounded-md hover:bg-[#5865F2]/10 hover:text-[#5865F2]"
              >
                {resending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : cooldown > 0 ? (
                  `Resend in ${cooldown}s`
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Resend Verification Email
                  </>
                )}
              </Button>

              <div className="text-center pt-2">
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-white transition-colors"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to Sign In
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

function VerifyEmailLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailLoading />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
