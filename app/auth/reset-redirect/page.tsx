"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function ResetPasswordRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      toast.error("Invalid reset token");
      router.push("/auth/reset");
      return;
    }

    // Redirect to our custom reset page with the token in the path
    router.replace(`/auth/reset/${encodeURIComponent(token)}`);
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-400">Redirecting to password reset page...</p>
      </div>
    </div>
  );
}

