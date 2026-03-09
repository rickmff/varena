"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Globe, Lock } from "lucide-react";

interface PrivacyToggleProps {
  initialPublic: boolean;
}

export default function PrivacyToggle({ initialPublic }: PrivacyToggleProps) {
  const [isPublic, setIsPublic] = useState(initialPublic);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const next = !isPublic;
    try {
      const res = await fetch("/api/profile/privacy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profilePublic: next }),
      });
      if (!res.ok) throw new Error();
      setIsPublic(next);
      toast.success(next ? "Profile set to public" : "Profile set to private");
    } catch {
      toast.error("Failed to update privacy setting");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-sm border transition-all text-sm ${
        isPublic
          ? "bg-white/[0.03] border-white/5 hover:border-white/10 text-gray-400 hover:text-white"
          : "bg-red-950/20 border-red-900/30 hover:border-red-800/50 text-red-400 hover:text-red-300"
      }`}
    >
      <span className="flex items-center gap-2">
        {isPublic ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
        Profile is {isPublic ? "public" : "private"}
      </span>
      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
        isPublic ? "bg-green-900/40 text-green-400" : "bg-red-900/40 text-red-400"
      }`}>
        {isPublic ? "on" : "off"}
      </span>
    </button>
  );
}
