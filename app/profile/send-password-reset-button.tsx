"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { authClient } from "@/lib/better-auth/client";
import { Mail, Loader2 } from "lucide-react";

interface SendPasswordResetButtonProps {
  email: string;
}

export default function SendPasswordResetButton({ email }: SendPasswordResetButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleSendResetEmail = async () => {
    if (!email) {
      toast.error("Email not found");
      return;
    }

    setLoading(true);

    try {
      const result = await authClient.forgetPassword({
        email,
      });

      if (result.error) {
        throw new Error(result.error.message || "Failed to send password reset email");
      }

      toast.success(`Password reset link sent to ${email}. Please check your inbox.`);
    } catch (error: any) {
      toast.error(error.message || "Failed to send password reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSendResetEmail}
      variant="outline"
      className="w-full justify-start bg-[#0f0a47] hover:bg-[#4752C4] border-[#5865F2] text-white"
      disabled={loading || !email}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Sending...
        </>
      ) : (
        <>
          <Mail className="mr-2 h-4 w-4" />
          Send Password Reset Email
        </>
      )}
    </Button>
  );
}

