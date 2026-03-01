"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
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

function VoteParticles({ type, trigger }: { type: "upvote" | "downvote"; trigger: number }) {
  const [particles, setParticles] = useState<{ id: number; tx: number; ty: number }[]>([]);

  useEffect(() => {
    if (trigger === 0) return;
    const spread = type === "upvote" ? -1 : 1;
    const newParticles = Array.from({ length: 6 }, (_, i) => {
      const angle = ((i * 60) + (Math.random() * 30 - 15)) * (Math.PI / 180);
      return {
        id: Date.now() + i,
        tx: Math.cos(angle) * (12 + Math.random() * 8),
        ty: spread * Math.abs(Math.sin(angle)) * (10 + Math.random() * 8),
      };
    });
    setParticles(newParticles);
    const timer = setTimeout(() => setParticles([]), 600);
    return () => clearTimeout(timer);
  }, [trigger, type]);

  if (particles.length === 0) return null;

  const color = type === "upvote" ? "#f87171" : "#60a5fa";

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute left-1/2 top-1/2"
          style={{
            width: 4,
            height: 4,
            borderRadius: "50%",
            backgroundColor: color,
            animation: "vote-particle 0.5s ease-out forwards",
            ["--tx" as string]: `${p.tx}px`,
            ["--ty" as string]: `${p.ty}px`,
          }}
        />
      ))}
    </div>
  );
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
  const [upBounce, setUpBounce] = useState(false);
  const [downBounce, setDownBounce] = useState(false);
  const [scoreDirection, setScoreDirection] = useState<"up" | "down" | null>(null);
  const [upParticleTrigger, setUpParticleTrigger] = useState(0);
  const [downParticleTrigger, setDownParticleTrigger] = useState(0);
  const prevScoreRef = useRef(initialUpvotes - initialDownvotes);
  const containerRef = useRef<HTMLDivElement>(null);

  const triggerCardAnimation = useCallback((voteType: "upvote" | "downvote") => {
    const card = containerRef.current?.closest("[class*='build-spellSchool']") as HTMLElement | null;
    if (!card) return;
    const cls = voteType === "upvote" ? "vote-card-flash-up" : "vote-card-flash-down";
    card.classList.remove("vote-card-flash-up", "vote-card-flash-down");
    // Force reflow so re-adding the same class restarts the animation
    void card.offsetWidth;
    card.classList.add(cls);
    const onEnd = () => {
      card.classList.remove(cls);
      card.removeEventListener("animationend", onEnd);
    };
    card.addEventListener("animationend", onEnd);
  }, []);

  const triggerAnimation = useCallback((voteType: "upvote" | "downvote" | "remove", newScore: number) => {
    const oldScore = prevScoreRef.current;
    prevScoreRef.current = newScore;

    if (newScore > oldScore) {
      setScoreDirection("up");
    } else if (newScore < oldScore) {
      setScoreDirection("down");
    }
    setTimeout(() => setScoreDirection(null), 300);

    if (voteType === "upvote") {
      setUpBounce(true);
      setUpParticleTrigger((p) => p + 1);
      setTimeout(() => setUpBounce(false), 400);
      triggerCardAnimation("upvote");
    } else if (voteType === "downvote") {
      setDownBounce(true);
      setDownParticleTrigger((p) => p + 1);
      setTimeout(() => setDownBounce(false), 400);
      triggerCardAnimation("downvote");
    }
  }, [triggerCardAnimation]);

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
    triggerAnimation(voteType, newUpvotes - newDownvotes);

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
      prevScoreRef.current = data.upvotes - data.downvotes;

      if (onVoteChange) {
        onVoteChange(data.upvotes, data.downvotes, data.userVote);
      }
    } catch (error: any) {
      // Rollback optimistic update
      setUpvotes(previousUpvotes);
      setDownvotes(previousDownvotes);
      setUserVote(previousUserVote);
      prevScoreRef.current = previousUpvotes - previousDownvotes;

      toast.error(error.message || "Failed to vote. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const score = upvotes - downvotes;
  const isUpvoted = userVote === "upvote";
  const isDownvoted = userVote === "downvote";

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-1 bg-black/40 backdrop-blur-sm rounded-lg p-1 border-2 border-zinc-800/20">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 p-0 hover:bg-red-900/20 rounded transition-colors duration-200 ${isUpvoted
              ? "text-red-400 bg-red-900/30"
              : "text-gray-400 hover:text-red-400"
              }`}
            style={{
              animation: upBounce ? "vote-bounce-up 0.4s ease-out" : "none",
              ...(upBounce && isUpvoted ? { ["--glow-color" as string]: "rgba(248,113,113,0.4)", animation: "vote-bounce-up 0.4s ease-out, vote-glow 0.4s ease-out" } : {}),
            }}
            onClick={() => handleVote(isUpvoted ? "remove" : "upvote")}
            disabled={isLoading}
            aria-label="Upvote"
          >
            <ArrowBigUp
              className="transition-all duration-200"
              fill={isUpvoted ? "currentColor" : "none"}
              strokeWidth={isUpvoted ? 1.5 : 2}
            />
          </Button>
          <VoteParticles type="upvote" trigger={upParticleTrigger} />
        </div>
        <span
          className={`text-sm font-bold min-w-[2.5ch] text-center transition-colors duration-200 ${score > 0
            ? "text-red-400"
            : score < 0
              ? "text-blue-400"
              : "text-gray-300"
            }`}
          style={{
            animation: scoreDirection === "up"
              ? "score-slide-up 0.3s ease-out"
              : scoreDirection === "down"
                ? "score-slide-down 0.3s ease-out"
                : "none",
          }}
        >
          {score > 0 ? `+${score}` : score}
        </span>
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 p-0 hover:bg-blue-900/20 rounded transition-colors duration-200 ${isDownvoted
              ? "text-blue-400 bg-blue-900/30"
              : "text-gray-400 hover:text-blue-400"
              }`}
            style={{
              animation: downBounce ? "vote-bounce-down 0.4s ease-out" : "none",
              ...(downBounce && isDownvoted ? { ["--glow-color" as string]: "rgba(96,165,250,0.4)", animation: "vote-bounce-down 0.4s ease-out, vote-glow 0.4s ease-out" } : {}),
            }}
            onClick={() => handleVote(isDownvoted ? "remove" : "downvote")}
            disabled={isLoading}
            aria-label="Downvote"
          >
            <ArrowBigDown
              className="transition-all duration-200"
              fill={isDownvoted ? "currentColor" : "none"}
              strokeWidth={isDownvoted ? 1.5 : 2}
            />
          </Button>
          <VoteParticles type="downvote" trigger={downParticleTrigger} />
        </div>
    </div>
  );
}

