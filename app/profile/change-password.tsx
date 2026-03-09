"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { authClient } from "@/lib/better-auth/client";
import { Eye, EyeOff, Lock, Loader2, ChevronDown } from "lucide-react";

export default function ChangePassword() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: "", color: "" };
    if (password.length < 6) return { strength: 1, label: "Very weak", color: "bg-red-500" };
    if (password.length < 8) return { strength: 2, label: "Weak", color: "bg-orange-500" };
    if (password.length < 10 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { strength: 3, label: "Medium", color: "bg-yellow-500" };
    }
    return { strength: 4, label: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    setLoading(true);

    try {
      const result = await authClient.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      if (result.error) {
        throw new Error(result.error.message || "Failed to change password");
      }

      toast.success("Password changed successfully!");
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setOpen(false);
    } catch (error: any) {
      const errorMessage = error.message || "Failed to change password";
      if (errorMessage.toLowerCase().includes("current password") || errorMessage.toLowerCase().includes("incorrect")) {
        toast.error("Current password is incorrect");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-sm bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 transition-all text-sm text-gray-400 hover:text-white"
      >
        <span className="flex items-center gap-2">
          <Lock className="h-3.5 w-3.5" />
          Change Password
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="mt-2 space-y-3 px-1">
          <div className="space-y-1.5">
            <label htmlFor="currentPassword" className="text-[11px] uppercase tracking-wider text-gray-600">
              Current Password
            </label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Enter current password"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                required
                disabled={loading}
                className="bg-black/50 border-white/10 text-white placeholder:text-gray-600 pr-10 h-9 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                tabIndex={-1}
              >
                {showCurrentPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="newPassword" className="text-[11px] uppercase tracking-wider text-gray-600">
              New Password
            </label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                required
                disabled={loading}
                minLength={6}
                className="bg-black/50 border-white/10 text-white placeholder:text-gray-600 pr-10 h-9 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                tabIndex={-1}
              >
                {showNewPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
            {formData.newPassword && (
              <div className="space-y-1 pt-0.5">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-0.5 flex-1 rounded-full ${
                        level <= passwordStrength.strength ? passwordStrength.color : "bg-gray-800"
                      }`}
                    />
                  ))}
                </div>
                {passwordStrength.label && (
                  <p className="text-[11px] text-gray-500">
                    Strength:{" "}
                    <span className={passwordStrength.strength >= 3 ? "text-green-500" : "text-yellow-500"}>
                      {passwordStrength.label}
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-[11px] uppercase tracking-wider text-gray-600">
              Confirm New Password
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                disabled={loading}
                minLength={6}
                className="bg-black/50 border-white/10 text-white placeholder:text-gray-600 pr-10 h-9 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              type="submit"
              size="sm"
              className="flex-1 bg-[#8B0000]/80 hover:bg-[#8B0000] border-0 text-white h-8 text-xs"
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Saving...</>
              ) : (
                <><Lock className="mr-1.5 h-3.5 w-3.5" />Update Password</>
              )}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                setOpen(false);
              }}
              disabled={loading}
              className="text-gray-500 hover:text-white h-8 text-xs"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
