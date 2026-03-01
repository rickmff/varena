"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Plus, Lock, Globe2, Trash2, User, Copy, Pencil, Loader2, Shield, Sparkles, Droplet, X, ChevronsDown } from "lucide-react";
import { VoteButtons } from "./VoteButtons";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ActionPopup, ActionPopupType, ConfirmPopup } from "./ActionPopup";
import Link from "next/link";
import { convertStringToBuild } from "../machines/converter";
import bloodData from "@/data/vbuilds/bloodtypes.json";
import { Button } from "@/components/ui/button";
import { ArenaCodeOutsideBuilder } from "../vbuilds/components/ArenaCode";
import epicWeaponData from "@/data/vbuilds/epic-weapons.json";
import React from "react";
import "@/components/vbuilds/styles.css";
import { useAuth } from "@/hooks/use-auth";
import { AuthorBadge } from "@/components/AuthorBadge";
import { useUserBadges, UserBadgeType } from "@/hooks/use-author-badges";
import { Input } from "@/components/ui/input";
import { isValidEnglishAlphabet } from "@/lib/utils";
import { armourOptions } from "../vbuilds/ArmourPicker";
import spellsData from "@/data/vbuilds/spells.json";
import {
  DropdownSelect,
  DropdownSelectPlaceholder,
} from "../vbuilds/components/DropdownSelect";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

const spellSchools = Array.from(
  new Set(Object.values(spellsData).map((spell) => spell.spellSchool))
);

const bloodList = Object.values(bloodData);

type BloodType = {
  id: string;
  name: string;
  image: string;
  arenaCode: string;
  effects: {
    [key: string]: {
      description: string;
      modifiers: Array<{
        stat: string;
        value: number;
        unit: string;
        calculate: boolean;
      }>;
    };
  };
};

type SpellOption = {
  id: string;
  name: string;
  img: string;
  spellSchool: string;
  category: string;
};

// Spell Schools Grid Component
const SpellSchoolsGrid = ({
  onSchoolSelect,
}: {
  onSchoolSelect: (school: string) => void;
}) => {
  const handleSchoolClick = (e: Event, school: string) => {
    e.preventDefault();
    onSchoolSelect(school);
  };

  return (
    <div className="grid grid-cols-3 gap-2 p-2">
      {spellSchools.map((school) => (
        <DropdownMenuItem
          key={school}
          onSelect={(e) => handleSchoolClick(e, school)}
          className="h-20 flex items-center justify-center cursor-pointer bg-zinc-900 border-2 border-zinc-700 hover:border-red-500 focus:border-red-500 rounded-md transition-all duration-100 p-0 overflow-hidden relative"
        >
          <img
            src={`/images/vbuilds/spellschools/${school}.webp`}
            className={`spellSchool spellSchool-${school} w-12 h-12 pointer-events-none`}
            alt={school}
          />
        </DropdownMenuItem>
      ))}
    </div>
  );
};

// Spells List Component
const SpellsList = ({
  school,
  selectedSpellId,
  excludeSpellId,
  onSpellSelect,
  onBack,
}: {
  school: string;
  selectedSpellId: string | null;
  excludeSpellId?: string | null;
  onSpellSelect: (spellId: string) => void;
  onBack: () => void;
}) => {
  const getSpellsForSchool = (school: string): SpellOption[] => {
    return Object.values(spellsData)
      .filter((spell: any) => spell.spellSchool === school && spell.category === "spell")
      .filter((spell: any) => spell.id !== excludeSpellId);
  };

  const handleSpellSelect = (e: Event, spellId: string) => {
    e.preventDefault();
    onSpellSelect(spellId);
  };

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onBack();
  };

  const spells = getSpellsForSchool(school);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between p-2 border-b border-white/10">
        <span className="text-sm text-gray-300">Select Spell</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackClick}
          className="h-6 text-xs"
        >
          ← Back
        </Button>
      </div>
      <div className="max-h-72 overflow-y-auto p-2">
        <div className="grid grid-cols-3 gap-2">
          {spells.map((spell) => (
            <DropdownMenuItem
              key={spell.id}
              onSelect={(e) => handleSpellSelect(e, spell.id)}
              className={`h-20 flex items-center justify-center cursor-pointer bg-zinc-900 border-2 hover:border-red-500 focus:border-red-500 rounded-md transition-all duration-100 p-0 overflow-hidden relative ${selectedSpellId === spell.id ? "border-red-500" : "border-zinc-700"
                }`}
            >
              <img
                src={spell.img}
                className="w-12 h-12 rounded pointer-events-none"
                alt={spell.name}
              />
            </DropdownMenuItem>
          ))}
        </div>
      </div>
    </div>
  );
};

