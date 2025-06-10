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
import { StarterBuilds } from "./StarterBuilds";
import { BuildContent } from "./BuildsList";

type Build = {
  name: string;
  code: string;
};

interface BuildsListProps {
  maxBuilds?: number; // Maximum number of builds to show
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

const premadeBuilds = [
  {
    name: "CASTER",
    background: "/images/templates/caster.png",
    code: "722222222bcg9af3456g2456413656o6479n218700000000000000000000000000000033333961",
    baseBorder: "border-purple-500/30",
    hoverBorder: "hover:border-purple-500",
    hoverGlow: "from-purple-900/20",
  },
  {
    name: "ASSASSIN",
    background: "/images/templates/assassin.png",
    code: "622222222bc4n12136734563223565103E8n218700000000000000000000000000000054444751",
    baseBorder: "border-orange-500/30",
    hoverBorder: "hover:border-orange-500",
    hoverGlow: "from-orange-900/20",
  },
  {
    name: "BRAWLER",
    background: "/images/templates/brawler.png",
    code: "822222222bc1k42136734563223565103E8n218700000000000000000000000000000052222751",
    baseBorder: "border-red-500/30",
    hoverBorder: "hover:border-red-500",
    hoverGlow: "from-red-900/20",
  },
  {
    name: "HYBRID",
    background: "/images/templates/hybrid.png",
    code: "600000000kcb4na1258345636234551038En217800000000000000000000000000000052222251",
    baseBorder: "border-green-500/30",
    hoverBorder: "hover:border-green-500",
    hoverGlow: "from-green-900/20",
  },
];

export default function BuildsListHome({
  maxBuilds = 3,
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
        }
      } catch (error) {
        console.error("Failed to load builds from localStorage:", error);
        setBuilds([]);
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

  // // Get the builds to display (limited by maxBuilds if specified)
  const buildsToShow = maxBuilds ? builds.slice(0, maxBuilds) : builds;

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
        <StarterBuilds />
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
          {builds.length < maxBuilds && (
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
          {buildsToShow.map((build, index) => (
            <motion.div key={index} variants={scaleIn}>
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
              {maxBuilds && builds.length >= maxBuilds && (
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
      </div>
    </TooltipProvider>
  );
}
