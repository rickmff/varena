"use client";

import { Check, Sword, Crown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AuthorBadgeProps {
  badgeType?: string;
  description?: string;
  className?: string;
}

const BADGE_CONFIG: Record<string, { color: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }> = {
  veteran: {
    color: "bg-blue-500",
    icon: Sword,
  },
  champion: {
    color: "bg-yellow-500",
    icon: Crown,
  },
  verified: {
    color: "bg-green-500",
    icon: Check,
  },
};

export function AuthorBadge({
  badgeType = "verified",
  description = "Verified",
  className = "",
}: AuthorBadgeProps) {
  const config = BADGE_CONFIG[badgeType || "verified"];

  if (!config) {
    // Fallback to verified if badge type is unknown
    const fallbackConfig = BADGE_CONFIG.verified || BADGE_CONFIG.veteran;
    const Icon = fallbackConfig.icon;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={`inline-flex items-center justify-center rounded-full ${fallbackConfig.color} text-white ${className}`}
              style={{
                width: "16px",
                height: "16px",
                minWidth: "16px",
                minHeight: "16px",
              }}
            >
              <Icon className="w-3 h-3" strokeWidth={3} />
            </span>
          </TooltipTrigger>
          <TooltipContent
            className="bg-black/95 border-white/10 text-white text-xs"
            side="top"
          >
            <span>{description}</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`inline-flex items-center justify-center rounded-full ${config.color} text-white ${className}`}
            style={{
              width: "16px",
              height: "16px",
              minWidth: "16px",
              minHeight: "16px",
            }}
          >
            <Icon className="w-3 h-3" strokeWidth={3} />
          </span>
        </TooltipTrigger>
        <TooltipContent
          className="bg-black/95 border-white/10 text-white text-xs"
          side="top"
        >
          <span>{description}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