// Spell Dropdown Select Component
const SpellDropdownSelect = ({
  value,
  onChange,
  onClear,
  excludeSpellId,
  placeholder,
  slotNumber,
}: {
  value: string | null;
  onChange: (spellId: string) => void;
  onClear: () => void;
  excludeSpellId?: string | null;
  placeholder: React.ReactNode;
  slotNumber: number;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);

  const selectedSpell = value ? (spellsData as any)[value] : null;

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSelectedSchool(null);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClear();
    setSelectedSchool(null);
    setIsOpen(false);
  };

  const handleSchoolSelect = (school: string) => {
    setSelectedSchool(school);
  };

  const handleSpellSelect = (spellId: string) => {
    onChange(spellId);
    setSelectedSchool(null);
    setIsOpen(false);
  };

  const handleBack = () => {
    setSelectedSchool(null);
  };

  return (
    <div className="relative w-full">
      <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={`w-20 h-20 p-0 justify-center bg-zinc-900 border-2 border-zinc-700 text-gray-200 hover:border-red-500 transition-all duration-100 ${value ? "border-red-500" : ""
              }`}
            style={{ backgroundColor: 'rgb(24 24 27)' }}
          >
            {selectedSpell ? (
              <img
                src={selectedSpell.img}
                alt={selectedSpell.name}
                className="w-full h-full object-cover rounded-sm pointer-events-none"
              />
            ) : (
              placeholder
            )}
          </Button>
        </DropdownMenuTrigger>
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-red-900/30 z-20"
            aria-label="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <DropdownMenuContent
          className="w-80 max-h-96 overflow-y-auto"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          {!selectedSchool ? (
            <SpellSchoolsGrid onSchoolSelect={handleSchoolSelect} />
          ) : (
            <SpellsList
              school={selectedSchool}
              selectedSpellId={value}
              excludeSpellId={excludeSpellId}
              onSpellSelect={handleSpellSelect}
              onBack={handleBack}
            />
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

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
    <div className="text-sm text-gray-400 mt-1 flex items-center gap-1.5">
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
    </div>
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
  isCloning,
  onRename,
  currentUserId,
  onNameUpdated,
  isMineTab,
  userBadge,
  onActionPopup,
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
  isCloning?: boolean;
  onRename?: (event: React.MouseEvent, buildId: string, currentName: string) => void;
  currentUserId?: string | null;
  onNameUpdated?: (buildId: string, newName: string) => void;
  isMineTab?: boolean;
  userBadge?: UserBadgeType | null;
  onActionPopup?: (type: ActionPopupType, message: string) => void;
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
            onActionPopup?.("rename", `Build renamed to "${trimmedName}".`);
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
      onClick={isEditingName ? (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); } : undefined}
      onMouseDown={isEditingName ? (e: React.MouseEvent) => { e.stopPropagation(); } : undefined}
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
            disabled={isCloning}
            className="bg-blue-600/80 hover:bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200 backdrop-blur-sm border border-blue-500/50 opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClone(e, buildId || `local-${code}`, code, name);
            }}
            aria-label="Clone build"
          >
            {isCloning ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
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
              onMouseDown={(e) => e.stopPropagation()}
              onDragStart={(e) => e.preventDefault()}
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
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
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
            <ArenaCodeOutsideBuilder
              code={code}
              onCopySuccess={onActionPopup ? () => onActionPopup("copy", "Paste in-game chat to import.") : undefined}
            />
          </div>
        </div>
      </CardContent>
    </Card >
  );
};

