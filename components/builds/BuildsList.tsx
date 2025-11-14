"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Plus, Lock, Globe2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Link from "next/link";
import { convertStringToBuild } from "../machines/converter";
import bloodData from "@/data/vbuilds/bloodtypes.json";
import { Button } from "@/components/ui/button";
import { ArenaCodeOutsideBuilder } from "../vbuilds/components/ArenaCode";
import epicWeaponData from "@/data/vbuilds/epic-weapons.json";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import React from "react";
import "@/components/vbuilds/styles.css";
import { useAuth } from "@/hooks/use-auth";

type Build = {
  id?: string;
  name: string;
  code: string;
  isPublic?: boolean;
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

export const BuildContent = ({
  code,
  name,
  handleDeleteBuild,
  isPublic,
  onTogglePublic,
  showPublicToggle = true,
}: {
  code: string;
  name: string;
  handleDeleteBuild?: (event: React.MouseEvent) => void;
  isPublic?: boolean;
  onTogglePublic?: (checked: boolean) => void;
  showPublicToggle?: boolean;
}) => {
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

  return (
    <Card
      className={`bg-black/80 backdrop-blur-sm rounded-lg border-2
                         transition-all duration-300 overflow-hidden group cursor-pointer h-full relative build-spellSchool build-spellSchool-${school || "empty"
        }`}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div
          className={`absolute inset-0 bg-gradient-to-r ${fromVariants[school || "empty"]
            } to-transparent`}
        />
        <div
          className={`absolute inset-0 bg-gradient-to-b ${fromVariants[school || "empty"]
            } via-transparent ${toVariants[school || "empty"]}`}
        />
      </div>

      <div
        className="absolute top-4 right-4 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {showPublicToggle && onTogglePublic !== undefined && (
          <button
            type="button"
            className="w-8 h-8 rounded-full border border-white/30 bg-black/80 flex items-center justify-center hover:border-white/60 hover:bg-black transition-colors"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onTogglePublic(!isPublic);
            }}
            aria-label={isPublic ? "Make build private" : "Make build public"}
          >
            {isPublic ? (
              <Globe2 className="w-4 h-4 text-green-400" />
            ) : (
              <Lock className="w-4 h-4 text-zinc-300" />
            )}
          </button>
        )}
        {handleDeleteBuild && (
          <button
            type="button"
            className="bg-red-600/80 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200 backdrop-blur-sm border border-red-500/50"
            onClick={handleDeleteBuild}
            aria-label="Delete build"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <CardHeader className="relative">
        <CardTitle className="text-xl font-bold transition-colors">
          {name || "Unnamed Build"}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="space-y-6">
          {/* Top Row - Armor, Buffs, Blood */}
          <div className="grid grid-cols-3 gap-4">
            {/* Armor Section */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-red-400 uppercase tracking-wider">
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
              <div className="text-xs font-bold text-red-400 uppercase tracking-wider">
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
              <div className="text-xs font-bold text-red-400 uppercase tracking-wider">
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
              <div className="text-xs font-bold text-red-400 uppercase tracking-wider">
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
              <div className="text-xs font-bold text-red-400 uppercase tracking-wider">
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
            <div className="text-xs font-bold text-red-400 uppercase tracking-wider">
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
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    const fetchBuilds = async () => {
      if (authLoading) return;

      if (!isAuthenticated) {
        setBuilds([]);
        setLoading(false);
        onBuildsLoaded?.(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch("/api/builds");

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
        const buildsArray = Array.isArray(data) ? data.map((build: any) => ({
          id: build.id,
          name: build.name,
          code: build.code,
          isPublic: build.isPublic || false,
        })) : [];

        console.log("Builds loaded:", buildsArray.length, buildsArray);
        setBuilds(buildsArray);
        onBuildsLoaded?.(buildsArray.length > 0);
      } catch (error) {
        console.error("Failed to load builds:", error);
        setBuilds([]);
        onBuildsLoaded?.(false);
      } finally {
        setLoading(false);
      }
    };

    fetchBuilds();
  }, [isAuthenticated, authLoading, onBuildsLoaded]);

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

    try {
      const response = await fetch(`/api/builds/${buildId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete build");
      }

      const updatedBuilds = builds.filter((_, i) => i !== index);
      setBuilds(updatedBuilds);
      onBuildsLoaded?.(updatedBuilds.length > 0);
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

  const handleTogglePublic = async (
    buildId: string,
    currentIsPublic: boolean
  ) => {
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
        throw new Error("Failed to update build visibility");
      }

      // Update local state
      setBuilds((prevBuilds) =>
        prevBuilds.map((build) =>
          build.id === buildId
            ? { ...build, isPublic: !currentIsPublic }
            : build
        )
      );

      toast.success(
        `Build ${!currentIsPublic ? "made public" : "made private"}`
      );
    } catch (error) {
      console.error("Failed to toggle build visibility:", error);
      toast.error("Failed to update build visibility");
    }
  };

  // // Get the builds to display (limited by maxBuilds if specified)
  const buildsToShow = maxBuilds ? builds.slice(0, maxBuilds) : builds;

  // Debug: Log builds to show
  console.log("buildsToShow:", buildsToShow.length, buildsToShow);

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
        const response = await fetch("/api/builds");
        if (response.ok) {
          const data = await response.json();
          const buildsArray = Array.isArray(data) ? data.map((build: any) => ({
            id: build.id,
            name: build.name,
            code: build.code,
          })) : [];
          setBuilds(buildsArray);
          onBuildsLoaded?.(buildsArray.length > 0);
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
    <TooltipProvider>
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

        {/* User's Personal Builds Section */}
        {builds.length > 0 && (
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-gradient-to-b from-red-400 to-red-600 rounded-full" />
            <h3 className="text-xl font-bold text-grey-100 tracking-wide">
              MAKE YOUR OWN
            </h3>
            <div className="flex-1 h-px bg-gradient-to-r from-grey-600 to-transparent" />
          </div>
        )}

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
                  handleDeleteBuild={(event: React.MouseEvent) =>
                    handleDelete(event, build.id || "", index)
                  }
                  isPublic={build.isPublic}
                  onTogglePublic={(checked) => {
                    if (build.id) {
                      handleTogglePublic(build.id, build.isPublic || false);
                    }
                  }}
                  showPublicToggle={true}
                />
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {!loading && builds.length === 0 && (
          <motion.div
            className="flex justify-center gap-4 mb-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div>
              {isAuthenticated ? (
                <Link
                  href="/builds/create"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-red-900/50 border border-red-900/50 text-white font-medium rounded-lg hover:bg-red-900/70 hover:border-red-500 transition-all duration-200 group"
                >
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                  CREATE YOUR FIRST BUILD
                </Link>
              ) : (
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-red-900/50 border border-red-900/50 text-white font-medium rounded-lg hover:bg-red-900/70 hover:border-red-500 transition-all duration-200 group"
                >
                  SIGN IN TO VIEW YOUR BUILDS
                </Link>
              )}
            </motion.div>
          </motion.div>
        )}
      </div>
    </TooltipProvider>
  );
}
