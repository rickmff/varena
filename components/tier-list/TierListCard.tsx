"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Globe2, Lock, Trash2, User } from "lucide-react";
import { TierListVoteButtons } from "./TierListVoteButtons";
import spellsData from "@/data/vbuilds/spells.json";
import { useAuth } from "@/hooks/use-auth";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type TierKey = "S" | "A" | "B" | "C" | "D" | "Unranked";

type TierState = {
  [key in TierKey]: string[];
};

interface TierListCardProps {
  id: string;
  name: string;
  tiers: TierState;
  author?: string;
  userId?: string | null;
  isPublic?: boolean;
  showPublicToggle?: boolean;
  onPublicChange?: (isPublic: boolean) => void;
  upvotes?: number;
  downvotes?: number;
  userVote?: "upvote" | "downvote" | null;
  onVoteChange?: (upvotes: number, downvotes: number, userVote: "upvote" | "downvote" | null) => void;
  onDelete?: () => void;
}

const tierColors: Record<TierKey, string> = {
  S: "from-rose-600 to-red-500",
  A: "from-orange-500 to-amber-400",
  B: "from-yellow-500 to-lime-400",
  C: "from-emerald-500 to-teal-400",
  D: "from-sky-500 to-blue-500",
  Unranked: "from-slate-600 to-slate-500",
};

export function TierListCard({
  id,
  name,
  tiers,
  author,
  userId,
  isPublic,
  showPublicToggle,
  onPublicChange,
  upvotes = 0,
  downvotes = 0,
  userVote = null,
  onVoteChange,
  onDelete,
}: TierListCardProps) {
  const { isAuthenticated, user } = useAuth();
  const isOwner = user?.id === userId;

  const spells = useMemo(() => {
    return Object.values(spellsData as Record<string, any>)
      .filter((spell) => ["spell", "ultimate", "veil"].includes(spell.category))
      .reduce((acc, spell) => {
        acc[spell.id] = { name: spell.name, img: spell.img };
        return acc;
      }, {} as Record<string, { name: string; img: string }>);
  }, []);

  // Show preview of all tiers
  const previewTiers: TierKey[] = ["S", "A", "B", "C", "D"];

  return (
    <TooltipProvider>
      <Card className="group relative bg-gradient-to-br from-black/90 via-zinc-900/80 to-black/90 border border-white/10 hover:border-red-500/30 transition-all duration-300 overflow-hidden h-full flex flex-col">
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <CardContent className="p-4 relative flex flex-col flex-1">
          {/* Top right corner - Action buttons */}
          <div
            className="absolute top-1 right-1 flex gap-2 z-10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {/* Vote buttons for community view - only show if not owner */}
            {id && onVoteChange && !isOwner && isPublic && (
              <div onClick={(e) => e.preventDefault()}>
                <TierListVoteButtons
                  tierListId={id}
                  initialUpvotes={upvotes}
                  initialDownvotes={downvotes}
                  initialUserVote={userVote}
                  onVoteChange={onVoteChange}
                />
              </div>
            )}

            {/* Delete button */}
            {onDelete && (
              <button
                type="button"
                className="bg-red-600/80 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200 backdrop-blur-sm border border-red-500/50 opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete();
                }}
                aria-label="Delete tier list"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* Public/Private toggle button */}
            {showPublicToggle && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className={`w-8 h-8 rounded-full border border-white/30 bg-black/80 flex items-center justify-center transition-colors opacity-100 ${
                      isAuthenticated && onPublicChange !== undefined
                        ? "hover:border-white/60 hover:bg-black cursor-pointer"
                        : "opacity-50 cursor-not-allowed"
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (isAuthenticated && onPublicChange !== undefined) {
                        onPublicChange(!isPublic);
                      }
                    }}
                    disabled={!isAuthenticated || onPublicChange === undefined}
                    aria-label={isPublic ? "Make tier list private" : "Make tier list public"}
                  >
                    {isPublic ? (
                      <Globe2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <Lock className="w-4 h-4 text-zinc-300" />
                    )}
                  </button>
                </TooltipTrigger>
                {(!isAuthenticated || onPublicChange === undefined) && (
                  <TooltipContent>
                    <p>Sign in to publish your tier lists</p>
                  </TooltipContent>
                )}
              </Tooltip>
            )}
          </div>

          {/* Header */}
          <div className="flex items-start justify-between mb-4 pr-12">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white truncate">{name}</h3>
              {author && (
                <div className="flex items-center gap-1.5 text-sm text-gray-400 mt-1">
                  <User className="w-3.5 h-3.5" />
                  <span className="truncate">{author}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tier Preview */}
          <div className="space-y-2 mb-4 flex-1">
            {previewTiers.map((tierKey) => {
              const tierSpells = tiers[tierKey] || [];
              const displaySpells = tierSpells.slice(0, 8);
              const remaining = tierSpells.length - displaySpells.length;

              return (
                <div key={tierKey} className="flex items-stretch gap-1">
                  <div
                    className={`w-8 flex items-center justify-center rounded-l bg-gradient-to-r ${tierColors[tierKey]} text-black font-extrabold text-sm`}
                  >
                    {tierKey}
                  </div>
                  <div className="flex-1 min-h-[32px] rounded-r border border-white/10 bg-black/40 px-1.5 py-1 flex flex-wrap gap-1 items-center">
                    {displaySpells.length === 0 ? (
                      <span className="text-[10px] text-gray-600">Empty</span>
                    ) : (
                      <>
                        {displaySpells.map((spellId) => {
                          const spell = spells[spellId];
                          if (!spell) return null;
                          return (
                            <Tooltip key={spellId}>
                              <TooltipTrigger asChild>
                                <div className="w-6 h-6 rounded overflow-hidden border border-white/20">
                                  <img
                                    src={spell.img}
                                    alt={spell.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs">
                                {spell.name}
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                        {remaining > 0 && (
                          <span className="text-[10px] text-gray-500 ml-1">
                            +{remaining}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

