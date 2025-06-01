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

type Build = {
  name: string;
  code: string;
};

interface BuildsListProps {
  maxBuilds?: number; // Maximum number of builds to show
  showViewAllButton?: boolean; // Whether to show the "View All" button
  onBuildsLoaded?: (hasBuilds: boolean) => void; // Callback when builds are loaded
}

const Img = ({ src, alt = "" }: { src: string | undefined; alt?: string }) => {
  return src ? <img src={src} className="w-6 h-6" alt={alt} /> : null;
};

const BuildContent = ({ code }: { code: string }) => {
  const build = convertStringToBuild(code);

  return (
    <div className="space-y-6">
      {/* Top Row - Armor, Buffs, Blood */}
      <div className="grid grid-cols-3 gap-4">
        {/* Armor Section */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-red-400 uppercase tracking-wider">Armor</div>
          <div className="flex gap-1">
            <div className="relative w-8 h-8 bg-zinc-900/50 rounded border border-red-900/30 flex items-center justify-center overflow-hidden">
              <Img src={build.armour?.image} alt="Armor" />
            </div>
            <div className="relative w-8 h-8 bg-zinc-900/50 rounded border border-red-900/30 flex items-center justify-center overflow-hidden">
              <Img src={build.amulet?.image} alt="Amulet" />
            </div>
          </div>
        </div>

        {/* Buffs Section */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-red-400 uppercase tracking-wider">Buffs</div>
          <div className="flex gap-1">
            <div className="relative w-8 h-8 bg-zinc-900/50 rounded border border-red-900/30 flex items-center justify-center overflow-hidden">
              <Img src={build.elixir?.image} alt="Elixir" />
            </div>
            {build.coatings &&
              Array.from(build.coatings.values()).slice(0, 2).map((coating, index) => (
                coating && coating.image ? (
                  <div key={index} className="relative w-8 h-8 bg-zinc-900/50 rounded border border-red-900/30 flex items-center justify-center overflow-hidden">
                    <Img src={coating.image} alt={`Coating ${index}`} />
                  </div>
                ) : null
              ))}
          </div>
        </div>

        {/* Blood Section */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-red-400 uppercase tracking-wider">Blood</div>
          <div className="flex gap-1">
            {build.blood?.primary && (
              <div className="relative w-8 h-8 bg-zinc-900/50 rounded border border-red-900/30 flex items-center justify-center overflow-hidden">
                <Img
                  src={bloodData[build.blood.primary as keyof typeof bloodData]?.image}
                  alt={`Blood: ${build.blood.primary}`}
                />
              </div>
            )}
            {build.blood?.secondary && (
              <div className="relative w-8 h-8 bg-zinc-900/50 rounded border border-red-900/30 flex items-center justify-center overflow-hidden">
                <Img
                  src={bloodData[build.blood.secondary as keyof typeof bloodData]?.image}
                  alt={`Blood: ${build.blood.secondary}`}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Middle Row - Spells and Passives */}
      <div className="grid grid-cols-2 gap-4">
        {/* Spells Section */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-red-400 uppercase tracking-wider">Spells</div>
          <div className="grid grid-cols-4 gap-1">
            {build.spells.dash && (
              <div className="relative w-8 h-8 bg-zinc-900/50 rounded border border-red-900/30 flex items-center justify-center overflow-hidden">
                <Img src={build.spells.dash.img} alt="Veil" />
              </div>
            )}
            {build.spells.spell1 && (
              <div className="relative w-8 h-8 bg-zinc-900/50 rounded border border-red-900/30 flex items-center justify-center overflow-hidden">
                <Img src={build.spells.spell1.img} alt="Spell 1" />
              </div>
            )}
            {build.spells.spell2 && (
              <div className="relative w-8 h-8 bg-zinc-900/50 rounded border border-red-900/30 flex items-center justify-center overflow-hidden">
                <Img src={build.spells.spell2.img} alt="Spell 2" />
              </div>
            )}
            {build.spells.ultimate && (
              <div className="relative w-8 h-8 bg-zinc-900/50 rounded border border-red-900/30 flex items-center justify-center overflow-hidden">
                <Img src={build.spells.ultimate.img} alt="Ultimate" />
              </div>
            )}
          </div>
        </div>

        {/* Passives Section */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-red-400 uppercase tracking-wider">Passives</div>
          <div className="grid grid-cols-3 gap-1">
            {build.passives.slice(0, 6).map((passive, index) => (
              <div key={index} className="relative w-8 h-8 bg-zinc-900/50 rounded border border-red-900/30 flex items-center justify-center overflow-hidden">
                <Img src={passive.img} alt={`Passive ${index}`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row - Weapons */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-red-400 uppercase tracking-wider">Weapons</div>
        <div className="flex gap-1 flex-wrap">
          {Array.from(build.weapons.values()).map((weapon, index) => (
            <div key={index} className="relative w-8 h-8 bg-zinc-900/50 rounded border border-red-900/30 flex items-center justify-center overflow-hidden">
              <Img src={weapon.img} alt={`Weapon ${index}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function BuildsList({
  maxBuilds,
  showViewAllButton = false,
  onBuildsLoaded
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
    event.stopPropagation();

    // Remove the build at the specified index
    const updatedBuilds = [...builds];
    updatedBuilds.splice(index, 1);

    // Update state and localStorage
    setBuilds(updatedBuilds);
    try {
      localStorage.setItem("vbuilds", JSON.stringify(updatedBuilds));
    } catch (error) {
      console.error("Failed to update localStorage:", error);
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

  // Get the builds to display (limited by maxBuilds if specified)
  const buildsToShow = maxBuilds ? builds.slice(0, maxBuilds) : builds;

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
    <>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {buildsToShow.map((build, index) => (
          <motion.div
            key={index}
            variants={scaleIn}
            whileHover={{
              y: -10,
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
          >
            <Card
              className="bg-black/80 backdrop-blur-sm rounded-lg border-2 border-red-900/30 hover:border-red-500
                       transition-all duration-300 overflow-hidden group cursor-pointer h-full relative"
              onClick={() => handleBuildClick(build.code)}
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-red-900/20 via-transparent to-red-900/20" />
              </div>

              <div className="absolute top-4 right-4 flex gap-2 z-10">
                <motion.button
                  className="bg-blue-600/80 hover:bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200 backdrop-blur-sm border border-blue-500/50"
                  onClick={(e) => handleCopyCommand(e, build.code)}
                  aria-label="Copy build command"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ClipboardCopyIcon size={16} />
                </motion.button>
                <motion.button
                  className="bg-red-600/80 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200 backdrop-blur-sm border border-red-500/50"
                  onClick={(e) => handleDelete(e, index)}
                  aria-label="Delete build"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ×
                </motion.button>
              </div>

              <CardHeader className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Swords className="w-5 h-5 text-red-500" />
                  <span className="text-red-500 text-sm font-bold tracking-wider uppercase">
                    Build
                  </span>
                </div>
                <CardTitle className="text-xl font-bold group-hover:text-red-400 transition-colors">
                  {build.name || "Unnamed Build"}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <BuildContent code={build.code} />

                {/* Edit indicator */}
                <motion.div
                  className="mt-4 flex items-center gap-2 text-red-500 text-sm font-bold
                           group-hover:text-red-400 transition-colors"
                  initial={{ x: -10, opacity: 0 }}
                  whileHover={{ x: 5 }}
                  animate={{ x: 0, opacity: 1 }}
                >
                  EDIT BUILD
                  <motion.div
                    className="w-4 h-4 group-hover:translate-x-2 transition-transform"
                    initial={{ rotate: 0 }}
                    whileHover={{ rotate: 90 }}
                  >
                    ⚔️
                  </motion.div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
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
              Create Your Build
            </Link>
          </motion.div>
        </motion.div>
      )}

      {/* View All Button - Only show when requested and there are more builds */}
      {showViewAllButton && builds.length > 0 && maxBuilds && builds.length > maxBuilds && (
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
                  VIEW ALL BUILDS ({builds.length})
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
      )}
    </>
  );
}
