"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Plus, Swords } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  TooltipProvider,
} from "@/components/ui/tooltip";
import React from "react";
import "@/components/vbuilds/styles.css";
import { BuildContent } from "./BuildsList";
import { useAuth } from "@/hooks/use-auth";

type Build = {
  id?: string;
  name: string;
  code: string;
  isPublic?: boolean;
};

interface BuildsListProps {
  maxBuilds?: number; // Maximum number of builds to show
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

export default function BuildsListHome({
  maxBuilds = 3,
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
        const response = await fetch("/api/builds?limit=100");

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
          }))
          : (data.builds || []).map((build: any) => ({
            id: build.id,
            name: build.name,
            code: build.code,
            isPublic: build.isPublic || false,
          }));

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

    toast("Are you sure you want to delete this build?", {
      closeButton: true,
      actionButtonStyle: { backgroundColor: "#f87171" },
      action: {
        label: "Delete",
        onClick: async () => {
          if (!buildId) {
            toast.error("Build ID not found");
            return;
          }

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

            const updatedBuilds = builds.filter((_, i) => i !== index);
            setBuilds(updatedBuilds);
            onBuildsLoaded?.(updatedBuilds.length > 0);
            toast.success("Build deleted successfully");
          } catch (error) {
            console.error("Failed to delete build:", error);
            toast.error("Failed to delete build");
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

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Increased stagger delay for more noticeable succession
      },
    },
  };


  return (
    <TooltipProvider>
      <div className="pb-16">
        {/* User's Personal Builds Section */}
        {builds.length > 0 && (
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-gradient-to-b from-red-400 to-red-600 rounded-full" />
            <h3 className="text-xl font-bold text-grey-100 tracking-wide">
              MY BUILDS
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
          {builds.length < maxBuilds && builds.length !== 0 && (
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
            <motion.div key={build.id || index} variants={scaleIn}>
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
                  showPublicToggle={false}
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
                  href="/builds/create"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-red-900/50 border border-red-900/50 text-white font-medium rounded-lg hover:bg-red-900/70 hover:border-red-500 transition-all duration-200 group"
                >
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                  CREATE YOUR FIRST BUILD
                </Link>
              )}
            </motion.div>
          </motion.div>
        )}
      </div>
    </TooltipProvider>
  );
}
