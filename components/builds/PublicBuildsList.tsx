"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { convertStringToBuild } from "../machines/converter";
import { BuildContent } from "./BuildsList";
import { armourOptions } from "../vbuilds/ArmourPicker";
import bloodData from "@/data/vbuilds/bloodtypes.json";
import spellsData from "@/data/vbuilds/spells.json";
import {
  DropdownSelect,
  DropdownSelectPlaceholder,
} from "../vbuilds/components/DropdownSelect";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Shield, Sparkles, Droplet, User, ChevronDown, ArrowUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import "@/components/vbuilds/styles.css";
import { VoteButtons } from "./VoteButtons";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { AuthorBadge } from "@/components/AuthorBadge";
import { useUserBadges } from "@/hooks/use-author-badges";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type Build = {
  id?: string;
  name: string;
  code: string;
  author?: string;
  userId?: string | null;
  isPublic?: boolean;
  upvotes?: number;
  downvotes?: number;
  userVote?: "upvote" | "downvote" | null;
};

type DecodedBuild = Build & {
  decoded?: ReturnType<typeof convertStringToBuild>;
};

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
    <div className="grid grid-cols-3 gap-2 p-2 bg-black/80 backdrop-blur-sm">
      {spellSchools.map((school) => (
        <DropdownMenuItem
          key={school}
          onSelect={(e) => handleSchoolClick(e, school)}
          className="h-20 flex items-center justify-center cursor-pointer hover:bg-purple-900/30 focus:bg-purple-900/30 p-0 overflow-hidden relative"
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
              className={`h-20 flex items-center justify-center cursor-pointer hover:bg-purple-900/30 focus:bg-purple-900/30 p-0 overflow-hidden relative ${selectedSpellId === spell.id ? "bg-purple-900/20" : ""
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
  placeholder: string;
  slotNumber: number;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);

  const selectedSpell = value ? (spellsData as any)[value] : null;

  // Reset selectedSchool when dropdown closes
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
            className={`w-full h-20 justify-between bg-black/50 border-white/10 text-white hover:border-purple-900/50 ${value ? "border-purple-900/50 bg-purple-900/10" : ""
              }`}
          >
            {selectedSpell ? (
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <img
                  src={selectedSpell.img}
                  alt={selectedSpell.name}
                  className="w-10 h-10 rounded flex-shrink-0"
                />
                <span className="text-sm truncate">{selectedSpell.name}</span>
              </div>
            ) : (
              <span className="text-gray-400">{placeholder}</span>
            )}
            {!value && <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />}
          </Button>
        </DropdownMenuTrigger>
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-purple-900/30 z-20"
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

// Author Suggestions Dropdown Component with Badges
const AuthorSuggestionsDropdown = ({
  suggestions,
  authorToUserIdMap,
  onSelect,
}: {
  suggestions: string[];
  authorToUserIdMap: Map<string, string | null>;
  onSelect: (author: string) => void;
}) => {
  // Get all userIds from the suggestions
  const userIds = suggestions
    .map((author) => authorToUserIdMap.get(author))
    .filter((id): id is string => id !== null && id !== undefined);

  // Fetch badges for all users
  const { badges } = useUserBadges(userIds);

  return (
    <div className="absolute z-10 w-full top-full mt-1 bg-black/95 border border-red-900/30 rounded-md shadow-lg max-h-48 overflow-y-auto">
      {suggestions.map((author) => {
        const userId = authorToUserIdMap.get(author);
        const badge = userId ? badges[userId] : null;

        return (
          <button
            key={author}
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(author);
            }}
            className="w-full px-4 py-2 text-left text-white hover:bg-red-900/50 flex items-center gap-2 transition-colors"
          >
            <User className="w-3 h-3 text-gray-400 flex-shrink-0" />
            <span className="flex items-center gap-1.5 flex-1 min-w-0">
              <span className="truncate">{author}</span>
              {badge && (
                <AuthorBadge
                  badgeType={badge.badgeType}
                  description={badge.description}
                />
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default function PublicBuildsList() {
  const [builds, setBuilds] = useState<DecodedBuild[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"popular" | "newest" | "oldest">("popular");
  const fetchingRef = useRef(false);
  const { isAdmin } = useAuth();

  // Filter states
  const [armourFilter, setArmourFilter] = useState<string | null>(null);
  const [spellSlot1School, setSpellSlot1School] = useState<string | null>(null);
  const [spellSlot1Spell, setSpellSlot1Spell] = useState<string | null>(null);
  const [spellSlot2School, setSpellSlot2School] = useState<string | null>(null);
  const [spellSlot2Spell, setSpellSlot2Spell] = useState<string | null>(null);
  const [primaryBloodFilter, setPrimaryBloodFilter] = useState<string | null>(null);
  const [secondaryBloodFilter, setSecondaryBloodFilter] = useState<string | null>(null);
  const [authorFilter, setAuthorFilter] = useState<string>("");
  const [authorSuggestions, setAuthorSuggestions] = useState<string[]>([]);
  const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);
  const [authorToUserIdMap, setAuthorToUserIdMap] = useState<Map<string, string | null>>(new Map());

  const fetchBuilds = async () => {
    // Prevent duplicate fetches
    if (fetchingRef.current) return;

    fetchingRef.current = true;
    setLoading(true);
    try {
      const response = await fetch(`/api/public-builds?sort=${sortBy}&limit=50`);
      if (!response.ok) {
        throw new Error("Failed to fetch public builds");
      }

      const data = await response.json();
      // Handle both old format (array) and new format (object with builds array)
      const buildsData = Array.isArray(data) ? data : (data.builds || []);

      // Don't decode builds immediately - decode lazily when needed for filtering
      const buildsArray: DecodedBuild[] = buildsData.map((build: any) => ({
        id: build.id,
        name: build.name,
        code: build.code,
        author: build.author,
        userId: build.userId || null,
        isPublic: build.isPublic || false,
        upvotes: build.upvotes || 0,
        downvotes: build.downvotes || 0,
        userVote: build.userVote || null,
        decoded: undefined, // Will be decoded lazily when needed
      }));

      setBuilds(buildsArray);

      // Extract unique authors for dropdown and create author -> userId mapping
      const authors = Array.from(
        new Set(buildsArray.map((b) => b.author).filter(Boolean))
      ) as string[];
      setAuthorSuggestions(authors.sort());

      // Create mapping of author name to userId (take first userId found for each author)
      const authorMap = new Map<string, string | null>();
      buildsArray.forEach((build) => {
        if (build.author && !authorMap.has(build.author)) {
          authorMap.set(build.author, build.userId || null);
        }
      });
      setAuthorToUserIdMap(authorMap);
    } catch (error) {
      console.error("Failed to load public builds:", error);
      setBuilds([]);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    fetchBuilds();
  }, [sortBy]);

  // Refetch when page becomes visible (user switches back to tab/window)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Reset fetching ref to allow refetch
        fetchingRef.current = false;
        fetchBuilds();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [sortBy]);

  // Check if we need to decode builds for filtering
  const needsDecoding = armourFilter || spellSlot1Spell || spellSlot2Spell || primaryBloodFilter || secondaryBloodFilter;

  // Filter logic with lazy decoding
  const filteredBuilds = useMemo(() => {
    return builds.map((build) => {
      // Only decode if needed for filtering and not already decoded
      if (needsDecoding && !build.decoded) {
        try {
          return {
            ...build,
            decoded: convertStringToBuild(build.code),
          };
        } catch (error) {
          console.error("Failed to decode build:", build.id, error);
          return { ...build, decoded: null };
        }
      }
      return build;
    }).filter((build) => {
      // If no filters need decoding, just check author filter
      if (!needsDecoding) {
        if (authorFilter && !build.author?.toLowerCase().includes(authorFilter.toLowerCase())) {
          return false;
        }
        return true;
      }

      // For filters that need decoding
      if (!build.decoded) return false;

      const decoded = build.decoded;

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
        // Can't be the same spell as slot 1
        if (spellSlot2Spell === spellSlot1Spell) {
          return false;
        }
        // Must have the spell in either slot
        if (spell1Id !== spellSlot2Spell && spell2Id !== spellSlot2Spell) {
          return false;
        }
      }

      // Blood filters
      if (primaryBloodFilter && decoded.blood?.primary !== primaryBloodFilter) {
        return false;
      }

      if (
        secondaryBloodFilter &&
        decoded.blood?.secondary !== secondaryBloodFilter
      ) {
        return false;
      }

      // Author filter
      if (
        authorFilter &&
        !build.author?.toLowerCase().includes(authorFilter.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [
    builds,
    armourFilter,
    spellSlot1Spell,
    spellSlot2Spell,
    primaryBloodFilter,
    secondaryBloodFilter,
    authorFilter,
  ]);

  // Clear all filters
  const clearAllFilters = () => {
    setArmourFilter(null);
    setSpellSlot1School(null);
    setSpellSlot1Spell(null);
    setSpellSlot2School(null);
    setSpellSlot2Spell(null);
    setPrimaryBloodFilter(null);
    setSecondaryBloodFilter(null);
    setAuthorFilter("");
  };

  // Admin delete handler
  const handleAdminDelete = async (event: React.MouseEvent, buildId: string) => {
    event.preventDefault();
    event.stopPropagation();

    if (!buildId) {
      toast.error("Build ID not found");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this build? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/builds/${buildId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete build");
      }

      // Remove build from state
      setBuilds((prev) => prev.filter((b) => b.id !== buildId));
      toast.success("Build deleted successfully");
    } catch (error) {
      console.error("Failed to delete build:", error);
      toast.error("Failed to delete build");
    }
  };

  // Check if any filters are active
  const hasActiveFilters =
    armourFilter ||
    spellSlot1Spell ||
    spellSlot2Spell ||
    primaryBloodFilter ||
    secondaryBloodFilter ||
    authorFilter;

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
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="pb-16">

      {/* All Filters in One Row */}
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
        <div className="flex-1 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <label className="text-xs font-semibold text-purple-400">Spell 1</label>
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
            placeholder="Select Spell 1"
            slotNumber={1}
          />
        </div>

        {/* Spell Slot 2 Filter */}
        <div className="flex-1 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <label className="text-xs font-semibold text-purple-400">Spell 2</label>
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
            placeholder="Select Spell 2"
            slotNumber={2}
          />
        </div>

        {/* Author Filter */}
        <div className="flex-1 min-w-[180px] p-3">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-3 h-3 text-red-400" />
            <label className="text-xs font-semibold text-red-400">Author</label>
          </div>
          <div className="relative flex items-center">
            <Input
              type="text"
              placeholder="Search author..."
              value={authorFilter}
              onChange={(e) => {
                setAuthorFilter(e.target.value);
                setShowAuthorDropdown(e.target.value.length > 0);
              }}
              onFocus={() => {
                if (authorFilter.length > 0) {
                  setShowAuthorDropdown(true);
                }
              }}
              onBlur={() => {
                setTimeout(() => setShowAuthorDropdown(false), 200);
              }}
              className={`bg-black/50 h-20 border-white/10 text-white placeholder:text-gray-500 hover:border-red-900/50 focus:border-red-900/50 ${authorFilter ? "border-red-900/50 bg-red-900/10" : ""
                }`}
            />
            {authorFilter && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-red-900/20"
                onClick={() => setAuthorFilter("")}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
            {showAuthorDropdown && authorSuggestions.length > 0 && (
              <AuthorSuggestionsDropdown
                suggestions={authorSuggestions.filter((author) =>
                  author.toLowerCase().includes(authorFilter.toLowerCase())
                )}
                authorToUserIdMap={authorToUserIdMap}
                onSelect={(author) => {
                  setAuthorFilter(author);
                  setShowAuthorDropdown(false);
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Build Count and Sort */}
      <div className="mb-6 flex items-center justify-between" >
        <div className="text-sm text-gray-300">
          <span className="font-semibold text-white">{filteredBuilds.length}</span> of{" "}
          <span className="font-semibold text-white">{builds.length}</span> public builds
          {hasActiveFilters && (
            <span className="ml-2 text-xs text-red-400 bg-red-900/20 px-2 py-1 rounded-full">
              Filtered
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-black/50 border-white/10 text-white hover:border-red-900/50"
              >
                <ArrowUpDown className="w-4 h-4 mr-2" />
                {sortBy === "popular"
                  ? "Most Popular"
                  : sortBy === "newest"
                    ? "Newest"
                    : "Oldest"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-black/95 border-white/10">
              <DropdownMenuItem
                onClick={() => setSortBy("popular")}
                className={`cursor-pointer ${sortBy === "popular" ? "bg-red-900/30" : ""
                  }`}
              >
                Most Popular
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortBy("newest")}
                className={`cursor-pointer ${sortBy === "newest" ? "bg-red-900/30" : ""
                  }`}
              >
                Newest
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortBy("oldest")}
                className={`cursor-pointer ${sortBy === "oldest" ? "bg-red-900/30" : ""
                  }`}
              >
                Oldest
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {filtersOpen && !hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFiltersOpen(false)}
              className="text-gray-400 hover:text-white text-xs"
            >
              Hide Filters
            </Button>
          )}
        </div>
      </div>

      {/* Builds Grid */}
      {
        loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 11 }).map((_, index) => (
              <Card key={index} className="bg-black/80 backdrop-blur-sm rounded-lg border-2 border-zinc-800/50 h-full flex flex-col">
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
            ))}
          </div>
        ) : filteredBuilds.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="text-gray-400 mb-4">
              {hasActiveFilters
                ? "No builds match your filters"
                : "No public builds available"}
            </div>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="border-red-900/50 text-red-400 hover:bg-red-900/20"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            viewport={{ once: true }}
          >
            {filteredBuilds.map((build, index) => (
              <motion.div key={build.id || index} variants={scaleIn} className="relative">
                <Link href={`/builds/create?build=${encodeURIComponent(build.code)}`}>
                  <BuildContent
                    code={build.code}
                    name={build.name}
                    author={build.author}
                    userId={build.userId}
                    isPublic={build.isPublic}
                    showPublicToggle={false}
                    upvotes={build.upvotes}
                    downvotes={build.downvotes}
                    userVote={build.userVote}
                    buildId={build.id}
                    onVoteChange={(upvotes, downvotes, userVote) => {
                      setBuilds((prev) =>
                        prev.map((b) =>
                          b.id === build.id
                            ? { ...b, upvotes, downvotes, userVote }
                            : b
                        )
                      );
                    }}
                    isAdmin={isAdmin}
                    onAdminDelete={
                      isAdmin && build.id
                        ? (event: React.MouseEvent) => handleAdminDelete(event, build.id!)
                        : undefined
                    }
                    buildLink={`/builds/create?build=${encodeURIComponent(build.code)}`}
                  />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )
      }
    </div >
  );
}

