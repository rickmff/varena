"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { convertStringToBuild } from "../machines/converter";
import { BuildContent } from "./BuildsList";
import { armourOptions } from "../vbuilds/ArmourPicker";
import bloodData from "@/data/vbuilds/bloodtypes.json";
import spellsData from "@/data/vbuilds/spells.json";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Filter, ChevronDown, ChevronUp, Shield, Sparkles, Droplet, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import "@/components/vbuilds/styles.css";

type Build = {
  id?: string;
  name: string;
  code: string;
  author?: string;
  isPublic?: boolean;
};

type DecodedBuild = Build & {
  decoded?: ReturnType<typeof convertStringToBuild>;
};

const spellSchools = Array.from(
  new Set(Object.values(spellsData).map((spell) => spell.spellSchool))
);

const bloodList = Object.values(bloodData);

export default function PublicBuildsList() {
  const [builds, setBuilds] = useState<DecodedBuild[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

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

  useEffect(() => {
    const fetchBuilds = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/public-builds");
        if (!response.ok) {
          throw new Error("Failed to fetch public builds");
        }

        const data = await response.json();
        const buildsArray: DecodedBuild[] = Array.isArray(data)
          ? data.map((build: any) => {
            let decoded: ReturnType<typeof convertStringToBuild> | undefined = undefined;
            try {
              decoded = convertStringToBuild(build.code);
            } catch (error) {
              console.error("Failed to decode build:", build.id, error);
            }
            return {
              id: build.id,
              name: build.name,
              code: build.code,
              author: build.author,
              isPublic: build.isPublic || false,
              decoded,
            };
          })
          : [];

        setBuilds(buildsArray);

        // Extract unique authors for dropdown
        const authors = Array.from(
          new Set(buildsArray.map((b) => b.author).filter(Boolean))
        ) as string[];
        setAuthorSuggestions(authors.sort());
      } catch (error) {
        console.error("Failed to load public builds:", error);
        setBuilds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBuilds();
  }, []);

  // Filter logic
  const filteredBuilds = useMemo(() => {
    return builds.filter((build) => {
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

  // Get spells for a specific school
  const getSpellsForSchool = (school: string) => {
    return Object.values(spellsData).filter(
      (spell) =>
        spell.spellSchool === school && spell.category === "spell"
    );
  };

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
      {/* Filters Section */}
      <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
        <div className="mb-6">
          <CollapsibleTrigger className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-red-900/20 to-transparent border border-red-900/30 rounded-lg hover:border-red-500/50 transition-all group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-900/30 rounded-lg group-hover:bg-red-900/50 transition-colors">
                <Filter className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-bold text-white text-lg">Filter Builds</span>
                <span className="text-xs text-gray-400">
                  {hasActiveFilters
                    ? `${[armourFilter, spellSlot1Spell, spellSlot2Spell, primaryBloodFilter, secondaryBloodFilter, authorFilter].filter(Boolean).length} active filters`
                    : "No filters applied"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <span className="px-3 py-1 bg-red-900/50 text-red-300 text-sm rounded-full font-medium border border-red-500/30">
                  Active
                </span>
              )}
              {filtersOpen ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-red-900/10 border border-red-900/30 rounded-lg"
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-red-400">Active Filters:</span>
                {armourFilter && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-black/50 border border-red-900/50 rounded text-xs text-white">
                    <Shield className="w-3 h-3" />
                    {armourOptions.find((a) => a.id === armourFilter)?.name}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-red-400"
                      onClick={() => setArmourFilter(null)}
                    />
                  </span>
                )}
                {spellSlot1Spell && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-black/50 border border-purple-900/50 rounded text-xs text-white">
                    <Sparkles className="w-3 h-3" />
                    Slot 1: {(spellsData as any)[spellSlot1Spell]?.name}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-red-400"
                      onClick={() => {
                        setSpellSlot1Spell(null);
                        setSpellSlot1School(null);
                      }}
                    />
                  </span>
                )}
                {spellSlot2Spell && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-black/50 border border-purple-900/50 rounded text-xs text-white">
                    <Sparkles className="w-3 h-3" />
                    Slot 2: {(spellsData as any)[spellSlot2Spell]?.name}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-red-400"
                      onClick={() => {
                        setSpellSlot2Spell(null);
                        setSpellSlot2School(null);
                      }}
                    />
                  </span>
                )}
                {primaryBloodFilter && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-black/50 border border-red-800/50 rounded text-xs text-white">
                    <Droplet className="w-3 h-3" />
                    Primary: {bloodData[primaryBloodFilter as keyof typeof bloodData]?.name}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-red-400"
                      onClick={() => setPrimaryBloodFilter(null)}
                    />
                  </span>
                )}
                {secondaryBloodFilter && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-black/50 border border-red-800/50 rounded text-xs text-white">
                    <Droplet className="w-3 h-3" />
                    Secondary: {bloodData[secondaryBloodFilter as keyof typeof bloodData]?.name}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-red-400"
                      onClick={() => setSecondaryBloodFilter(null)}
                    />
                  </span>
                )}
                {authorFilter && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-black/50 border border-gray-700/50 rounded text-xs text-white">
                    <User className="w-3 h-3" />
                    Author: {authorFilter}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-red-400"
                      onClick={() => setAuthorFilter("")}
                    />
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20 text-xs h-7"
              >
                Clear All Filters
              </Button>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* Armour Filter */}
            <div className="bg-gradient-to-br from-black/60 to-black/40 border border-white/10 rounded-lg p-4 hover:border-red-900/40 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-red-400" />
                <label className="text-sm font-semibold text-red-400">
                  Armour Set
                </label>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-between bg-black/50 border-white/20 text-white hover:bg-black/70 hover:border-red-900/50 ${armourFilter ? "border-red-900/50 bg-red-900/10" : ""
                      }`}
                  >
                    <span className="truncate">
                      {armourFilter
                        ? armourOptions.find((a) => a.id === armourFilter)?.name
                        : "All Armour Sets"}
                    </span>
                    <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72">
                  <DropdownMenuItem
                    onClick={() => setArmourFilter(null)}
                    className={!armourFilter ? "bg-red-900/30" : ""}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div className="w-8 h-8 flex items-center justify-center">
                        <Filter className="w-4 h-4 text-gray-400" />
                      </div>
                      <span>All Armour Sets</span>
                    </div>
                  </DropdownMenuItem>
                  {armourOptions.map((armour) => (
                    <DropdownMenuItem
                      key={armour.id}
                      onClick={() => setArmourFilter(armour.id)}
                      className={
                        armourFilter === armour.id ? "bg-red-900/30" : ""
                      }
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={armour.image}
                          alt={armour.name}
                          className="w-8 h-8 rounded"
                        />
                        <span className="text-sm">{armour.name}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Author Filter */}
            <div className="bg-gradient-to-br from-black/60 to-black/40 border border-white/10 rounded-lg p-4 hover:border-red-900/40 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-red-400" />
                <label className="text-sm font-semibold text-red-400">
                  Author
                </label>
              </div>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search by author name..."
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
                  className={`bg-black/50 border-white/20 text-white placeholder:text-gray-500 hover:border-red-900/50 focus:border-red-900/50 ${authorFilter ? "border-red-900/50 bg-red-900/10" : ""
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
                  <div className="absolute z-10 w-full mt-1 bg-black/95 border border-red-900/30 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {authorSuggestions
                      .filter((author) =>
                        author
                          .toLowerCase()
                          .includes(authorFilter.toLowerCase())
                      )
                      .map((author) => (
                        <button
                          key={author}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setAuthorFilter(author);
                            setShowAuthorDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-left text-white hover:bg-red-900/50 flex items-center gap-2 transition-colors"
                        >
                          <User className="w-3 h-3 text-gray-400" />
                          {author}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Spell Filters - Full Width */}
          <div className="bg-gradient-to-br from-black/60 to-black/40 border border-white/10 rounded-lg p-4 hover:border-purple-900/40 transition-all mb-4">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <label className="text-sm font-semibold text-purple-400">
                Spell Filters
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


              {/* Spell Slot 1 */}
              <div className="space-y-3 bg-black/30 p-3 rounded-lg border border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-purple-900/30 flex items-center justify-center text-xs text-purple-300 font-bold">1</div>
                  <label className="text-xs text-gray-300 font-medium">Spell Slot 1</label>
                </div>
                <Tabs
                  value={spellSlot1School || ""}
                  onValueChange={(value) => {
                    setSpellSlot1School(value || null);
                    setSpellSlot1Spell(null);
                  }}
                >
                  <TabsList className="grid w-full grid-cols-6 mb-2 bg-black/50">
                    {spellSchools.map((school) => (
                      <TabsTrigger
                        key={school}
                        value={school}
                        className="overflow-hidden p-1 data-[state=active]:bg-purple-900/50"
                      >
                        <img
                          src={`/images/vbuilds/spellschools/${school}.webp`}
                          className={`spellSchool spellSchool-${school} w-6 h-6`}
                          alt={school}
                          title={school.charAt(0).toUpperCase() + school.slice(1)}
                        />
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {spellSlot1School && (
                    <TabsContent value={spellSlot1School} className="mt-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className={`w-full justify-between bg-black/50 border-white/20 text-white hover:bg-black/70 hover:border-purple-900/50 ${spellSlot1Spell ? "border-purple-900/50 bg-purple-900/10" : ""
                              }`}
                          >
                            <span className="truncate">
                              {spellSlot1Spell
                                ? (spellsData as any)[spellSlot1Spell]?.name
                                : "Select Spell"}
                            </span>
                            {spellSlot1Spell ? (
                              <X
                                className="w-4 h-4 ml-2 flex-shrink-0 hover:text-red-400"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSpellSlot1Spell(null);
                                  setSpellSlot1School(null);
                                }}
                              />
                            ) : (
                              <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-64 max-h-96 overflow-y-auto">
                          {getSpellsForSchool(spellSlot1School).map((spell) => (
                            <DropdownMenuItem
                              key={spell.id}
                              onClick={() => {
                                // Prevent selecting same spell as slot 2
                                if (spell.id === spellSlot2Spell) {
                                  return;
                                }
                                setSpellSlot1Spell(spell.id);
                              }}
                              className={
                                spellSlot1Spell === spell.id
                                  ? "bg-red-900/30"
                                  : ""
                              }
                              disabled={spell.id === spellSlot2Spell}
                            >
                              <div className="flex items-center gap-2">
                                <img
                                  src={spell.img}
                                  alt={spell.name}
                                  className="w-8 h-8"
                                />
                                <span>{spell.name}</span>
                              </div>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TabsContent>
                  )}
                </Tabs>
              </div>

              {/* Spell Slot 2 */}
              <div className="space-y-3 bg-black/30 p-3 rounded-lg border border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-purple-900/30 flex items-center justify-center text-xs text-purple-300 font-bold">2</div>
                  <label className="text-xs text-gray-300 font-medium">Spell Slot 2</label>
                </div>
                <Tabs
                  value={spellSlot2School || ""}
                  onValueChange={(value) => {
                    setSpellSlot2School(value || null);
                    setSpellSlot2Spell(null);
                  }}
                >
                  <TabsList className="grid w-full grid-cols-6 mb-2 bg-black/50">
                    {spellSchools.map((school) => (
                      <TabsTrigger
                        key={school}
                        value={school}
                        className="overflow-hidden p-1 data-[state=active]:bg-purple-900/50"
                      >
                        <img
                          src={`/images/vbuilds/spellschools/${school}.webp`}
                          className={`spellSchool spellSchool-${school} w-6 h-6`}
                          alt={school}
                          title={school.charAt(0).toUpperCase() + school.slice(1)}
                        />
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {spellSlot2School && (
                    <TabsContent value={spellSlot2School} className="mt-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className={`w-full justify-between bg-black/50 border-white/20 text-white hover:bg-black/70 hover:border-purple-900/50 ${spellSlot2Spell ? "border-purple-900/50 bg-purple-900/10" : ""
                              }`}
                          >
                            <span className="truncate">
                              {spellSlot2Spell
                                ? (spellsData as any)[spellSlot2Spell]?.name
                                : "Select Spell"}
                            </span>
                            {spellSlot2Spell ? (
                              <X
                                className="w-4 h-4 ml-2 flex-shrink-0 hover:text-red-400"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSpellSlot2Spell(null);
                                  setSpellSlot2School(null);
                                }}
                              />
                            ) : (
                              <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-64 max-h-96 overflow-y-auto">
                          {getSpellsForSchool(spellSlot2School).map((spell) => (
                            <DropdownMenuItem
                              key={spell.id}
                              onClick={() => {
                                // Prevent selecting same spell as slot 1
                                if (spell.id === spellSlot1Spell) {
                                  return;
                                }
                                setSpellSlot2Spell(spell.id);
                              }}
                              className={
                                spellSlot2Spell === spell.id
                                  ? "bg-red-900/30"
                                  : ""
                              }
                              disabled={spell.id === spellSlot1Spell}
                            >
                              <div className="flex items-center gap-2">
                                <img
                                  src={spell.img}
                                  alt={spell.name}
                                  className="w-8 h-8"
                                />
                                <span>{spell.name}</span>
                              </div>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TabsContent>
                  )}
                </Tabs>
              </div>
            </div>
          </div>

          {/* Blood Filters - Full Width */}
          <div className="bg-gradient-to-br from-black/60 to-black/40 border border-white/10 rounded-lg p-4 hover:border-red-900/40 transition-all mb-4">
            <div className="flex items-center gap-2 mb-4">
              <Droplet className="w-4 h-4 text-red-400" />
              <label className="text-sm font-semibold text-red-400">
                Blood Filters
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Primary Blood */}
              <div className="space-y-3 bg-black/30 p-3 rounded-lg border border-white/5">
                <label className="text-xs text-gray-300 font-medium">Primary Blood</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-between bg-black/50 border-white/20 text-white hover:bg-black/70 hover:border-red-900/50 ${primaryBloodFilter ? "border-red-900/50 bg-red-900/10" : ""
                        }`}
                    >
                      <span className="truncate">
                        {primaryBloodFilter
                          ? bloodData[primaryBloodFilter as keyof typeof bloodData]
                            ?.name
                          : "All Primary Blood"}
                      </span>
                      <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-72">
                    <DropdownMenuItem
                      onClick={() => setPrimaryBloodFilter(null)}
                      className={!primaryBloodFilter ? "bg-red-900/30" : ""}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div className="w-8 h-8 flex items-center justify-center">
                          <Filter className="w-4 h-4 text-gray-400" />
                        </div>
                        <span>All Primary Blood</span>
                      </div>
                    </DropdownMenuItem>
                    {bloodList.map((blood) => (
                      <DropdownMenuItem
                        key={blood.id}
                        onClick={() => setPrimaryBloodFilter(blood.id)}
                        className={
                          primaryBloodFilter === blood.id
                            ? "bg-red-900/30"
                            : ""
                        }
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={blood.image}
                            alt={blood.name}
                            className="w-8 h-8 rounded"
                          />
                          <span className="text-sm">{blood.name}</span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Secondary Blood */}
              <div className="space-y-3 bg-black/30 p-3 rounded-lg border border-white/5">
                <label className="text-xs text-gray-300 font-medium">Secondary Blood</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-between bg-black/50 border-white/20 text-white hover:bg-black/70 hover:border-red-900/50 ${secondaryBloodFilter ? "border-red-900/50 bg-red-900/10" : ""
                        }`}
                    >
                      <span className="truncate">
                        {secondaryBloodFilter
                          ? bloodData[
                            secondaryBloodFilter as keyof typeof bloodData
                          ]?.name
                          : "All Secondary Blood"}
                      </span>
                      <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-72">
                    <DropdownMenuItem
                      onClick={() => setSecondaryBloodFilter(null)}
                      className={!secondaryBloodFilter ? "bg-red-900/30" : ""}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div className="w-8 h-8 flex items-center justify-center">
                          <Filter className="w-4 h-4 text-gray-400" />
                        </div>
                        <span>All Secondary Blood</span>
                      </div>
                    </DropdownMenuItem>
                    {bloodList.map((blood) => (
                      <DropdownMenuItem
                        key={blood.id}
                        onClick={() => setSecondaryBloodFilter(blood.id)}
                        className={
                          secondaryBloodFilter === blood.id
                            ? "bg-red-900/30"
                            : ""
                        }
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={blood.image}
                            alt={blood.name}
                            className="w-8 h-8 rounded"
                          />
                          <span className="text-sm">{blood.name}</span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Build Count */}
      <div className="mb-6 flex items-center justify-between">
        <div className="text-sm text-gray-300">
          <span className="font-semibold text-white">{filteredBuilds.length}</span> of{" "}
          <span className="font-semibold text-white">{builds.length}</span> public builds
          {hasActiveFilters && (
            <span className="ml-2 text-xs text-red-400 bg-red-900/20 px-2 py-1 rounded-full">
              Filtered
            </span>
          )}
        </div>
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

      {/* Builds Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="text-gray-400">Loading public builds...</div>
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
            <motion.div key={build.id || index} variants={scaleIn}>
              <Link
                href={`/builds/create?build=${encodeURIComponent(build.code)}`}
              >
                <BuildContent
                  code={build.code}
                  name={build.name}
                  isPublic={build.isPublic}
                  showPublicToggle={false}
                />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

