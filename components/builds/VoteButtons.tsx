"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

interface VoteButtonsProps {
  buildId: string;
  initialUpvotes: number;
  initialUserVote: "upvote" | null;
  onVoteChange?: (upvotes: number, userVote: "upvote" | null) => void;
}

function VoteParticles({ trigger }: { trigger: number }) {
  const [particles, setParticles] = useState<{ id: number; tx: number; ty: number }[]>([]);

  useEffect(() => {
    if (trigger === 0) return;
    const newParticles = Array.from({ length: 6 }, (_, i) => {
      const angle = ((i * 60) + (Math.random() * 30 - 15)) * (Math.PI / 180);
      return {
        id: Date.now() + i,
        tx: Math.cos(angle) * (12 + Math.random() * 8),
        ty: -Math.abs(Math.sin(angle)) * (10 + Math.random() * 8),
      };
    });
    setParticles(newParticles);
    const timer = setTimeout(() => setParticles([]), 600);
    return () => clearTimeout(timer);
  }, [trigger]);

  if (particles.length === 0) return null;

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
            backgroundColor: "#fbbf24",
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
  initialUserVote,
  onVoteChange,
}: VoteButtonsProps) {
  const { user } = useAuth();
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [userVote, setUserVote] = useState<"upvote" | null>(initialUserVote);
  const [isLoading, setIsLoading] = useState(false);
  const [upBounce, setUpBounce] = useState(false);
  const [scoreDirection, setScoreDirection] = useState<"up" | "down" | null>(null);
  const [upParticleTrigger, setUpParticleTrigger] = useState(0);
  const prevScoreRef = useRef(initialUpvotes);
  const containerRef = useRef<HTMLDivElement>(null);

  const triggerCardAnimation = useCallback((voteType: "upvote" | "downvote") => {
    const card = containerRef.current?.closest("[class*='build-spellSchool']") as HTMLElement | null;
    if (!card) return;
    const cls = voteType === "upvote" ? "vote-card-flash-up" : "vote-card-flash-down";
    card.classList.remove("vote-card-flash-up", "vote-card-flash-down");
    void card.offsetWidth;
    card.classList.add(cls);
    const onEnd = () => {
      card.classList.remove(cls);
      card.removeEventListener("animationend", onEnd);
    };
    card.addEventListener("animationend", onEnd);
  }, []);

  const triggerAnimation = useCallback((voteType: "upvote" | "remove", newScore: number) => {
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
    }
  }, [triggerCardAnimation]);

  const handleVote = async (voteType: "upvote" | "remove") => {
    if (!user) {
      toast.error("Please sign in to vote");
      return;
    }

    const previousUpvotes = upvotes;
    const previousUserVote = userVote;

    const newUpvotes = previousUserVote === "upvote" ? upvotes - 1 : upvotes + 1;
    const newUserVote: "upvote" | null = previousUserVote === "upvote" ? null : "upvote";

    setUpvotes(newUpvotes);
    setUserVote(newUserVote);
    setIsLoading(true);
    triggerAnimation(voteType, newUpvotes);

    try {
      const response = await fetch(`/api/builds/${buildId}/vote`, {
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
      setUserVote(data.userVote);
      prevScoreRef.current = data.upvotes;

      if (onVoteChange) {
        onVoteChange(data.upvotes, data.userVote);
      }
    } catch (error: any) {
      setUpvotes(previousUpvotes);
      setUserVote(previousUserVote);
      prevScoreRef.current = previousUpvotes;

      toast.error(error.message || "Failed to vote. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isUpvoted = userVote === "upvote";

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-1 bg-black/40 backdrop-blur-sm rounded-lg border-2 border-zinc-800/20">
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 p-0 hover:bg-amber-900/20 rounded transition-colors duration-200 ${isUpvoted
            ? "text-amber-400 bg-amber-900/30"
            : "text-gray-400 hover:text-amber-400"
            }`}
          style={{
            animation: upBounce ? "vote-bounce-up 0.4s ease-out" : "none",
            ...(upBounce && isUpvoted ? { ["--glow-color" as string]: "rgba(251,191,36,0.4)", animation: "vote-bounce-up 0.4s ease-out, vote-glow 0.4s ease-out" } : {}),
          }}
          onClick={() => handleVote(isUpvoted ? "remove" : "upvote")}
          disabled={isLoading}
          aria-label="Upvote"
        >
          <Star
            className="transition-all duration-200"
            fill={isUpvoted ? "currentColor" : "none"}
            strokeWidth={isUpvoted ? 1.5 : 2}
          />
        </Button>
        <VoteParticles trigger={upParticleTrigger} />
      </div>
      <span
        className={`text-sm font-bold min-w-[2.5ch] text-center transition-colors duration-200 ${isUpvoted ? "text-amber-400" : "text-gray-300"}`}
        style={{
          animation: scoreDirection === "up"
            ? "score-slide-up 0.3s ease-out"
            : scoreDirection === "down"
              ? "score-slide-down 0.3s ease-out"
              : "none",
        }}
      >
        {upvotes}
      </span>
    </div>
  );
}
