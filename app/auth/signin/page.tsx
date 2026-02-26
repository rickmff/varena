"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { authClient } from "@/lib/better-auth/client";
import { Eye, EyeOff, Loader2, Mail } from "lucide-react";
import NavBar from "@/components/NavBar";
import { migrateLocalBuilds } from "@/lib/migrate-local-builds";
import { migrateLocalTierLists } from "@/lib/migrate-local-tier-lists";
import { useAuth } from "@/components/providers/session-provider";

function SignInForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const toastShownRef = useRef<{ registered?: boolean; reset?: boolean; verify?: boolean; verified?: boolean }>({});

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Redirect authenticated users away from signin page
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    // Prevent duplicate toasts in React Strict Mode
    const registered = searchParams.get("registered");
    const reset = searchParams.get("reset");
    const verify = searchParams.get("verify");

    if (registered === "true" && !toastShownRef.current.registered) {
      toast.success("Account created successfully! You can now sign in.");
      toastShownRef.current.registered = true;
    }

    if (reset === "success" && !toastShownRef.current.reset) {
      toast.success("Password reset successfully! Please sign in with your new password.");
      toastShownRef.current.reset = true;
    }

    if (verify === "email-sent" && !toastShownRef.current.verify) {
      toast.info("Please check your email to verify your account before signing in.");
      toastShownRef.current.verify = true;
    }

    const verified = searchParams.get("verified");
    if (verified === "true" && !toastShownRef.current.verified) {
      toast.success("Email verified successfully! You can now sign in.");
      toastShownRef.current.verified = true;
    }
  }, [searchParams]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    // Basic validation
    const newErrors: { email?: string; password?: string } = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const result = await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
      });

      if (result.error) {
        const errorMessage = result.error.message || result.error.code || "Invalid credentials";
        const errorStatus = result.error.status || result.error.code;

        // Check if error is due to unverified email (status 403 or specific error codes)
        if (errorStatus === 403 || errorMessage.toLowerCase().includes("email") &&
          (errorMessage.toLowerCase().includes("verify") || errorMessage.toLowerCase().includes("verification"))) {
          setUnverifiedEmail(formData.email);
          toast.error("Please verify your email address before signing in. Check your inbox for the verification link.");
          setErrors({ email: "Email not verified. Please check your inbox." });
        } else {
          toast.error(errorMessage);
          // Set generic error for invalid credentials
          if (result.error.code === "INVALID_CREDENTIALS" || errorMessage.includes("invalid")) {
            setErrors({ password: "Email or password incorrect" });
          }
        }
        console.error("Login error:", result.error);
      } else if (result.data) {
        toast.success("Signed in successfully!");

        // Migrate builds and tier lists from localStorage to database
        try {
          const [buildsResult, tierListsResult] = await Promise.all([
            migrateLocalBuilds(),
            migrateLocalTierLists(),
          ]);
          const totalMigrated = buildsResult.migrated + tierListsResult.migrated;
          if (totalMigrated > 0) {
            const messages = [];
            if (buildsResult.migrated > 0) {
              messages.push(`${buildsResult.migrated} build(s)`);
            }
            if (tierListsResult.migrated > 0) {
              messages.push(`${tierListsResult.migrated} tier list(s)`);
            }
            toast.success(`Migrated ${messages.join(" and ")} from local storage`);
          }
        } catch (migrationError) {
          console.error("Error during migration:", migrationError);
          // Don't block login if migration fails
        }

        // Redirect to callbackUrl if exists, otherwise to /builds
        const callbackUrl = searchParams.get("callbackUrl") || "/builds";
        setTimeout(() => {
          window.location.href = callbackUrl;
        }, 100);
      } else {
        toast.error("Unknown error signing in");
        console.error("Login result:", result);
      }
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || "Error signing in";
      toast.error(errorMessage);
      console.error("Login exception:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerificationEmail = async () => {
    if (!unverifiedEmail && !formData.email) {
      toast.error("Please enter your email address first");
      return;
    }
    if (resendCooldown > 0 || resendingEmail) return;

    const emailToResend = unverifiedEmail || formData.email;
    setResendingEmail(true);

    try {
      const result = await authClient.sendVerificationEmail({
        email: emailToResend,
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to resend verification email");
      } else {
        toast.success("Verification email sent! Please check your inbox.");
        setUnverifiedEmail(emailToResend);
        setResendCooldown(60);
      }
    } catch (error: any) {
      if (error?.status === 429) {
        toast.error("Too many attempts. Please try again later.");
        setResendCooldown(60);
      } else {
        toast.error(error.message || "Failed to resend verification email");
      }
      console.error("Resend verification email error:", error);
    } finally {
      setResendingEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar />
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-32 overflow-hidden bg-gradient-to-b from-black to-black">
        <div className="container mx-auto px-4 relative z-10 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
              <CardDescription>
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: undefined });
                    }}
                    disabled={loading}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p id="email-error" className="text-sm text-red-500" role="alert">
                      {errors.email}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        if (errors.password) setErrors({ ...errors, password: undefined });
                      }}
                      disabled={loading}
                      aria-invalid={!!errors.password}
                      aria-describedby={errors.password ? "password-error" : undefined}
                      className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !loading) {
                          handleSubmit(e as any);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p id="password-error" className="text-sm text-red-500" role="alert">
                      {errors.password}
                    </p>
                  )}
                </div>
                {unverifiedEmail && (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                    <p className="text-sm text-yellow-500 mb-2">
                      Your email address needs to be verified before you can sign in.
                    </p>
                    <Button
                      type="button"
                      onClick={handleResendVerificationEmail}
                      disabled={resendingEmail || resendCooldown > 0}
                      variant="outline"
                      className="w-full text-sm border-2 border-yellow-500/30 rounded-md hover:bg-yellow-500/10 hover:text-yellow-500"
                    >
                      {resendingEmail ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : resendCooldown > 0 ? (
                        `Resend in ${resendCooldown}s`
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Resend Verification Email
                        </>
                      )}
                    </Button>
                  </div>
                )}
                <Button type="submit" className="items-center justify-center gap-2 whitespace-nowrap rounded-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border hover:text-accent-foreground h-10 px-4 py-2 hidden md:flex font-bold text-white bg-[#0f0a47] hover:bg-[#4752C4] border-[#5865F2] hover:border-[#4752C4] transition-all duration-300 w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              <div className="text-center text-sm space-y-2">
                <div>
                  <span className="text-muted-foreground">Don't have an account? </span>
                  <Link href="/auth/signup" className="text-primary underline underline-offset-2 text-[#5865F2] hover:text-[#4752C4]">
                    Sign up
                  </Link>
                </div>
                <div>
                  <Link href="/auth/reset" className="underline underline-offset-2 text-[#5865F2] hover:text-[#4752C4]">
                    Forgot password
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

function SignInPageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
          <CardDescription>
            Sign in to your account to continue
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

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInPageLoading />}>
      <SignInForm />
    </Suspense>
  );
}

