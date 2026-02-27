"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ArrowBigDown, ArrowBigUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

interface VoteButtonsProps {
  buildId: string;
  initialUpvotes: number;
  initialDownvotes: number;
  initialUserVote: "upvote" | "downvote" | null;
  onVoteChange?: (upvotes: number, downvotes: number, userVote: "upvote" | "downvote" | null) => void;
}

export function VoteButtons({
  buildId,
  initialUpvotes,
  initialDownvotes,
  initialUserVote,
  onVoteChange,
}: VoteButtonsProps) {
  const { user } = useAuth();
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(initialUserVote);
  const [isLoading, setIsLoading] = useState(false);

  const handleVote = async (voteType: "upvote" | "downvote" | "remove") => {
    if (!user) {
      toast.error("Please sign in to vote");
      return;
    }

    // Optimistic update
    const previousUpvotes = upvotes;
    const previousDownvotes = downvotes;
    const previousUserVote = userVote;

    let newUpvotes = upvotes;
    let newDownvotes = downvotes;
    let newUserVote: "upvote" | "downvote" | null = userVote;

    if (voteType === "remove") {
      if (previousUserVote === "upvote") {
        newUpvotes = upvotes - 1;
      } else if (previousUserVote === "downvote") {
        newDownvotes = downvotes - 1;
      }
      newUserVote = null;
    } else if (voteType === "upvote") {
      if (previousUserVote === "upvote") {
        // Toggle off
        newUpvotes = upvotes - 1;
        newUserVote = null;
      } else if (previousUserVote === "downvote") {
        // Change from downvote to upvote
        newDownvotes = downvotes - 1;
        newUpvotes = upvotes + 1;
        newUserVote = "upvote";
      } else {
        // New upvote
        newUpvotes = upvotes + 1;
        newUserVote = "upvote";
      }
    } else {
      // downvote
      if (previousUserVote === "downvote") {
        // Toggle off
        newDownvotes = downvotes - 1;
        newUserVote = null;
      } else if (previousUserVote === "upvote") {
        // Change from upvote to downvote
        newUpvotes = upvotes - 1;
        newDownvotes = downvotes + 1;
        newUserVote = "downvote";
      } else {
        // New downvote
        newDownvotes = downvotes + 1;
        newUserVote = "downvote";
      }
    }

    setUpvotes(newUpvotes);
    setDownvotes(newDownvotes);
    setUserVote(newUserVote);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/builds/${buildId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ voteType }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to vote");
      }

      const data = await response.json();
      setUpvotes(data.upvotes);
      setDownvotes(data.downvotes);
      setUserVote(data.userVote);

      if (onVoteChange) {
        onVoteChange(data.upvotes, data.downvotes, data.userVote);
      }
    } catch (error: any) {
      // Rollback optimistic update
      setUpvotes(previousUpvotes);
      setDownvotes(previousDownvotes);
      setUserVote(previousUserVote);

      toast.error(error.message || "Failed to vote. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const score = upvotes - downvotes;
  const isUpvoted = userVote === "upvote";
  const isDownvoted = userVote === "downvote";

  return (
    <div className="flex flex-col items-center gap-1 bg-black/40 backdrop-blur-sm rounded-lg p-1 border-2 border-zinc-800/20">
      <Button
        variant="ghost"
        size="icon"
        className={`h-8 w-8 p-0 hover:bg-red-900/20 rounded transition-all ${isUpvoted
          ? "text-red-400 bg-red-900/30"
          : "text-gray-400 hover:text-red-400"
          }`}
        onClick={() => handleVote(isUpvoted ? "remove" : "upvote")}
        disabled={isLoading}
        aria-label="Upvote"
      >
        <ArrowBigUp />
      </Button>
      <span
        className={`text-sm font-bold min-w-[2.5ch] text-center ${score > 0
          ? "text-red-400"
          : score < 0
            ? "text-blue-400"
            : "text-gray-300"
          }`}
      >
        {score > 0 ? `+${score}` : score}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className={`h-8 w-8 p-0 hover:bg-blue-900/20 rounded transition-all ${isDownvoted
          ? "text-blue-400 bg-blue-900/30"
          : "text-gray-400 hover:text-blue-400"
          }`}
        onClick={() => handleVote(isDownvoted ? "remove" : "downvote")}
        disabled={isLoading}
        aria-label="Downvote"
      >
        <ArrowBigDown />
      </Button>
    </div>
  );
}

