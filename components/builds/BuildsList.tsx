"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Plus, Lock, Globe2, Trash2, User, Copy, Pencil } from "lucide-react";
import { VoteButtons } from "./VoteButtons";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Link from "next/link";
import { convertStringToBuild } from "../machines/converter";
import bloodData from "@/data/vbuilds/bloodtypes.json";
import { Button } from "@/components/ui/button";
import { ArenaCodeOutsideBuilder } from "../vbuilds/components/ArenaCode";
import epicWeaponData from "@/data/vbuilds/epic-weapons.json";
import { Switch } from "@/components/ui/switch";
import React from "react";
import "@/components/vbuilds/styles.css";
import { useAuth } from "@/hooks/use-auth";
import { AuthorBadge } from "@/components/AuthorBadge";
import { useUserBadges, UserBadgeType } from "@/hooks/use-author-badges";
import { Input } from "@/components/ui/input";
import { isValidEnglishAlphabet } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

type Build = {
  id?: string;
  name: string;
  code: string;
  isPublic?: boolean;
  author?: string;
  userId?: string | null;
};

interface BuildsListProps {
  maxBuilds?: number; // Maximum number of builds to show
  showViewAllButton?: boolean; // Whether to show the "View All" button
  onBuildsLoaded?: (hasBuilds: boolean) => void; // Callback when builds are loaded
}

const Img = ({
  src,
  alt = "",
  emptySrc,
}: {
  src: string | undefined;
  alt?: string;
  emptySrc: string;
}) => {
  return src ? (
    <img src={src} className="w-6 h-6" alt={alt} />
  ) : (
    <img
      src={emptySrc}
      alt={alt}
      className="w-6 h-6 grayscale brightness-50 pointer-events-none opacity-60"
    />
  );
};

function findMostFrequentSpellSchool(words: any[]): string {
  // Filter out undefined values
  const validWords = words.filter((word) => word !== undefined);

  // Return early if no valid words
  if (validWords.length === 0) return "";

  // Create a frequency map
  const frequency: Record<string, number> = {};

  // Count occurrences of each word
  for (const word of validWords) {
    frequency[word] = (frequency[word] || 0) + 1;
  }

  // Find the word with the highest frequency
  let mostFrequentWord = "";
  let highestFrequency = 0;

  for (const word in frequency) {
    if (frequency[word] > highestFrequency) {
      mostFrequentWord = word;
      highestFrequency = frequency[word];
    }
  }

  return mostFrequentWord;
}

const fromVariants: Record<string, string> = {
  empty: "from-spellSchool-empty/30",
  storm: "from-spellSchool-storm/5",
  blood: "from-spellSchool-blood/5",
  chaos: "from-spellSchool-chaos/5",
  arcane: "from-spellSchool-unholy/5",
  frost: "from-spellSchool-frost/5",
  illusion: "from-spellSchool-illusion/5",
};

const toVariants: Record<string, string> = {
  empty: "to-spellSchool-empty/5",
  storm: "to-spellSchool-storm/5",
  blood: "to-spellSchool-blood/5",
  chaos: "to-spellSchool-chaos/5",
  arcane: "to-spellSchool-unholy/5",
  frost: "to-spellSchool-frost/5",
  illusion: "to-spellSchool-illusion/5",
};

const borderVariants: Record<string, string> = {
  empty: "border-spellSchool-empty/30",
  storm: "border-spellSchool-storm/30",
  blood: "border-spellSchool-blood/30",
  chaos: "border-spellSchool-chaos/30",
  arcane: "border-spellSchool-unholy/30",
  frost: "border-spellSchool-frost/30",
  illusion: "border-spellSchool-illusion/30",
};

// Text colors follow the same custom spell school palette used for borders/backgrounds
// (see `styles.css` .spellSchool-* classes) so headers visually match the card border.
const textColorVariants: Record<string, string> = {
  empty: "text-gray-400",
  storm: "spellSchool-storm",
  blood: "spellSchool-blood",
  chaos: "spellSchool-chaos",
  // Arcane builds reuse the \"unholy\" color in the existing palette
  arcane: "spellSchool-unholy",
  frost: "spellSchool-frost",
  illusion: "spellSchool-illusion",
};

const Item = ({
  school,
  children,
}: {
  school: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={`relative w-8 h-8 bg-zinc-900/50 rounded border ${borderVariants[school]} flex items-center justify-center overflow-hidden`}
    >
      {children}
    </div>
  );
};

const AuthorNameWithBadge = ({ authorName, badge }: { authorName?: string; badge?: UserBadgeType | null }) => {
  return (
    <p className="text-sm text-gray-400 mt-1 flex items-center gap-1.5">
      <User className="w-3 h-3" />
      <span className="flex items-center gap-1.5">
        {authorName || "Unknown"}
        {badge && (
          <AuthorBadge
            badgeType={badge.badgeType}
            description={badge.description}
          />
        )}
      </span>
    </p>
  );
};