const SortableBuildCard = ({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : undefined,
    opacity: isDragging ? 0.5 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
};

const BUILDS_PER_PAGE = 25;

export default function BuildsList({
  maxBuilds,
  onBuildsLoaded,
}: BuildsListProps = {}) {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalBuilds, setTotalBuilds] = useState(0);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const fetchingRef = useRef(false);
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  // Filter states
  const [armourFilter, setArmourFilter] = useState<string | null>(null);
  const [spellSlot1School, setSpellSlot1School] = useState<string | null>(null);
  const [spellSlot1Spell, setSpellSlot1Spell] = useState<string | null>(null);
  const [spellSlot2School, setSpellSlot2School] = useState<string | null>(null);
  const [spellSlot2Spell, setSpellSlot2Spell] = useState<string | null>(null);
  const [primaryBloodFilter, setPrimaryBloodFilter] = useState<string | null>(null);
  const [secondaryBloodFilter, setSecondaryBloodFilter] = useState<string | null>(null);

  // Get the builds to display (limited by maxBuilds if specified)
  const buildsToShow = maxBuilds ? builds.slice(0, maxBuilds) : builds;

  // Check if any filters are active
  const hasActiveFilters = armourFilter || spellSlot1Spell || spellSlot2Spell || primaryBloodFilter || secondaryBloodFilter;

  // Filter logic with lazy decoding
  const filteredBuilds = useMemo(() => {
    if (!hasActiveFilters) return buildsToShow;

    return buildsToShow.filter((build) => {
      let decoded;
      try {
        decoded = convertStringToBuild(build.code);
      } catch (error) {
        console.error("Failed to decode build:", build.id, error);
        return false;
      }

      // Armour filter
      if (armourFilter && decoded.armour?.id !== armourFilter) {
        return false;
      }

      // Spell filters - position independent matching
      if (spellSlot1Spell) {
        const spell1Id = decoded.spells.spell1?.id;
        const spell2Id = decoded.spells.spell2?.id;
        if (spell1Id !== spellSlot1Spell && spell2Id !== spellSlot1Spell) {
          return false;
        }
      }

      if (spellSlot2Spell) {
        const spell1Id = decoded.spells.spell1?.id;
        const spell2Id = decoded.spells.spell2?.id;
        if (spellSlot2Spell === spellSlot1Spell) {
          return false;
        }
        if (spell1Id !== spellSlot2Spell && spell2Id !== spellSlot2Spell) {
          return false;
        }
      }

      // Blood filters
      if (primaryBloodFilter && decoded.blood?.primary !== primaryBloodFilter) {
        return false;
      }

      if (secondaryBloodFilter && decoded.blood?.secondary !== secondaryBloodFilter) {
        return false;
      }

      return true;
    });
  }, [buildsToShow, hasActiveFilters, armourFilter, spellSlot1Spell, spellSlot2Spell, primaryBloodFilter, secondaryBloodFilter]);

  // Clear all filters
  const clearAllFilters = () => {
    setArmourFilter(null);
    setSpellSlot1School(null);
    setSpellSlot1Spell(null);
    setSpellSlot2School(null);
    setSpellSlot2Spell(null);
    setPrimaryBloodFilter(null);
    setSecondaryBloodFilter(null);
  };

  // Use filteredBuilds for display
  const displayBuilds = hasActiveFilters ? filteredBuilds : buildsToShow;

  // Collect user IDs for batch fetching badges
  const userIds = Array.from(new Set(displayBuilds
    .map((build) => build.userId)
    .filter((id): id is string => Boolean(id))));

  const { badges } = useUserBadges(userIds);

  // Drag-and-drop sensors (only for authenticated, non-homepage view)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [actionPopup, setActionPopup] = useState<{ type: ActionPopupType; message: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ buildId: string; index: number } | null>(null);

  const showActionPopup = (type: ActionPopupType, message: string) => {
    setActionPopup({ type, message });
    setTimeout(() => setActionPopup(null), 3000);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = buildsToShow.findIndex((b) => b.id === active.id);
    const newIndex = buildsToShow.findIndex((b) => b.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(buildsToShow, oldIndex, newIndex);

    // Update local state immediately for responsive feel
    if (maxBuilds) {
      // Homepage: only showing a subset
      setBuilds((prev) => {
        const rest = prev.slice(maxBuilds);
        return [...reordered, ...rest];
      });
    } else {
      setBuilds(reordered);
    }

    // Persist to server
    const buildIds = reordered.map((b) => b.id).filter(Boolean) as string[];
    if (buildIds.length > 0 && isAuthenticated) {
      try {
        await fetch("/api/builds/reorder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ buildIds, pageOffset: 0 }),
        });
      } catch (error) {
        console.error("Failed to persist build order:", error);
      }
    }
  };

  const parseBuildData = (data: any) => {
    return Array.isArray(data)
      ? data.map((build: any) => ({
        id: build.id,
        name: build.name,
        code: build.code,
        isPublic: build.isPublic || false,
        author: build.author || "You",
        userId: build.userId || null,
      }))
      : (data.builds || []).map((build: any) => ({
        id: build.id,
        name: build.name,
        code: build.code,
        isPublic: build.isPublic || false,
        author: build.author || "You",
        userId: build.userId || null,
      }));
  };

  const fetchBuilds = useCallback(async (pageNum: number) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const limit = maxBuilds || BUILDS_PER_PAGE;
      const response = await fetch(`/api/builds?page=${pageNum}&limit=${limit}`);

      if (response.status === 401) {
        setBuilds([]);
        setLoading(false);
        setLoadingMore(false);
        onBuildsLoaded?.(false);
        fetchingRef.current = false;
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch builds");
      }

      const data = await response.json();
      const buildsArray = parseBuildData(data);

      if (pageNum === 1) {
        setBuilds(buildsArray);
      } else {
        setBuilds(prev => [...prev, ...buildsArray]);
      }

      if (data.total !== undefined) {
        setTotalBuilds(data.total);
        const totalPages = data.totalPages || 1;
        setHasMore(pageNum < totalPages);
      } else {
        setHasMore(false);
      }

      setPage(pageNum);
      onBuildsLoaded?.(pageNum === 1 ? buildsArray.length > 0 : true);
    } catch (error) {
      console.error("Failed to load builds:", error);
      if (pageNum === 1) {
        setBuilds([]);
        onBuildsLoaded?.(false);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      fetchingRef.current = false;
    }
  }, [maxBuilds, onBuildsLoaded]);

  const resetAndRefetch = useCallback(() => {
    setPage(1);
    setHasMore(true);
    fetchBuilds(1);
  }, [fetchBuilds]);

  useEffect(() => {
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
                const buildsArray = parsed.map((build: any, index: number) => ({
                  id: `local-${index}-${build.name}`,
                  name: build.name || `Build ${index + 1}`,
                  code: build.code || "",
                  isPublic: false,
                  author: "You",
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

    fetchBuilds(1);
  }, [isAuthenticated, authLoading, fetchBuilds]);

  // Infinite scroll observer - only for full builds page (not homepage widget)
  useEffect(() => {
    if (maxBuilds || !isAuthenticated) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          fetchBuilds(page + 1);
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loading, loadingMore, page, maxBuilds, isAuthenticated, fetchBuilds]);

  const handleDelete = (event: React.MouseEvent, buildId: string, index: number) => {
    event.preventDefault();
    event.stopPropagation();

    if (!buildId) {
      toast.error("Build ID not found");
      return;
    }

    setConfirmDelete({ buildId, index });
  };

  const executeDelete = async (buildId: string, index: number) => {
    setConfirmDelete(null);

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
              showActionPopup("delete", "Your build has been removed.");
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

      // Remove from local state
      setBuilds(prev => prev.filter(b => b.id !== buildId));
      setTotalBuilds(prev => prev - 1);
      onBuildsLoaded?.(builds.length > 1);
      showActionPopup("delete", "Your build has been removed.");
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
      showActionPopup("copy", "Paste in-game chat to import.");
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
          const clonedName = `${name} Copy`;
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

          showActionPopup("clone", "Build cloned to local storage.");
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
        const clonedName = `${name} Copy`;
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

        showActionPopup("clone", "Build cloned successfully.");
        resetAndRefetch();
      } catch (error) {
        console.error("Error cloning build:", error);
        toast.error("Failed to clone build");
      }
      return;
    }

    try {
      // Generate a cloned name
      const clonedName = `${name} Copy`;

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

      showActionPopup("clone", "Build cloned successfully.");
      resetAndRefetch();
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

      showActionPopup("rename", "Build renamed successfully.");

      // Update local state
      setBuilds(prev => prev.map(b => b.id === buildId ? { ...b, name: newName.trim() } : b));
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

    // Optimistic update: update state and show popup immediately
    const previousBuilds = [...builds];
    setBuilds(prev => prev.map(b => b.id === buildId ? { ...b, isPublic: !currentIsPublic } : b));

    if (!currentIsPublic) {
      showActionPopup("publish", "Your build is now visible to the community.");
    } else {
      showActionPopup("unpublish", "Your build is now private.");
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
        // Revert optimistic update
        setBuilds(previousBuilds);
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || "Failed to update build visibility";

        if (response.status === 400 && (errorMessage.includes("5 public builds") || errorMessage.includes("empty build") || errorMessage.includes("incomplete build"))) {
          toast.error(errorMessage, {
            duration: 5000,
          });
        } else {
          toast.error(errorMessage);
        }
        return;
      }
    } catch (error) {
      // Revert optimistic update on network error
      setBuilds(previousBuilds);
      console.error("Failed to toggle build visibility:", error);
      toast.error("Failed to update build visibility");
    }
  };


  // // Calculate button span based on grid layout and number of builds
  const getButtonSpanClass = () => {
    const buildCount = displayBuilds.length;

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

        resetAndRefetch();

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

      {/* Filters - only show on full builds page, not homepage widget */}
      {!maxBuilds && (
        <div className="flex flex-wrap gap-3 mb-6 w-full border border-white/10 rounded-lg">
          {/* Armour Filter */}
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-3 h-3 text-red-400" />
              <label className="text-xs font-semibold text-red-400">Armour</label>
            </div>
            <DropdownSelect
              selected={armourFilter || ""}
              clear={() => setArmourFilter(null)}
              onSelect={(id: string) => setArmourFilter(id)}
              options={[...armourOptions]}
              defaultValue={null}
              placeholder={
                <DropdownSelectPlaceholder
                  image="/images/vbuilds/armour/armour-draculas_shadow_chestguard.webp"
                  text="Armour"
                />
              }
            />
          </div>

          {/* Primary Blood Filter */}
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Droplet className="w-3 h-3 text-red-400" />
              <label className="text-xs font-semibold text-red-400">Blood 1</label>
            </div>
            <DropdownSelect
              selected={primaryBloodFilter || ""}
              clear={() => setPrimaryBloodFilter(null)}
              onSelect={(id: string) => setPrimaryBloodFilter(id)}
              options={bloodList as BloodType[]}
              defaultValue={null}
              placeholder={
                <DropdownSelectPlaceholder
                  image="/images/vbuilds/blood/rogue-blood.webp"
                  text="Blood 1"
                />
              }
            />
          </div>

          {/* Secondary Blood Filter */}
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Droplet className="w-3 h-3 text-red-400" />
              <label className="text-xs font-semibold text-red-400">Blood 2</label>
            </div>
            <DropdownSelect
              selected={secondaryBloodFilter || ""}
              clear={() => setSecondaryBloodFilter(null)}
              onSelect={(id: string) => setSecondaryBloodFilter(id)}
              options={bloodList as BloodType[]}
              defaultValue={null}
              placeholder={
                <DropdownSelectPlaceholder
                  image="/images/vbuilds/blood/rogue-blood.webp"
                  text="Blood 2"
                />
              }
            />
          </div>

          {/* Spell Slot 1 Filter */}
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3 h-3 text-red-400" />
              <label className="text-xs font-semibold text-red-400">Spell 1</label>
            </div>
            <SpellDropdownSelect
              value={spellSlot1Spell}
              onChange={(spellId) => {
                setSpellSlot1Spell(spellId);
                const spell = (spellsData as any)[spellId];
                if (spell) {
                  setSpellSlot1School(spell.spellSchool);
                }
              }}
              onClear={() => {
                setSpellSlot1Spell(null);
                setSpellSlot1School(null);
              }}
              excludeSpellId={spellSlot2Spell}
              placeholder={
                <DropdownSelectPlaceholder
                  image="/images/vbuilds/spells/spell-blood-blood_rage.webp"
                  text="Spell 1"
                />
              }
              slotNumber={1}
            />
          </div>

          {/* Spell Slot 2 Filter */}
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3 h-3 text-red-400" />
              <label className="text-xs font-semibold text-red-400">Spell 2</label>
            </div>
            <SpellDropdownSelect
              value={spellSlot2Spell}
              onChange={(spellId) => {
                setSpellSlot2Spell(spellId);
                const spell = (spellsData as any)[spellId];
                if (spell) {
                  setSpellSlot2School(spell.spellSchool);
                }
              }}
              onClear={() => {
                setSpellSlot2Spell(null);
                setSpellSlot2School(null);
              }}
              excludeSpellId={spellSlot1Spell}
              placeholder={
                <DropdownSelectPlaceholder
                  image="/images/vbuilds/spells/spell-blood-blood_rite.webp"
                  text="Spell 2"
                />
              }
              slotNumber={2}
            />
          </div>
        </div>
      )}

      {/* Filter count info */}
      {!maxBuilds && hasActiveFilters && (
        <div className="mb-6 flex items-center justify-between">
          <div className="text-sm text-gray-300">
            <span className="font-semibold text-white">{filteredBuilds.length}</span> of{" "}
            <span className="font-semibold text-white">{buildsToShow.length}</span> builds
            <span className="ml-2 text-xs text-red-400 bg-red-900/20 px-2 py-1 rounded-full">
              Filtered
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
          >
            <X className="w-4 h-4 mr-1" />
            Clear filters
          </Button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <BuildCardSkeleton key={index} />
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={(event) => setActiveDragId(String(event.active.id))}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveDragId(null)}
          id="builds-list-dnd"
        >
          <SortableContext
            items={displayBuilds.map((b) => b.id || "").filter(Boolean)}
            strategy={rectSortingStrategy}
          >
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              viewport={{ once: true }}
            >
              {displayBuilds.length !== 0 && (
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
              {displayBuilds.map((build, index) => (
                <motion.div
                  key={build.id || index}
                  variants={scaleIn}
                >
                  {build.id && !build.id.startsWith("local-") && isAuthenticated && !maxBuilds && !hasActiveFilters ? (
                    <SortableBuildCard id={build.id}>
                      <div
                        onClick={() => router.push(`/builds/create?build=${encodeURIComponent(build.code)}`)}
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
                            setBuilds((prev) =>
                              prev.map((b) =>
                                b.id === buildId ? { ...b, name: newName } : b
                              )
                            );
                          }}
                          isMineTab={true}
                          userBadge={build.userId ? badges[build.userId] : null}
                          onActionPopup={showActionPopup}
                        />
                      </div>
                    </SortableBuildCard>
                  ) : (
                    <div
                      onClick={() => router.push(`/builds/create?build=${encodeURIComponent(build.code)}`)}
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
                          setBuilds((prev) =>
                            prev.map((b) =>
                              b.id === buildId ? { ...b, name: newName } : b
                            )
                          );
                        }}
                        isMineTab={true}
                        userBadge={build.userId ? badges[build.userId] : null}
                        onActionPopup={showActionPopup}
                      />
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </SortableContext>
        </DndContext>
      )}

      {/* Infinite scroll sentinel & loading indicator */}
      {!maxBuilds && isAuthenticated && (
        <>
          <div ref={sentinelRef} className="h-1" />
          {loadingMore && (
            <div className="mt-8 flex justify-center">
              <div className="flex items-center gap-2 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Loading more builds...</span>
              </div>
            </div>
          )}
          {!hasMore && builds.length > 0 && (
            <div className="mt-4 text-center text-sm text-gray-400">
              Showing {builds.length} of {totalBuilds} builds
            </div>
          )}
        </>
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
      {/* Confirm delete popup */}
      <AnimatePresence>
        {confirmDelete && (
          <ConfirmPopup
            title="Delete Build"
            message="Are you sure you want to delete this build? This action cannot be undone."
            confirmLabel="Delete"
            onConfirm={() => executeDelete(confirmDelete.buildId, confirmDelete.index)}
            onCancel={() => setConfirmDelete(null)}
          />
        )}
      </AnimatePresence>
      {/* Action popup */}
      <AnimatePresence>
        {actionPopup && (
          <ActionPopup
            type={actionPopup.type}
            message={actionPopup.message}
            onClose={() => setActionPopup(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
