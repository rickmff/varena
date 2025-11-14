"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { authClient } from "@/lib/better-auth/client";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import NavBar from "@/components/NavBar";
import { migrateLocalBuilds } from "@/lib/migrate-local-builds";

function SignInForm() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const toastShownRef = useRef<{ registered?: boolean; reset?: boolean }>({});

  useEffect(() => {
    // Prevent duplicate toasts in React Strict Mode
    const registered = searchParams.get("registered");
    const reset = searchParams.get("reset");

    if (registered === "true" && !toastShownRef.current.registered) {
      toast.success("Account created successfully! You can now sign in.");
      toastShownRef.current.registered = true;
    }

    if (reset === "success" && !toastShownRef.current.reset) {
      toast.success("Password reset successfully! Please sign in with your new password.");
      toastShownRef.current.reset = true;
    }
    // Note: Email verification messages removed as it's temporarily disabled
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
        toast.error(errorMessage);

        // Set generic error for invalid credentials
        if (result.error.code === "INVALID_CREDENTIALS" || errorMessage.includes("invalid")) {
          setErrors({ password: "Email or password incorrect" });
        }
        console.error("Login error:", result.error);
      } else if (result.data) {
        toast.success("Signed in successfully!");

        // Migrate builds from localStorage to database
        try {
          const migrationResult = await migrateLocalBuilds();
          if (migrationResult.migrated > 0) {
            toast.success(`Migrated ${migrationResult.migrated} build(s) from local storage`);
          }
        } catch (migrationError) {
          console.error("Error during build migration:", migrationError);
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
                  <Link href="/auth/signup" className="text-primary hover:underline">
                    Sign up
                  </Link>
                </div>
                <div>
                  <Link href="/auth/reset" className="text-primary hover:underline text-sm">
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

