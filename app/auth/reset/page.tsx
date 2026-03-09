"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { authClient } from "@/lib/better-auth/client";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import NavBar from "@/components/NavBar";
import { useAuth } from "@/components/providers/session-provider";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  // Redirect authenticated users away from reset page
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await authClient.requestPasswordReset({
        email,
        redirectTo: "/auth/reset",
      });

      if (result.error) {
        throw new Error(result.error.message || "Failed to Send password reset for my email");
      }

      setEmailSent(true);
      toast.success("If an account exists with this email, you'll receive a password reset link.");
    } catch (error: any) {
      toast.error(error.message || "Failed to Send password reset for my email");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-black text-white">
        <NavBar />
        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4">
          <Card className="w-full max-w-md bg-black/50 border-[#5865F2]/30">
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                <Mail className="h-6 w-6 text-green-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">Check your email</CardTitle>
              <CardDescription className="text-gray-400">
                We've sent a password reset link to <strong className="text-white">{email}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-400 text-center">
                Click the link in the email to reset your password. The link will expire in 1 hour.
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => {
                    setEmailSent(false);
                    setEmail("");
                  }}
                  variant="outline"
                  className="w-full bg-[#0f0a47] hover:bg-[#4752C4] border-[#5865F2] text-white"
                >
                  Send another email
                </Button>
                <Button
                  onClick={() => router.push("/auth/signin")}
                  variant="ghost"
                  className="w-full text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to sign in
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar />
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4">
        <Card className="w-full max-w-md bg-black/50 border-[#5865F2]/30">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-white">Forgot Password</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your email address and we'll send you a link to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-300">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-black/50 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#0f0a47] hover:bg-[#4752C4] border-[#5865F2] text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send reset link
                  </>
                )}
              </Button>
            </form>

            <div className="text-center text-sm">
              <span className="text-gray-400">Remember your password? </span>
              <Link href="/auth/signin" className="text-[#5865F2] hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


