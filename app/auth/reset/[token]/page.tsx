"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { authClient } from "@/lib/better-auth/client";
import { Eye, EyeOff, Lock, Loader2, CheckCircle2 } from "lucide-react";
import NavBar from "@/components/NavBar";

export default function ResetPasswordConfirmPage() {
  const router = useRouter();
  const params = useParams();
  const rawToken = params?.token as string;
  // Decode the token in case it's URL-encoded
  const token = rawToken ? decodeURIComponent(rawToken) : null;
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!token) {
      toast.error("Invalid reset token");
      router.push("/auth/reset");
    }
  }, [token, router]);

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: "", color: "" };
    if (password.length < 6) return { strength: 1, label: "Very weak", color: "bg-red-500" };
    if (password.length < 8) return { strength: 2, label: "Weak", color: "bg-orange-500" };
    if (password.length < 10 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { strength: 3, label: "Medium", color: "bg-yellow-500" };
    }
    return { strength: 4, label: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      if (!token) {
        throw new Error("Token is missing");
      }

      const result = await authClient.resetPassword({
        token,
        newPassword: formData.password,
      });

      if (result.error) {
        console.error("[Reset Password] Error from Better Auth:", result.error);
        const errorMessage = result.error.message || result.error.code || "Failed to reset password";

        // Provide more specific error messages
        if (errorMessage.includes("INVALID_TOKEN") || errorMessage.includes("invalid") || errorMessage.includes("expired")) {
          throw new Error("This password reset link is invalid or has expired. Please request a new one.");
        }

        throw new Error(errorMessage);
      }

      setSuccess(true);
      toast.success("Password reset successfully!");
      setTimeout(() => {
        router.push("/auth/signin?reset=success");
      }, 2000);
    } catch (error: any) {
      console.error("[Reset Password] Error:", error);
      const errorMessage = error.message || "Failed to reset password. The link may have expired.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black text-white">
        <NavBar />
        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4">
          <Card className="w-full max-w-md bg-black/50 border-[#5865F2]/30">
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">Password Reset Successful</CardTitle>
              <CardDescription className="text-gray-400">
                Your password has been reset successfully. Redirecting to sign in...
              </CardDescription>
            </CardHeader>
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
            <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Reset Password
            </CardTitle>
            <CardDescription className="text-gray-400">
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-300">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    disabled={loading}
                    minLength={6}
                    className="bg-black/50 border-white/10 text-white placeholder:text-gray-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formData.password && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded ${level <= passwordStrength.strength
                              ? passwordStrength.color
                              : "bg-gray-700"
                            }`}
                        />
                      ))}
                    </div>
                    {passwordStrength.label && (
                      <p className="text-xs text-gray-400">
                        Strength:{" "}
                        <span
                          className={
                            passwordStrength.strength >= 3 ? "text-green-500" : "text-yellow-500"
                          }
                        >
                          {passwordStrength.label}
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-300">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                    required
                    disabled={loading}
                    minLength={6}
                    className="bg-black/50 border-white/10 text-white placeholder:text-gray-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-[#0f0a47] hover:bg-[#4752C4] border-[#5865F2] text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>

            <div className="text-center text-sm">
              <Link href="/auth/signin" className="text-[#5865F2] hover:underline">
                Back to sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


