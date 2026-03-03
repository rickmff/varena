"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

interface TierListVoteButtonsProps {
  tierListId: string;
  initialUpvotes: number;
  initialDownvotes: number;
  initialUserVote: "upvote" | "downvote" | null;
  onVoteChange?: (upvotes: number, downvotes: number, userVote: "upvote" | "downvote" | null) => void;
}

export function TierListVoteButtons({
  tierListId,
  initialUpvotes,
  initialDownvotes,
  initialUserVote,
  onVoteChange,
}: TierListVoteButtonsProps) {
  const { user } = useAuth();
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(initialUserVote);
  const [isLoading, setIsLoading] = useState(false);

  const handleVote = async (voteType: "upvote" | "remove") => {
    if (!user) {
      toast.error("Please sign in to vote");
      return;
    }

    const previousUpvotes = upvotes;
    const previousDownvotes = downvotes;
    const previousUserVote = userVote;

    let newUpvotes = upvotes;
    let newUserVote: "upvote" | "downvote" | null = userVote;

    if (voteType === "remove") {
      newUpvotes = upvotes - 1;
      newUserVote = null;
    } else {
      if (previousUserVote === "upvote") {
        newUpvotes = upvotes - 1;
        newUserVote = null;
      } else {
        newUpvotes = upvotes + 1;
        newUserVote = "upvote";
      }
    }

    setUpvotes(newUpvotes);
    setUserVote(newUserVote);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/tier-lists/${tierListId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      setUpvotes(previousUpvotes);
      setDownvotes(previousDownvotes);
      setUserVote(previousUserVote);
      toast.error(error.message || "Failed to vote. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isUpvoted = userVote === "upvote";

  return (
    <div className="flex flex-col items-center gap-1 bg-black/40 backdrop-blur-sm rounded-lg p-1 border-2 border-zinc-800/20">
      <Button
        variant="ghost"
        size="icon"
        className={`h-8 w-8 p-0 hover:bg-amber-900/20 rounded transition-all ${
          isUpvoted
            ? "text-amber-400 bg-amber-900/30"
            : "text-gray-400 hover:text-amber-400"
        }`}
        onClick={() => handleVote(isUpvoted ? "remove" : "upvote")}
        disabled={isLoading}
        aria-label="Upvote"
      >
        <Star fill={isUpvoted ? "currentColor" : "none"} strokeWidth={isUpvoted ? 1.5 : 2} />
      </Button>
      <span
        className={`text-sm font-bold min-w-[2.5ch] text-center ${
          isUpvoted ? "text-amber-400" : "text-gray-300"
        }`}
      >
        {upvotes}
      </span>
    </div>
  );
}
