"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SteamLinkProps {
  steamLinked: boolean;
  steamProfileUrl: string | null;
  playerToken: string | null;
}

const ERROR_MESSAGES: Record<string, string> = {
  cancelled: "Steam login was cancelled.",
  verify_failed: "Could not verify Steam response. Please try again.",
  invalid: "Invalid Steam response. Please try again.",
  invalid_id: "Could not read your Steam ID. Please try again.",
  already_linked: "This Steam account is already linked to another user.",
};

export default function SteamLink({ steamLinked: initialLinked, steamProfileUrl, playerToken }: SteamLinkProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const steamStatus = searchParams.get("steam");
  const steamReason = searchParams.get("reason");
  const [linked, setLinked] = useState(initialLinked);
  const [unlinking, setUnlinking] = useState(false);

  useEffect(() => {
    if (steamStatus === "success") {
      window.history.replaceState({}, "", "/profile");
    }
  }, [steamStatus]);

  async function handleUnlink() {
    setUnlinking(true);
    try {
      await fetch("/api/auth/steam/unlink", { method: "POST" });
      setLinked(false);
      router.refresh();
    } finally {
      setUnlinking(false);
    }
  }

  const message =
    steamStatus === "success"
      ? "Steam account linked successfully!"
      : steamStatus === "error"
      ? ERROR_MESSAGES[steamReason || ""] || "An error occurred."
      : null;

  const isSuccess = steamStatus === "success";

  return (
    <div className="space-y-2">
      {message && (
        <p
          className={`text-sm ${
            isSuccess ? "text-green-400" : "text-red-400"
          }`}
        >
          {message}
        </p>
      )}

      {linked ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <img
              src="https://store.steampowered.com/favicon.ico"
              alt="Steam"
              className="h-4 w-4"
            />
            <span className="text-white text-sm">
              Steam linked:{" "}
              {steamProfileUrl ? (
                <a
                  href={steamProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#5865F2] hover:underline"
                >
                  View profile
                </a>
              ) : (
                <span className="text-gray-400">connected</span>
              )}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleUnlink}
            disabled={unlinking}
            className="w-full justify-start bg-transparent hover:bg-red-900/30 border-red-800/50 text-red-400 hover:text-red-300"
          >
            {unlinking ? "Unlinking..." : "Unlink Steam Account"}
          </Button>
        </div>
      ) : (
        <Button
          asChild
          variant="outline"
          className="w-full justify-start bg-[#1b2838] hover:bg-[#2a475e] border-[#4a90d9] text-white"
        >
          <Link href="/api/auth/steam" className="flex items-center gap-2">
            <img
              src="https://store.steampowered.com/favicon.ico"
              alt="Steam"
              className="h-4 w-4"
            />
            Link Steam Account
          </Link>
        </Button>
      )}
    </div>
  );
}
