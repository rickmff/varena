"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { authClient } from "@/lib/better-auth/client";
import { Loader2, CheckCircle2, XCircle, Mail } from "lucide-react";
import NavBar from "@/components/NavBar";

function VerifyEmailContent() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError("Invalid verification token");
        setLoading(false);
        return;
      }

      try {
        const result = await authClient.verifyEmail({
          query: {
            token,
          },
        });

        if (result.error) {
          setError(result.error.message || "Failed to verify email address");
          toast.error(result.error.message || "Failed to verify email address");
        } else {
          setVerified(true);
          toast.success("Email verified successfully! You can now sign in.");

          // Redirect to signin after a short delay
          setTimeout(() => {
            router.push("/auth/signin?verified=true");
          }, 2000);
        }
      } catch (error: any) {
        const errorMessage = error?.message || "An error occurred while verifying your email";
        setError(errorMessage);
        toast.error(errorMessage);
        console.error("Email verification error:", error);
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar />
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-32 overflow-hidden bg-gradient-to-b from-black to-black flex items-center justify-center">
        <div className="container mx-auto px-4 relative z-10 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
              <CardDescription>
                {loading && "Verifying your email address..."}
                {verified && "Your email has been verified!"}
                {error && "Verification failed"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading && (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground text-center">
                    Please wait while we verify your email address...
                  </p>
                </div>
              )}

              {verified && (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                  <p className="text-sm text-center text-green-500">
                    Your email address has been successfully verified!
                  </p>
                  <p className="text-sm text-muted-foreground text-center">
                    Redirecting you to the sign in page...
                  </p>
                  <Button
                    onClick={() => router.push("/auth/signin?verified=true")}
                    className="w-full"
                  >
                    Go to Sign In
                  </Button>
                </div>
              )}

              {error && (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <XCircle className="h-12 w-12 text-red-500" />
                  <p className="text-sm text-center text-red-500">
                    {error}
                  </p>
                  <p className="text-sm text-muted-foreground text-center">
                    The verification link may have expired or is invalid.
                  </p>
                  <div className="space-y-2 w-full">
                    <Button
                      onClick={() => router.push("/auth/signin")}
                      variant="outline"
                      className="w-full"
                    >
                      Go to Sign In
                    </Button>
                    <Button
                      onClick={async () => {
                        // This will be handled by the signin page's resend functionality
                        router.push("/auth/signin?resend=true");
                      }}
                      className="w-full"
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Request New Verification Email
                    </Button>
                  </div>
                </div>
              )}
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
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
          <CardDescription>
            Verifying your email address...
          </CardDescription>
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


