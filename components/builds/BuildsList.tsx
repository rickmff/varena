"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { ClipboardCopyIcon, Plus, Swords, ChevronRight } from "lucide-react";
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
import React from "react";
import Image from "next/image";
import "@/components/vbuilds/styles.css";

type Build = {
  name: string;
  code: string;
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
  storm: "from-spellSchool-storm/5",
  blood: "from-spellSchool-blood/5",
  chaos: "from-spellSchool-chaos/5",
  arcane: "from-spellSchool-unholy/5",
  frost: "from-spellSchool-frost/5",
  illusion: "from-spellSchool-illusion/5",
};

const toVariants: Record<string, string> = {
  storm: "to-spellSchool-storm/5",
  blood: "to-spellSchool-blood/5",
  chaos: "to-spellSchool-chaos/5",
  arcane: "to-spellSchool-unholy/5",
  frost: "to-spellSchool-frost/5",
  illusion: "to-spellSchool-illusion/5",
};

const borderVariants: Record<string, string> = {
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

const BuildContent = ({
  code,
  name,
  handleDeleteBuild,
}: {
  code: string;
  name: string;
  handleDeleteBuild: (event: React.MouseEvent) => void;
}) => {
  const build = convertStringToBuild(code);

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

  console.log({
    dashSpellSchool,
    spell1SpellSchool,
    spell2SpellSchool,
    ultimateSpellSchool,
    school,
  });

  return (
    <Card
      className={`bg-black/80 backdrop-blur-sm rounded-lg border-2
                         transition-all duration-300 overflow-hidden group cursor-pointer h-full relative build-spellSchool-${school}`}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div
          className={`absolute inset-0 bg-gradient-to-r ${fromVariants[school]} to-transparent`}
        />
        <div
          className={`absolute inset-0 bg-gradient-to-b ${fromVariants[school]} via-transparent ${toVariants[school]}`}
        />
      </div>

      <div className="absolute top-4 right-4 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {/* <motion.button
                    className="bg-blue-600/80 hover:bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200 backdrop-blur-sm border border-blue-500/50"
                    onClick={(e) => handleCopyCommand(e, build.code)}
                    aria-label="Copy build command"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ClipboardCopyIcon size={16} />
                  </motion.button> */}
        <Tooltip delayDuration={0}>
          <TooltipTrigger>
            <div
              role="button"
              className="bg-red-600/80 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200 backdrop-blur-sm border border-red-500/50"
              onClick={handleDeleteBuild}
              aria-label="Delete build"
            >
              ×
            </div>
          </TooltipTrigger>
          <TooltipContent side="left">Delete Build</TooltipContent>
        </Tooltip>
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
                    emptySrc="/images/vbuilds/spells/spell-blood-veil_of_blood.png"
                  />
                </Item>

                <Item school={school}>
                  <Img
                    src={build.spells.spell1?.img}
                    alt="Spell 1"
                    emptySrc="/images/vbuilds/spells/spell-blood-blood_rage.png"
                  />
                </Item>

                <Item school={school}>
                  <Img
                    src={build.spells.spell2?.img}
                    alt="Spell 2"
                    emptySrc="/images/vbuilds/spells/spell-blood-blood_rite.png"
                  />
                </Item>

                <Item school={school}>
                  <Img
                    src={build.spells.ultimate?.img}
                    alt="Ultimate"
                    emptySrc="/images/vbuilds/spells/spell-chaos-merciless_charge.png"
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
    </Card>
  );
};

const premadeBuilds = [
  {
    name: "CASTER",
    background: "/images/templates/caster.png",
    code: "722222222bcg9af3456g2456413656o6479n218700000000000000000000000000000033333961",
    hoverBorder: "hover:border-purple-500",
    hoverGlow: "from-purple-900/20",
  },
  {
    name: "ASSASSIN",
    background: "/images/templates/assassin.png",
    code: "622222222bc4n12136734563223565103E8n218700000000000000000000000000000054444751",
    hoverBorder: "hover:border-orange-500",
    hoverGlow: "from-orange-900/20",
  },
  {
    name: "BRAWLER",
    background: "/images/templates/brawler.png",
    code: "822222222bc1k42136734563223565103E8n218700000000000000000000000000000052222751",
    hoverBorder: "hover:border-red-500",
    hoverGlow: "from-red-900/20",
  },
  {
    name: "HYBRID",
    background: "/images/templates/hybrid.png",
    code: "600000000kcb4na1258345636234551038En217800000000000000000000000000000052222251",
    hoverBorder: "hover:border-green-500",
    hoverGlow: "from-green-900/20",
  },
];