export const BuildContent = ({
  code,
  name,
  author,
  handleDeleteBuild,
  isPublic,
  onTogglePublic,
  showPublicToggle = true,
  isAuthenticated = true,
  upvotes,
  downvotes,
  userVote,
  buildId,
  userId,
  onVoteChange,
  isAdmin,
  onAdminDelete,
  buildLink,
  onClone,
  onRename,
  currentUserId,
  onNameUpdated,
  isMineTab,
  userBadge,
}: {
  code: string;
  name: string;
  author?: string;
  handleDeleteBuild?: (event: React.MouseEvent) => void;
  isPublic?: boolean;
  onTogglePublic?: (checked: boolean) => void;
  showPublicToggle?: boolean;
  isAuthenticated?: boolean;
  upvotes?: number;
  downvotes?: number;
  userVote?: "upvote" | "downvote" | null;
  buildId?: string;
  userId?: string | null;
  onVoteChange?: (upvotes: number, downvotes: number, userVote: "upvote" | "downvote" | null) => void;
  isAdmin?: boolean;
  onAdminDelete?: (event: React.MouseEvent) => void;
  buildLink?: string;
  onClone?: (event: React.MouseEvent, buildId: string, code: string, name: string) => void;
  onRename?: (event: React.MouseEvent, buildId: string, currentName: string) => void;
  currentUserId?: string | null;
  onNameUpdated?: (buildId: string, newName: string) => void;
  isMineTab?: boolean;
  userBadge?: UserBadgeType | null;
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState(name);
  const [isSavingName, setIsSavingName] = useState(false);

  // Update editing name when name prop changes
  useEffect(() => {
    if (!isEditingName) {
      setEditingName(name);
    }
  }, [name, isEditingName]);

  // Safely convert the arena code into a build structure.
  // If anything goes wrong we render a minimal, non-animated card instead
  // so that a bad code never breaks the whole builds grid.
  let build;
  try {
    build = convertStringToBuild(code);
  } catch (error) {
    console.error("Failed to parse build code", { code, error });
    return (
      <Card className="bg-black/80 backdrop-blur-sm rounded-lg border-2 border-red-900/50 h-full flex flex-col justify-between">
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            {name || "Invalid Build"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-300">
            There was an error loading this build. Please recreate or edit it in
            the builder.
          </p>
        </CardContent>
      </Card>
    );
  }

  const spells = build.spells;
  const dashSpellSchool = spells.dash?.spellSchool;
  const spell1SpellSchool = spells.spell1?.spellSchool;
  const spell2SpellSchool = spells.spell2?.spellSchool;
  const ultimateSpellSchool = spells.ultimate?.spellSchool;

  const school = findMostFrequentSpellSchool([
    dashSpellSchool,
    spell1SpellSchool,
    spell2SpellSchool,
    ultimateSpellSchool,
  ]);

  const getHeaderColor = () => {
    // Always follow the spell school color used for the card/border
    // (same mapping used by the item borders / background gradients).
    return textColorVariants[school || "empty"] || "text-gray-400";
  };

  const headerColor = getHeaderColor();

  // Handle inline name editing
  const canEditName = onRename && buildId && currentUserId && userId === currentUserId && !buildId.startsWith("local-");

  const handleStartEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingName(name);
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    const trimmedName = editingName.trim();

    // Validate name length (minimum 3 characters)
    if (!trimmedName || trimmedName.length < 3) {
      toast.error("Build name must be at least 3 characters long");
      setEditingName(name);
      setIsEditingName(false);
      return;
    }

    // Validate name length (maximum 30 characters)
    if (trimmedName.length > 30) {
      toast.error("Build name must be 30 characters or less");
      setEditingName(name);
      setIsEditingName(false);
      return;
    }

    // Validate name contains only English alphabet characters
    if (!isValidEnglishAlphabet(trimmedName)) {
      toast.error("Build name can only contain English alphabet characters, numbers, and spaces");
      setEditingName(name);
      setIsEditingName(false);
      return;
    }

    // Don't update if name hasn't changed
    if (trimmedName === name) {
      setIsEditingName(false);
      setEditingName(name);
      return;
    }

    if (!buildId || !onRename) return;

    setIsSavingName(true);

    try {
      // Create a synthetic event for onRename
      const syntheticEvent = {
        preventDefault: () => { },
        stopPropagation: () => { },
      } as React.MouseEvent;

      // Call the rename handler with the new name
      await new Promise<void>((resolve, reject) => {
        // We need to call the API directly since onRename uses window.prompt
        fetch(`/api/builds/${buildId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: trimmedName,
          }),
        })
          .then(async (response) => {
            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.error || "Failed to rename build");
            }
            return response.json();
          })
          .then(() => {
            setIsEditingName(false);
            setEditingName(trimmedName);
            toast.success("Build renamed successfully!");
            // Notify parent component to update the name
            if (onNameUpdated && buildId) {
              onNameUpdated(buildId, trimmedName);
            }
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      });
    } catch (error: any) {
      const errorMessage = error.message || "Failed to rename build";
      toast.error(errorMessage);
      setEditingName(name);
    } finally {
      setIsSavingName(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingName(name);
    setIsEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveName();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  return (
    <Card
      className={`bg-black/80 backdrop-blur-sm rounded-lg border-2 ${showPublicToggle && isPublic
        ? "border-green-500/50"
        : "border-zinc-800/50"
        } transition-all duration-300 overflow-hidden group cursor-pointer h-full relative build-spellSchool build-spellSchool-${school || "empty"
        }`}
    >
      {/* Glow effect on hover */}
      <div className="pointer-events-none absolute -inset-1 rounded-[14px] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div
          className={`absolute inset-0 bg-gradient-to-r ${fromVariants[school || "empty"]
            } to-transparent blur-xl`}
        />
        <div
          className={`absolute inset-0 bg-gradient-to-b ${fromVariants[school || "empty"]
            } via-transparent ${toVariants[school || "empty"]} blur-xl`}
        />
      </div>

      {/* Top right corner - Vote buttons and Action buttons */}
      <div
        className="absolute top-2 right-1 flex gap-2 z-10"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {/* Admin delete button - left side of vote buttons */}
        {isAdmin && onAdminDelete && (
          <button
            type="button"
            className="bg-yellow-600/80 hover:bg-yellow-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200 backdrop-blur-sm border border-yellow-500/50 opacity-0 group-hover:opacity-100 z-20"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAdminDelete(e);
            }}
            aria-label="Admin delete build"
            title="Admin: Delete this build"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {/* Clone button - below vote buttons for community builds */}
        {onClone && (
          <button
            type="button"
            className="bg-blue-600/80 hover:bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200 backdrop-blur-sm border border-blue-500/50 opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClone(e, buildId || `local-${code}`, code, name);
            }}
            aria-label="Clone build"
          >
            <Copy className="w-4 h-4" />
          </button>
        )}
        {/* Vote buttons */}
        {buildId && onVoteChange && (
          <VoteButtons
            buildId={buildId}
            initialUpvotes={upvotes || 0}
            initialDownvotes={downvotes || 0}
            initialUserVote={userVote || null}
            onVoteChange={onVoteChange}
          />
        )}
        {handleDeleteBuild && (
          <button
            type="button"
            className="bg-red-600/80 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200 backdrop-blur-sm border border-red-500/50 opacity-0 group-hover:opacity-100"
            onClick={handleDeleteBuild}
            aria-label="Delete build"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
        {showPublicToggle && (
          <button
            type="button"
            className={`w-8 h-8 rounded-full border border-white/30 bg-black/80 flex items-center justify-center transition-colors opacity-100 ${isAuthenticated && onTogglePublic !== undefined
              ? "hover:border-white/60 hover:bg-black cursor-pointer"
              : "opacity-50 cursor-not-allowed"
              }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (isAuthenticated && onTogglePublic !== undefined) {
                onTogglePublic(!isPublic);
              }
            }}
            disabled={!isAuthenticated || onTogglePublic === undefined}
            aria-label={isPublic ? "Make build private" : "Make build public"}
          >
            {isPublic ? (
              <Globe2 className="w-4 h-4 text-green-400" />
            ) : (
              <Lock className="w-4 h-4 text-zinc-300" />
            )}
          </button>
        )}
      </div>

      <CardHeader className="relative">
        <div className="flex items-center gap-2">
          {isEditingName ? (
            <Input
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={handleKeyDown}
              disabled={isSavingName}
              maxLength={30}
              className="text-xl font-bold bg-black/50 border-white/10 text-white placeholder:text-gray-500 h-auto py-1 px-2"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <>
              <CardTitle
                className={`text-xl font-bold text-white ${isMineTab ? "group-hover:truncate group-hover:max-w-[10ch] group-hover:overflow-hidden group-hover:text-ellipsis" : ""}`}
                title={name || "Unnamed Build"}
              >
                {isMineTab ? (
                  <>
                    <span className="group-hover:hidden">{name || "Unnamed Build"}</span>
                    <span className="hidden group-hover:inline">
                      {name && name.length > 10 ? `${name.substring(0, 10)}...` : name || "Unnamed Build"}
                    </span>
                  </>
                ) : (
                  name || "Unnamed Build"
                )}
              </CardTitle>
              {/* Rename button - only show if user owns the build */}
              {canEditName && (
                <button
                  type="button"
                  className="text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100 p-1"
                  onClick={handleStartEdit}
                  aria-label="Rename build"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
        {/* Always show author - use "You" as fallback */}
        <AuthorNameWithBadge authorName={author || "You"} badge={userBadge} />
      </CardHeader>
      <CardContent className="relative">
        <div className="space-y-6">
          {/* Top Row - Armor, Buffs, Blood */}
          <div className="grid grid-cols-3 gap-4">
            {/* Armor Section */}
            <div className="space-y-2">
              <div className={`text-xs font-bold ${headerColor} uppercase tracking-wider`}>
                Armour
              </div>
              <div className="flex gap-1">
                <Item school={school}>
                  <Img
                    src={build.armour?.image}
                    alt="Armour"
                    emptySrc="/images/vbuilds/armour/armour-draculas_shadow_chestguard.webp"
                  />
                </Item>
                <Item school={school}>
                  <Img
                    src={build.amulet?.image}
                    alt="Amulet"
                    emptySrc="/images/vbuilds/amulets/Jewelry_AmuletoftheBlademaster.webp"
                  />
                </Item>
              </div>
            </div>

            {/* Buffs Section */}
            <div className="space-y-2">
              <div className={`text-xs font-bold ${headerColor} uppercase tracking-wider`}>
                Buffs
              </div>
              <div className="flex gap-1">
                <Item school={school}>
                  <Img
                    src={build.elixir?.image}
                    alt="Elixir"
                    emptySrc="/images/vbuilds/elixirs/elixir-prowler.webp"
                  />
                </Item>
                {build.coatings.size > 0 ? (
                  Array.from(build.coatings.values())
                    .slice(0, 2)
                    .map((coating, index) =>
                      coating && coating.image ? (
                        <Item key={index} school={school}>
                          <Img
                            src={coating.image}
                            alt={`Coating ${index}`}
                            emptySrc="/images/vbuilds/consumables/BloodCoating.webp"
                          />
                        </Item>
                      ) : null
                    )
                ) : (
                  <Item school={school}>
                    <Img
                      src={undefined}
                      alt={`Coating Empty`}
                      emptySrc="/images/vbuilds/consumables/BloodCoating.webp"
                    />
                  </Item>
                )}
              </div>
            </div>

            {/* Blood Section */}
            <div className="space-y-2">
              <div className={`text-xs font-bold ${headerColor} uppercase tracking-wider`}>
                Blood
              </div>
              <div className="flex gap-1">
                <Item school={school}>
                  <Img
                    src={
                      bloodData[
                        (build.blood?.primary as keyof typeof bloodData) ||
                        "Empty"
                      ]?.image
                    }
                    alt={`Blood: ${build.blood?.primary || "Empty"}`}
                    emptySrc="images/vbuilds/blood/rogue-blood.webp"
                  />
                </Item>

                <Item school={school}>
                  <Img
                    src={
                      bloodData[
                        build.blood?.secondary as keyof typeof bloodData
                      ]?.image
                    }
                    alt={`Blood: ${build.blood?.secondary || "Empty"}`}
                    emptySrc="/images/vbuilds/blood/warrior-blood.webp"
                  />
                </Item>
              </div>
            </div>
          </div>

          {/* Middle Row - Spells and Passives */}
          <div className="grid grid-cols-2 gap-4">
            {/* Spells Section */}
            <div className="space-y-2">
              <div className={`text-xs font-bold ${headerColor} uppercase tracking-wider`}>
                Spells
              </div>
              <div className="flex flex-1 gap-1">
                <Item school={school}>
                  <Img
                    src={build.spells.dash?.img}
                    alt="Veil"
                    emptySrc="/images/vbuilds/spells/spell-blood-veil_of_blood.webp"
                  />
                </Item>

                <Item school={school}>
                  <Img
                    src={build.spells.spell1?.img}
                    alt="Spell 1"
                    emptySrc="/images/vbuilds/spells/spell-blood-blood_rage.webp"
                  />
                </Item>

                <Item school={school}>
                  <Img
                    src={build.spells.spell2?.img}
                    alt="Spell 2"
                    emptySrc="/images/vbuilds/spells/spell-blood-blood_rite.webp"
                  />
                </Item>

                <Item school={school}>
                  <Img
                    src={build.spells.ultimate?.img}
                    alt="Ultimate"
                    emptySrc="/images/vbuilds/spells/spell-chaos-merciless_charge.webp"
                  />
                </Item>
              </div>
            </div>

            {/* Passives Section */}
            <div className="space-y-2">
              <div className={`text-xs font-bold ${headerColor} uppercase tracking-wider`}>
                Passives
              </div>
              <div className="flex gap-1">
                {build.passives.length === 0 && (
                  <>
                    <Item school={school}>
                      <Img
                        src={undefined}
                        emptySrc="/images/vbuilds/passives/passive-blood_spray.jpg"
                      />
                    </Item>
                    <Item school={school}>
                      <Img
                        src={undefined}
                        emptySrc="/images/vbuilds/passives/passive-chaos_kindling.jpg"
                      />
                    </Item>
                    <Item school={school}>
                      <Img
                        src={undefined}
                        emptySrc="/images/vbuilds/passives/passive-arcane_animator.jpg"
                      />
                    </Item>
                    <Item school={school}>
                      <Img
                        src={undefined}
                        emptySrc="/images/vbuilds/passives/passive-spiritual_infusion.jpg"
                      />
                    </Item>
                    <Item school={school}>
                      <Img
                        src={undefined}
                        emptySrc="/images/vbuilds/passives/passive-cold_soul.jpg"
                      />
                    </Item>
                  </>
                )}
                {build.passives.slice(0, 6).map((passive, index) => (
                  <Item key={index} school={school}>
                    <Img
                      src={passive.img}
                      alt={`Passive ${index}`}
                      emptySrc="/images/vbuilds/passives/passive-blood_spray.jpg"
                    />
                  </Item>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Row - Weapons */}
          <div className="space-y-2">
            <div className={`text-xs font-bold ${headerColor} uppercase tracking-wider`}>
              Weapons
            </div>
            <div className="flex gap-1 flex-wrap">
              {build.weapons.size === 0
                ? Object.values(epicWeaponData)
                  .slice(0, 8)
                  .map((weapon, index) => (
                    <Item key={index} school={school}>
                      <Img
                        src={undefined}
                        alt={`Weapon ${index}`}
                        emptySrc={weapon.img}
                      />
                    </Item>
                  ))
                : Array.from(build.weapons.values()).map((weapon, index) => (
                  <Item school={school} key={index}>
                    <Img
                      src={weapon.img}
                      alt={`Weapon ${index}`}
                      emptySrc=""
                    />
                  </Item>
                ))}
            </div>
          </div>
        </div>
        <div className="flex gap-4 justify-between">
          <div className="mt-4">
            <ArenaCodeOutsideBuilder code={code} />
          </div>
        </div>
      </CardContent>
    </Card >
  );
};

export default function BuildsList({
  maxBuilds,
  onBuildsLoaded,
}: BuildsListProps = {}) {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBuilds, setTotalBuilds] = useState(0);
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  // Get the builds to display (limited by maxBuilds if specified)
  const buildsToShow = maxBuilds ? builds.slice(0, maxBuilds) : builds;

  // Collect user IDs for batch fetching badges
  const userIds = Array.from(new Set(buildsToShow
    .map((build) => build.userId)
    .filter((id): id is string => Boolean(id))));

  const { badges } = useUserBadges(userIds);

  useEffect(() => {
    const fetchBuilds = async () => {
      if (authLoading) return;

      if (!isAuthenticated) {
        // Load builds from localStorage for non-authenticated users
        setLoading(true);
        try {
          if (typeof window !== "undefined") {
            const localBuildsData = localStorage.getItem("vbuilds");
            if (localBuildsData) {
              try {
                const parsed = JSON.parse(localBuildsData);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  // Convert localStorage format to Build format
                  const buildsArray = parsed.map((build: any, index: number) => ({
                    id: `local-${index}-${build.name}`, // Generate temporary ID
                    name: build.name || `Build ${index + 1}`,
                    code: build.code || "",
                    isPublic: false, // LocalStorage builds are always private
                    author: "You", // Fallback for localStorage builds
                    userId: null,
                  }));
                  setBuilds(buildsArray);
                  onBuildsLoaded?.(buildsArray.length > 0);
                  setLoading(false);
                  return;
                }
              } catch (error) {
                console.error("Failed to parse local builds:", error);
              }
            }
          }
          setBuilds([]);
          onBuildsLoaded?.(false);
        } catch (error) {
          console.error("Failed to load local builds:", error);
          setBuilds([]);
          onBuildsLoaded?.(false);
        } finally {
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        // Use pagination: 11 builds per page
        const page = maxBuilds ? 1 : currentPage; // If maxBuilds is set (homepage), always fetch page 1
        const limit = maxBuilds || 11; // Use maxBuilds if set, otherwise 11 per page
        const response = await fetch(`/api/builds?page=${page}&limit=${limit}`);

        if (response.status === 401) {
          setBuilds([]);
          setLoading(false);
          onBuildsLoaded?.(false);
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch builds");
        }

        const data = await response.json();
        // Handle both old format (array) and new format (object with builds array)
        const buildsArray = Array.isArray(data)
          ? data.map((build: any) => ({
            id: build.id,
            name: build.name,
            code: build.code,
            isPublic: build.isPublic || false,
            author: build.author || "You", // Fallback to "You" if author is missing
            userId: build.userId || null,
          }))
          : (data.builds || []).map((build: any) => ({
            id: build.id,
            name: build.name,
            code: build.code,
            isPublic: build.isPublic || false,
            author: build.author || "You", // Fallback to "You" if author is missing
            userId: build.userId || null,
          }));

        // Sort builds: public builds first, then private builds
        const sortedBuilds = buildsArray.sort((a: { isPublic: boolean; }, b: { isPublic: boolean; }) => {
          if (a.isPublic && !b.isPublic) return -1;
          if (!a.isPublic && b.isPublic) return 1;
          return 0;
        });

        setBuilds(sortedBuilds);

        // Update pagination info if available
        if (data.total !== undefined) {
          setTotalBuilds(data.total);
          setTotalPages(data.totalPages || 1);
        }

        onBuildsLoaded?.(sortedBuilds.length > 0);
      } catch (error) {
        console.error("Failed to load builds:", error);
        setBuilds([]);
        onBuildsLoaded?.(false);
      } finally {
        setLoading(false);
      }
    };

    fetchBuilds();
  }, [isAuthenticated, authLoading, onBuildsLoaded, currentPage, maxBuilds]);

  const handleDelete = async (event: React.MouseEvent, buildId: string, index: number) => {
    // Prevent the card click event from triggering
    event.preventDefault();
    event.stopPropagation();

    if (!buildId) {
      toast.error("Build ID not found");
      return;
    }

    const confirmed = window.confirm("Are you sure you want to delete this build?");
    if (!confirmed) return;

    // Check if this is a localStorage build
    if (buildId.startsWith("local-")) {
      try {
        if (typeof window !== "undefined") {
          const localBuildsData = localStorage.getItem("vbuilds");
          if (localBuildsData) {
            const parsed = JSON.parse(localBuildsData);
            if (Array.isArray(parsed)) {
              // Remove the build at the specified index
              const updatedBuilds = parsed.filter((_, i) => i !== index);
              localStorage.setItem("vbuilds", JSON.stringify(updatedBuilds));

              // Update state
              const buildsArray = updatedBuilds.map((build: any, idx: number) => ({
                id: `local-${idx}-${build.name}`,
                name: build.name || `Build ${idx + 1}`,
                code: build.code || "",
                isPublic: false,
              }));
              setBuilds(buildsArray);
              onBuildsLoaded?.(buildsArray.length > 0);
              toast.success("Build deleted successfully");
              return;
            }
          }
        }
        toast.error("Failed to delete build from local storage");
      } catch (error) {
        console.error("Failed to delete local build:", error);
        toast.error("Failed to delete build");
      }
      return;
    }

    // Delete from API for authenticated users
    try {
      const response = await fetch(`/api/builds/${buildId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete build");
      }

      // Refresh builds list after deletion
      // If this was the last item on the page and not page 1, go to previous page
      const shouldGoToPreviousPage = !maxBuilds && builds.length === 1 && currentPage > 1;
      const page = maxBuilds ? 1 : (shouldGoToPreviousPage ? currentPage - 1 : currentPage);
      const limit = maxBuilds || 11;

      if (shouldGoToPreviousPage) {
        setCurrentPage(page);
      }

      const refreshResponse = await fetch(`/api/builds?page=${page}&limit=${limit}`);
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        const buildsArray = Array.isArray(refreshData)
          ? refreshData.map((build: any) => ({
            id: build.id,
            name: build.name,
            code: build.code,
            isPublic: build.isPublic || false,
            author: build.author || "You", // Fallback to "You" if author is missing
            userId: build.userId || null,
          }))
          : (refreshData.builds || []).map((build: any) => ({
            id: build.id,
            name: build.name,
            code: build.code,
            isPublic: build.isPublic || false,
            author: build.author || "You", // Fallback to "You" if author is missing
            userId: build.userId || null,
          }));
        const sortedBuilds = buildsArray.sort((a: { isPublic: boolean; }, b: { isPublic: boolean; }) => {
          if (a.isPublic && !b.isPublic) return -1;
          if (!a.isPublic && b.isPublic) return 1;
          return 0;
        });
        setBuilds(sortedBuilds);

        // Update pagination info if available
        if (refreshData.total !== undefined) {
          setTotalBuilds(refreshData.total);
          setTotalPages(refreshData.totalPages || 1);
        }

        onBuildsLoaded?.(sortedBuilds.length > 0);
      } else {
        // Fallback: remove from current list
        const updatedBuilds = builds.filter((_, i) => i !== index);
        setBuilds(updatedBuilds);
        onBuildsLoaded?.(updatedBuilds.length > 0);
      }
      toast.success("Build deleted successfully");
    } catch (error) {
      console.error("Failed to delete build:", error);
      toast.error("Failed to delete build");
    }
  };

  const handleCopyCommand = async (event: React.MouseEvent, code: string) => {
    event.stopPropagation();
    const command = `.import-build ${code}`;

    try {
      await navigator.clipboard.writeText(command);
      toast("Build Command Copied", {
        className: "bg-black text-white",
        description: "Paste in-game chat to import.",
      });
    } catch (error) {
      toast.error("Failed to copy command");
    }
  };

  // Helper function to check if a build code is empty (all zeros)
  const isEmptyBuild = (code: string): boolean => {
    if (!code || typeof code !== "string") return true;
    // Remove all zeros and check if anything remains
    return code.replace(/0/g, "").trim().length === 0;
  };

  // Helper function to check if a build is complete (all required slots filled)
  const isBuildComplete = (code: string): boolean => {
    if (!code || typeof code !== "string" || code.length < 78) return false;

    try {
      const elixir = code[0];
      const amulet = code[70];
      const armour = code.slice(71, 75);
      const blood = code.slice(75, 78);
      const spells = code.slice(14, 30);
      const weapons = code.slice(30, 70);
      const passives = code.slice(9, 14);

      // Check elixir
      if (elixir === '0' || !elixir) return false;

      // Check amulet
      if (amulet === '0' || !amulet) return false;

      // Check armour (should not be all zeros)
      if (armour.replace(/0/g, "").length === 0) return false;

      // Check blood (all 3 chars must be non-zero)
      if (blood.length !== 3 || blood.includes('0') || blood.replace(/0/g, "").length < 3) return false;

      // Check spells: dash (index 10), spell1 (index 0), spell2 (index 5), ultimate (index 15)
      if (spells.length < 16) return false;
      if (spells[0] === '0' || !spells[0]) return false; // spell1
      if (spells[5] === '0' || !spells[5]) return false; // spell2
      if (spells[10] === '0' || !spells[10]) return false; // dash
      if (spells[15] === '0' || !spells[15]) return false; // ultimate

      // Check weapons (at least one weapon slot should be filled)
      let hasWeapon = false;
      for (let i = 0; i < 8; i++) {
        const weaponStart = i * 5;
        if (weapons[weaponStart] && weapons[weaponStart] !== '0') {
          hasWeapon = true;
          break;
        }
      }
      if (!hasWeapon) return false;

      // Check passives (all 5 should be filled)
      if (passives.length < 5) return false;
      for (let i = 0; i < 5; i++) {
        if (passives[i] === '0' || !passives[i]) return false;
      }

      return true;
    } catch (error) {
      console.error("Error checking build completeness:", error);
      return false;
    }
  };

  const handleClone = async (event: React.MouseEvent, buildId: string, code: string, name: string) => {
    event.preventDefault();
    event.stopPropagation();

    // If user is not authenticated, clone to localStorage
    if (!isAuthenticated) {
      try {
        if (typeof window !== "undefined") {
          const clonedName = `${name} (Copy)`;
          const localBuildsData = localStorage.getItem("vbuilds");
          const existingBuilds = localBuildsData ? JSON.parse(localBuildsData) : [];

          // Add cloned build to localStorage
          existingBuilds.push({
            name: clonedName,
            code: code,
          });

          localStorage.setItem("vbuilds", JSON.stringify(existingBuilds));

          // Update state
          const buildsArray = existingBuilds.map((build: any, idx: number) => ({
            id: `local-${idx}-${build.name}`,
            name: build.name || `Build ${idx + 1}`,
            code: build.code || "",
            isPublic: false,
            author: "You",
            userId: null,
          }));
          setBuilds(buildsArray);
          onBuildsLoaded?.(buildsArray.length > 0);

          toast.success("Build cloned to local storage!");
        }
      } catch (error) {
        console.error("Error cloning build to localStorage:", error);
        toast.error("Failed to clone build");
      }
      return;
    }

    // If authenticated, clone via API
    if (!buildId || buildId.startsWith("local-")) {
      // Clone local build to API
      try {
        const clonedName = `${name} (Copy)`;
        const response = await fetch("/api/builds", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: clonedName,
            code: code,
            isPublic: false,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          const errorMessage = error.error || "Failed to clone build";
          toast.error(errorMessage);
          return;
        }

        toast.success("Build cloned successfully!");

        // Refresh builds list
        const page = maxBuilds ? 1 : currentPage;
        const limit = maxBuilds || 11;
        const refreshResponse = await fetch(`/api/builds?page=${page}&limit=${limit}`);
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          const buildsArray = Array.isArray(refreshData)
            ? refreshData.map((build: any) => ({
              id: build.id,
              name: build.name,
              code: build.code,
              isPublic: build.isPublic || false,
              author: build.author || "You",
              userId: build.userId || null,
            }))
            : (refreshData.builds || []).map((build: any) => ({
              id: build.id,
              name: build.name,
              code: build.code,
              isPublic: build.isPublic || false,
              author: build.author || "You",
              userId: build.userId || null,
            }));
          const sortedBuilds = buildsArray.sort((a: { isPublic: boolean; }, b: { isPublic: boolean; }) => {
            if (a.isPublic && !b.isPublic) return -1;
            if (!a.isPublic && b.isPublic) return 1;
            return 0;
          });
          setBuilds(sortedBuilds);

          if (refreshData.total !== undefined) {
            setTotalBuilds(refreshData.total);
            setTotalPages(refreshData.totalPages || 1);
          }

          onBuildsLoaded?.(sortedBuilds.length > 0);
        }
      } catch (error) {
        console.error("Error cloning build:", error);
        toast.error("Failed to clone build");
      }
      return;
    }

    try {
      // Generate a cloned name
      const clonedName = `${name} (Copy)`;

      const response = await fetch("/api/builds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: clonedName,
          code: code,
          isPublic: false, // Cloned builds start as private
        }),
      });

      if (response.status === 401) {
        toast.error("Please sign in to clone builds");
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        const errorMessage = error.error || "Failed to clone build";
        toast.error(errorMessage);
        return;
      }

      toast.success("Build cloned successfully!");

      // Refresh builds list
      const page = maxBuilds ? 1 : currentPage;
      const limit = maxBuilds || 11;
      const refreshResponse = await fetch(`/api/builds?page=${page}&limit=${limit}`);
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        const buildsArray = Array.isArray(refreshData)
          ? refreshData.map((build: any) => ({
            id: build.id,
            name: build.name,
            code: build.code,
            isPublic: build.isPublic || false,
            author: build.author || "You", // Fallback to "You" if author is missing
            userId: build.userId || null,
          }))
          : (refreshData.builds || []).map((build: any) => ({
            id: build.id,
            name: build.name,
            code: build.code,
            isPublic: build.isPublic || false,
            author: build.author || "You", // Fallback to "You" if author is missing
            userId: build.userId || null,
          }));
        const sortedBuilds = buildsArray.sort((a: { isPublic: boolean; }, b: { isPublic: boolean; }) => {
          if (a.isPublic && !b.isPublic) return -1;
          if (!a.isPublic && b.isPublic) return 1;
          return 0;
        });
        setBuilds(sortedBuilds);

        // Update pagination info if available
        if (refreshData.total !== undefined) {
          setTotalBuilds(refreshData.total);
          setTotalPages(refreshData.totalPages || 1);
        }

        onBuildsLoaded?.(sortedBuilds.length > 0);
      }
    } catch (error) {
      console.error("Error cloning build:", error);
      toast.error("Failed to clone build");
    }
  };

  const handleRename = async (event: React.MouseEvent, buildId: string, currentName: string) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please sign in to rename builds");
      return;
    }

    if (!buildId || buildId.startsWith("local-")) {
      toast.error("Cannot rename local builds. Please sign in first.");
      return;
    }

    const newName = window.prompt("Enter new build name:", currentName);
    if (!newName || newName.trim() === currentName) {
      return; // User cancelled or didn't change the name
    }

    try {
      const response = await fetch(`/api/builds/${buildId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newName.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        const errorMessage = error.error || "Failed to rename build";
        toast.error(errorMessage);
        return;
      }

      toast.success("Build renamed successfully!");

      // Refresh builds list
      const page = maxBuilds ? 1 : currentPage;
      const limit = maxBuilds || 11;
      const refreshResponse = await fetch(`/api/builds?page=${page}&limit=${limit}`);
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        const buildsArray = Array.isArray(refreshData)
          ? refreshData.map((build: any) => ({
            id: build.id,
            name: build.name,
            code: build.code,
            isPublic: build.isPublic || false,
            author: build.author || "You", // Fallback to "You" if author is missing
            userId: build.userId || null,
          }))
          : (refreshData.builds || []).map((build: any) => ({
            id: build.id,
            name: build.name,
            code: build.code,
            isPublic: build.isPublic || false,
            author: build.author || "You", // Fallback to "You" if author is missing
            userId: build.userId || null,
          }));
        const sortedBuilds = buildsArray.sort((a: { isPublic: boolean; }, b: { isPublic: boolean; }) => {
          if (a.isPublic && !b.isPublic) return -1;
          if (!a.isPublic && b.isPublic) return 1;
          return 0;
        });
        setBuilds(sortedBuilds);

        // Update pagination info if available
        if (refreshData.total !== undefined) {
          setTotalBuilds(refreshData.total);
          setTotalPages(refreshData.totalPages || 1);
        }

        onBuildsLoaded?.(sortedBuilds.length > 0);
      }
    } catch (error) {
      console.error("Error renaming build:", error);
      toast.error("Failed to rename build");
    }
  };

  const handleTogglePublic = async (
    buildId: string,
    currentIsPublic: boolean
  ) => {
    // If trying to make build public, check if user already has 5 public builds and if build is empty
    if (!currentIsPublic) {
      // Find the build to check its code
      const buildToToggle = builds.find(b => b.id === buildId);

      // Check if build is empty
      if (buildToToggle && isEmptyBuild(buildToToggle.code)) {
        toast.error(
          "Cannot make an empty build public. Please add items to your build first.",
          {
            duration: 5000,
          }
        );
        return;
      }

      // Check if build is complete
      if (buildToToggle && !isBuildComplete(buildToToggle.code)) {
        toast.error(
          "Cannot make an incomplete build public. Please fill all required slots (armour, amulet, elixir, blood, spells, weapons, and passives) first.",
          {
            duration: 5000,
          }
        );
        return;
      }

      const publicBuildCount = builds.filter(b => b.isPublic).length;
      if (publicBuildCount >= 5) {
        toast.error(
          "You can only have 5 public builds. Please make another build private or delete a public build first.",
          {
            duration: 5000,
          }
        );
        return;
      }
    }

    try {
      const response = await fetch(`/api/builds/${buildId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isPublic: !currentIsPublic,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || "Failed to update build visibility";

        // Show specific error message if it's about the limit, empty build, or incomplete build
        if (response.status === 400 && (errorMessage.includes("5 public builds") || errorMessage.includes("empty build") || errorMessage.includes("incomplete build"))) {
          toast.error(errorMessage, {
            duration: 5000,
          });
        } else {
          toast.error(errorMessage);
        }
        return;
      }

      // Refresh builds list to get updated data
      const page = maxBuilds ? 1 : currentPage;
      const limit = maxBuilds || 11;
      const refreshResponse = await fetch(`/api/builds?page=${page}&limit=${limit}`);
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        const buildsArray = Array.isArray(refreshData)
          ? refreshData.map((build: any) => ({
            id: build.id,
            name: build.name,
            code: build.code,
            isPublic: build.isPublic || false,
            author: build.author || "You", // Fallback to "You" if author is missing
            userId: build.userId || null,
          }))
          : (refreshData.builds || []).map((build: any) => ({
            id: build.id,
            name: build.name,
            code: build.code,
            isPublic: build.isPublic || false,
            author: build.author || "You", // Fallback to "You" if author is missing
            userId: build.userId || null,
          }));
        const sortedBuilds = buildsArray.sort((a: { isPublic: boolean; }, b: { isPublic: boolean; }) => {
          if (a.isPublic && !b.isPublic) return -1;
          if (!a.isPublic && b.isPublic) return 1;
          return 0;
        });
        setBuilds(sortedBuilds);

        // Update pagination info if available
        if (refreshData.total !== undefined) {
          setTotalBuilds(refreshData.total);
          setTotalPages(refreshData.totalPages || 1);
        }
      }

      toast.success(
        `Build ${!currentIsPublic ? "made public" : "made private"}`
      );
    } catch (error) {
      console.error("Failed to toggle build visibility:", error);
      toast.error("Failed to update build visibility");
    }
  };


  // // Calculate button span based on grid layout and number of builds
  const getButtonSpanClass = () => {
    const buildCount = buildsToShow.length;

    // For mobile (1 column): always full width
    // For md (2 columns): if odd number of builds, span 2, if even span 1
    // For lg (3 columns):
    //   - if builds % 3 === 0: span 3 (full width) - button alone on row
    //   - if builds % 3 === 1: span 2 (2/3 width) - 1 build + button on row
    //   - if builds % 3 === 2: span 1 (1/3 width) - 2 builds + button on row

    const mdSpan = buildCount % 2 === 0 ? "md:col-span-2" : "md:col-span-1";
    const lgSpan =
      buildCount % 3 === 0
        ? "lg:col-span-3"
        : buildCount % 3 === 1
          ? "lg:col-span-2"
          : "lg:col-span-1";

    return `col-span-1 ${mdSpan} ${lgSpan}`;
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Increased stagger delay for more noticeable succession
      },
    },
  };

  // Build Card Skeleton Component
  const BuildCardSkeleton = () => (
    <Card className="bg-black/80 backdrop-blur-sm rounded-lg border-2 border-zinc-800/50 h-full flex flex-col">
      <CardHeader className="relative">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="relative space-y-6">
        {/* Top Row - Armor, Buffs, Blood */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <div className="flex gap-1">
              <Skeleton className="w-8 h-8 rounded" />
              <Skeleton className="w-8 h-8 rounded" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-12" />
            <div className="flex gap-1">
              <Skeleton className="w-8 h-8 rounded" />
              <Skeleton className="w-8 h-8 rounded" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-12" />
            <div className="flex gap-1">
              <Skeleton className="w-8 h-8 rounded" />
              <Skeleton className="w-8 h-8 rounded" />
            </div>
          </div>
        </div>

        {/* Middle Row - Spells and Passives */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <div className="flex gap-1">
              <Skeleton className="w-8 h-8 rounded" />
              <Skeleton className="w-8 h-8 rounded" />
              <Skeleton className="w-8 h-8 rounded" />
              <Skeleton className="w-8 h-8 rounded" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <div className="flex gap-1 flex-wrap">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="w-8 h-8 rounded" />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row - Weapons */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <div className="flex gap-1 flex-wrap">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="w-8 h-8 rounded" />
            ))}
          </div>
        </div>

        {/* Arena Code */}
        <div className="mt-4">
          <Skeleton className="h-8 w-full" />
        </div>
      </CardContent>
    </Card>
  );

  // Custom container for premade builds without stagger delay

  // Check for local builds to import
  const [hasLocalBuilds, setHasLocalBuilds] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && isAuthenticated) {
      try {
        const localBuilds = localStorage.getItem("vbuilds");
        if (localBuilds) {
          const parsed = JSON.parse(localBuilds);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setHasLocalBuilds(true);
          }
        }
      } catch (error) {
        // Ignore errors
      }
    }
  }, [isAuthenticated]);

  const handleImportLocalBuilds = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to import builds");
      return;
    }

    try {
      const localBuilds = localStorage.getItem("vbuilds");
      if (!localBuilds) {
        toast.error("No local builds found");
        return;
      }

      const parsed = JSON.parse(localBuilds);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        toast.error("No local builds to import");
        return;
      }

      setImporting(true);
      let imported = 0;
      let failed = 0;

      for (const localBuild of parsed) {
        try {
          const response = await fetch("/api/builds", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: localBuild.name || `Imported Build ${imported + 1}`,
              code: localBuild.code,
            }),
          });

          if (response.ok) {
            imported++;
          } else {
            failed++;
          }
        } catch (error) {
          failed++;
        }
      }

      // Clear localStorage after successful import
      if (imported > 0) {
        localStorage.removeItem("vbuilds");
        setHasLocalBuilds(false);

        // Refresh builds list
        const page = maxBuilds ? 1 : currentPage;
        const limit = maxBuilds || 11;
        const response = await fetch(`/api/builds?page=${page}&limit=${limit}`);
        if (response.ok) {
          const data = await response.json();
          // Handle both old format (array) and new format (object with builds array)
          const buildsArray = Array.isArray(data)
            ? data.map((build: any) => ({
              id: build.id,
              name: build.name,
              code: build.code,
              isPublic: build.isPublic || false,
            }))
            : (data.builds || []).map((build: any) => ({
              id: build.id,
              name: build.name,
              code: build.code,
              isPublic: build.isPublic || false,
            }));
          // Sort builds: public builds first, then private builds
          const sortedBuilds = buildsArray.sort((a: { isPublic: boolean; }, b: { isPublic: boolean; }) => {
            if (a.isPublic && !b.isPublic) return -1;
            if (!a.isPublic && b.isPublic) return 1;
            return 0;
          });
          setBuilds(sortedBuilds);

          // Update pagination info if available
          if (data.total !== undefined) {
            setTotalBuilds(data.total);
            setTotalPages(data.totalPages || 1);
          }

          onBuildsLoaded?.(sortedBuilds.length > 0);
        }

        toast.success(
          `Imported ${imported} build${imported !== 1 ? "s" : ""}${failed > 0 ? `, ${failed} failed` : ""}`
        );
      } else {
        toast.error("Failed to import builds");
      }
    } catch (error) {
      console.error("Error importing builds:", error);
      toast.error("Error importing builds");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="pb-16">
      {/* Import Local Builds Banner */}
      {hasLocalBuilds && isAuthenticated && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-yellow-900/20 border border-yellow-800/50 rounded-lg flex items-center justify-between gap-4"
        >
          <div>
            <p className="text-yellow-200 font-medium">
              You have local builds that can be imported
            </p>
            <p className="text-yellow-300/70 text-sm">
              Import your saved builds to access them from any device
            </p>
          </div>
          <Button
            onClick={handleImportLocalBuilds}
            disabled={importing}
            className="bg-yellow-900/50 hover:bg-yellow-900/70 border-yellow-800 text-yellow-200"
          >
            {importing ? "Importing..." : "Import Local Builds"}
          </Button>
        </motion.div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 11 }).map((_, index) => (
            <BuildCardSkeleton key={index} />
          ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          viewport={{ once: true }}
        >
          {buildsToShow.length !== 0 && (
            <motion.div variants={scaleIn}>
              <Link href="/builds/create">
                <Card className="bg-black/80 backdrop-blur-sm rounded-lg border-2 border-dashed border-white/30 hover:border-white/60 transition-all duration-300 overflow-hidden group cursor-pointer h-full relative flex items-center justify-center min-h-[400px]">
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/10" />
                  </div>

                  <div className="flex flex-col items-center justify-center gap-4 p-8 relative z-10">
                    {/* Plus icon in circle */}
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/40 flex items-center justify-center group-hover:border-white/60 transition-colors duration-300">
                      <Plus className="w-8 h-8 text-white/60 group-hover:text-white group-hover:rotate-90 transition-all duration-300" />
                    </div>

                    {/* Text */}
                    <span className="text-white/60 group-hover:text-white font-bold text-lg tracking-wide transition-colors duration-300">
                      CREATE A NEW BUILD
                    </span>
                  </div>
                </Card>
              </Link>
            </motion.div>
          )}
          {buildsToShow.map((build, index) => (
            <motion.div
              key={build.id || index}
              variants={scaleIn}
            >
              <Link
                href={`/builds/create?build=${encodeURIComponent(build.code)}`}
              >
                <BuildContent
                  code={build.code}
                  name={build.name}
                  author={build.author}
                  userId={build.userId}
                  handleDeleteBuild={(event: React.MouseEvent) =>
                    handleDelete(event, build.id || "", index)
                  }
                  isPublic={build.isPublic}
                  isAuthenticated={isAuthenticated}
                  onTogglePublic={(checked) => {
                    if (build.id && !build.id.startsWith("local-")) {
                      handleTogglePublic(build.id, build.isPublic || false);
                    }
                  }}
                  showPublicToggle={true}
                  buildId={build.id}
                  onClone={handleClone}
                  onRename={build.id && !build.id.startsWith("local-") ? handleRename : undefined}
                  currentUserId={user?.id || null}
                  onNameUpdated={(buildId, newName) => {
                    // Update the build name in the local state
                    setBuilds((prev) =>
                      prev.map((b) =>
                        b.id === buildId ? { ...b, name: newName } : b
                      )
                    );
                  }}
                  isMineTab={true}
                  userBadge={build.userId ? badges[build.userId] : null}
                />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pagination Controls - Only show when there are 11+ builds and not using maxBuilds (homepage) */}
      {!maxBuilds && totalBuilds >= 11 && totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {/* Page numbers */}
              {(() => {
                const pagesToShow: (number | 'ellipsis')[] = [];

                if (totalPages <= 7) {
                  // Show all pages if 7 or fewer
                  for (let i = 1; i <= totalPages; i++) {
                    pagesToShow.push(i);
                  }
                } else {
                  // Show first page
                  pagesToShow.push(1);

                  if (currentPage <= 4) {
                    // Show pages 2-7
                    for (let i = 2; i <= 7; i++) {
                      pagesToShow.push(i);
                    }
                    pagesToShow.push('ellipsis');
                    pagesToShow.push(totalPages);
                  } else if (currentPage >= totalPages - 3) {
                    // Show last 7 pages
                    pagesToShow.push('ellipsis');
                    for (let i = totalPages - 6; i <= totalPages; i++) {
                      pagesToShow.push(i);
                    }
                  } else {
                    // Show pages around current page
                    pagesToShow.push('ellipsis');
                    for (let i = currentPage - 2; i <= currentPage + 2; i++) {
                      pagesToShow.push(i);
                    }
                    pagesToShow.push('ellipsis');
                    pagesToShow.push(totalPages);
                  }
                }

                return pagesToShow.map((item, idx) => {
                  if (item === 'ellipsis') {
                    return (
                      <PaginationItem key={`ellipsis-${idx}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  return (
                    <PaginationItem key={item}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(item);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        isActive={currentPage === item}
                        className="cursor-pointer"
                      >
                        {item}
                      </PaginationLink>
                    </PaginationItem>
                  );
                });
              })()}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) {
                      setCurrentPage(currentPage + 1);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Build count info */}
      {!maxBuilds && totalBuilds > 0 && (
        <div className="mt-4 text-center text-sm text-gray-400">
          Showing {((currentPage - 1) * 11) + 1} - {Math.min(currentPage * 11, totalBuilds)} of {totalBuilds} builds
        </div>
      )}

      {!loading && builds.length === 0 && (
        <motion.div
          className="flex justify-start"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={scaleIn}
        >
          <Link href="/builds/create">
            <Card className="text-card-foreground shadow-sm bg-black/80 backdrop-blur-sm rounded-lg border-2 border-dashed border-white/30 hover:border-white/60 transition-all duration-300 overflow-hidden group cursor-pointer h-full relative flex items-center justify-center min-h-[400px] w-96">
              {/* Glow effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/10" />
              </div>

              <div className="flex flex-col items-center justify-center gap-4 p-8 relative z-10">
                {/* Plus icon in circle */}
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/40 flex items-center justify-center group-hover:border-white/60 transition-colors duration-300">
                  <Plus className="w-8 h-8 text-white/60 group-hover:text-white group-hover:rotate-90 transition-all duration-300" />
                </div>

                {/* Text */}
                <span className="text-white/60 group-hover:text-white font-bold text-lg tracking-wide transition-colors duration-300 uppercase">
                  CREATE A NEW BUILD
                </span>
              </div>
            </Card>
          </Link>
        </motion.div>
      )}
    </div>
  );
}