export default function BuildsList({
  maxBuilds,
  showViewAllButton = false,
  onBuildsLoaded,
}: BuildsListProps = {}) {
  const [builds, setBuilds] = useState<Build[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Fetch builds from localStorage
    const fetchBuilds = () => {
      try {
        const storedBuilds = localStorage.getItem("vbuilds");
        if (storedBuilds) {
          const parsedBuilds = JSON.parse(storedBuilds);
          const buildsArray = Array.isArray(parsedBuilds) ? parsedBuilds : [];
          setBuilds(buildsArray);
          onBuildsLoaded?.(buildsArray.length > 0);
        } else {
          onBuildsLoaded?.(false);
        }
      } catch (error) {
        console.error("Failed to load builds from localStorage:", error);
        setBuilds([]);
        onBuildsLoaded?.(false);
      }
    };

    fetchBuilds();
  }, [onBuildsLoaded]);

  const handleBuildClick = (code: string) => {
    router.push(`/builds/create?build=${encodeURIComponent(code)}`);
  };

  const handleDelete = (event: React.MouseEvent, index: number) => {
    // Prevent the card click event from triggering
    event.preventDefault();
    event.stopPropagation();

    toast("Are you sure you want to delete this build?", {
      closeButton: true,
      actionButtonStyle: { backgroundColor: "#f87171" },
      action: {
        label: "Delete",
        onClick: () => {
          const updatedBuilds = [...builds];
          updatedBuilds.splice(index, 1);
          // Update state and localStorage
          setBuilds(updatedBuilds);
          try {
            localStorage.setItem("vbuilds", JSON.stringify(updatedBuilds));
          } catch (error) {
            console.error("Failed to update localStorage:", error);
          }
        },
      },
    });
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

  // Get the builds to display (limited by maxBuilds if specified)
  const buildsToShow = maxBuilds ? builds.slice(0, maxBuilds) : builds;

  // Calculate button span based on grid layout and number of builds
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

  // Custom animation variants for premade builds
  const slideInFromLeft = {
    hidden: { opacity: 0, x: -400, scale: 0.9 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94], // Custom ease with deceleration
      },
    },
  };

  const slideInFromRight = {
    hidden: { opacity: 0, x: 400, scale: 0.9 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94], // Custom ease with deceleration
      },
    },
  };

  const slideInFromLeftDelayed = {
    hidden: { opacity: 0, x: -500, scale: 0.9 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        delay: 0.2, // Edge delay for closing in effect
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const slideInFromRightDelayed = {
    hidden: { opacity: 0, x: 500, scale: 0.9 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        delay: 0.2, // Edge delay for closing in effect
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  // Function to get the appropriate animation variant for each premade build
  const getPremadeBuildVariant = (index: number) => {
    switch (index) {
      case 0:
        return slideInFromLeftDelayed; // CASTER - leftmost edge, delayed
      case 1:
        return slideInFromLeft; // ASSASSIN - from left
      case 2:
        return slideInFromRight; // BRAWLER - from right
      case 3:
        return slideInFromRightDelayed; // HYBRID - rightmost edge, delayed
      default:
        return scaleIn;
    }
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
  const premadeBuildsContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0, // No stagger, let individual animations handle timing
      },
    },
  };

  return (
    <TooltipProvider>
      <div className="pb-16">
        {/* Premade Starter Builds Section */}
        <motion.div
          className="mb-12"
          variants={premadeBuildsContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-gradient-to-b from-red-400 to-red-600 rounded-full" />
            <h3 className="text-xl font-bold text-grey-100 tracking-wide">
              Premade Starter Builds
            </h3>
            <div className="flex-1 h-px bg-gradient-to-r from-grey-600 to-transparent" />
          </div>

          <div className="grid grid-cols-4 gap-4">
            {premadeBuilds.map((build, index) => (
              <motion.div
                key={build.name}
                variants={getPremadeBuildVariant(index)}
                className="relative group cursor-pointer"
              >
                <Link
                  href={`/builds/create?build=${encodeURIComponent(
                    build.code
                  )}`}
                >
                  <div
                    className={`relative aspect-video rounded-lg overflow-hidden border-2 border-red-900/30 ${build.hoverBorder} transition-all duration-300`}
                  >
                    {/* Background Image */}
                    <Image
                      src={build.background}
                      alt={build.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />

                    {/* Text overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-bold text-sm md:text-base lg:text-lg font-junge tracking-widest drop-shadow-lg">
                        {build.name}
                      </span>
                    </div>

                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${build.hoverGlow} to-transparent`}
                      />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* User's Personal Builds Section */}
        {builds.length > 0 && (
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-gradient-to-b from-red-400 to-red-600 rounded-full" />
            <h3 className="text-xl font-bold text-grey-100 tracking-wide">
              Make Your Own
            </h3>
            <div className="flex-1 h-px bg-gradient-to-r from-grey-600 to-transparent" />
          </div>
        )}

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {buildsToShow.map((build, index) => (
            <motion.div
              key={index}
              variants={scaleIn}
              // whileHover={{
              //   y: -10,
              //   scale: 1.02,
              //   transition: { duration: 0.2 },
              // }}
            >
              <Link
                href={`/builds/create?build=${encodeURIComponent(build.code)}`}
              >
                <BuildContent
                  code={build.code}
                  name={build.name}
                  handleDeleteBuild={(event: React.MouseEvent) =>
                    handleDelete(event, index)
                  }
                />
              </Link>
            </motion.div>
          ))}

          {builds.length > 0 && (
            <motion.div
              variants={scaleIn}
              className={`relative group cursor-pointer ${getButtonSpanClass()}`}
            >
              {/* Show View Library button if on homepage (maxBuilds set) and have more builds than displayed */}
              {maxBuilds && builds.length >= maxBuilds ? (
                <Link
                  href="/builds"
                  className="flex items-center justify-center"
                >
                  <div className="flex flex-col items-center justify-center gap-2 p-4 group cursor-pointer">
                    {/* Library icon */}
                    <div className="w-10 h-10 rounded-full border-2 border-red-900/50 flex items-center justify-center group-hover:border-red-500 transition-colors duration-300">
                      <Swords className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors duration-300" />
                    </div>

                    {/* Text */}
                    <span className="text-white group-hover:text-red-300 font-bold text-sm tracking-wide transition-colors duration-300">
                      VIEW ALL IN LIBRARY
                    </span>
                    <span className="text-white/60 group-hover:text-white/80 text-xs transition-colors duration-300">
                      {builds.length} builds available
                    </span>
                  </div>
                </Link>
              ) : (
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
              )}
            </motion.div>
          )}
        </motion.div>

        {builds.length === 0 && (
          <motion.div
            className="flex justify-center gap-4 mb-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div>
              <Link
                href="/builds/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-900/50 border border-red-900/50 text-white font-medium rounded-lg hover:bg-red-900/70 hover:border-red-500 transition-all duration-200 group"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                CREATE YOUR FIRST BUILD
              </Link>
            </motion.div>
          </motion.div>
        )}

        {/* View All Button - Only show when requested and there are more builds */}
        {/* {showViewAllButton &&
          builds.length > 0 &&
          maxBuilds &&
          builds.length > maxBuilds && (
            <motion.div
              className="text-center mt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-red-900 text-white hover:bg-red-900/20 hover:border-red-500
                         relative overflow-hidden group px-8 shadow-lg shadow-red-900/20"
                >
                  <Link href="/builds" className="flex items-center">
                    <span className="relative z-10 font-bold tracking-wider">
                      MANAGE ALL BUILDS ({builds.length})
                    </span>
                    <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                  </Link>
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-red-900/40 to-transparent"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </Button>
              </motion.div>
            </motion.div>
          )} */}
      </div>
    </TooltipProvider>
  );
}
