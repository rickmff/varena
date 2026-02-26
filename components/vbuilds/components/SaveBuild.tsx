"use client";

import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useBuilder } from "../BuildProvider";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, useSearchParams } from "next/navigation";
import { arenaCode } from "@/components/machines/converter";
import { isValidEnglishAlphabet, filterEnglishAlphabet } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const SaveBuild: React.FC = () => {
  const { state } = useBuilder();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [buildId, setBuildId] = useState<string | null>(null);
  const [hasLoadedBuild, setHasLoadedBuild] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [buildUpvotes, setBuildUpvotes] = useState(0);
  const [buildDownvotes, setBuildDownvotes] = useState(0);
  const [showVoteWarningDialog, setShowVoteWarningDialog] = useState(false);

  // Load build data when component mounts or when code from URL changes
  useEffect(() => {
    const loadBuildData = async () => {
      if (authLoading || hasLoadedBuild) return;

      // Get build code from URL first, then fallback to current state
      const urlCode = searchParams.get("build");
      const buildCode = urlCode || arenaCode(state.context);

      if (!buildCode || isEmptyBuild(buildCode)) {
        // Initialize name only if no build code
        if (!name) {
          setName("Build 1");
        }
        // New build - user owns it
        setIsOwner(true);
        setHasLoadedBuild(true);
        return;
      }

      // If not authenticated, check localStorage first (before API)
      if (!isAuthenticated && typeof window !== "undefined") {
        try {
          const localBuildsData = localStorage.getItem("vbuilds");
          if (localBuildsData) {
            const parsed = JSON.parse(localBuildsData);
            if (Array.isArray(parsed)) {
              const foundBuild = parsed.find((b: any) => b.code === buildCode);
              if (foundBuild) {
                // Build found in localStorage - user owns it
                setName(foundBuild.name || "Build 1");
                setIsPublic(false);
                if (foundBuild.id) {
                  setBuildId(foundBuild.id);
                }
                setIsOwner(true);
                setHasLoadedBuild(true);
                return;
              }
            }
          }
        } catch (error) {
          console.error("Error loading from localStorage:", error);
        }
      }

      // Always try to fetch from API (works for public builds even when unauthenticated)
      try {
        const response = await fetch(`/api/builds?code=${encodeURIComponent(buildCode)}`);
        if (response.ok) {
          const build = await response.json();
          if (build && build.name) {
            setName(build.name);
            setIsPublic(build.isPublic || false);
            setBuildUpvotes(build.upvotes || 0);
            setBuildDownvotes(build.downvotes || 0);

            // Check ownership: compare build.userId with current user's ID
            const currentUserId = user?.id;
            const buildOwnerId = build.userId;
            let ownsBuild = isAuthenticated && currentUserId && buildOwnerId && currentUserId === buildOwnerId;

            // If not authenticated, check if this build also exists in localStorage (user's local copy)
            if (!isAuthenticated && typeof window !== "undefined") {
              try {
                const localBuildsData = localStorage.getItem("vbuilds");
                if (localBuildsData) {
                  const parsed = JSON.parse(localBuildsData);
                  if (Array.isArray(parsed)) {
                    const localBuild = parsed.find((b: any) => b.code === buildCode);
                    if (localBuild) {
                      // Build exists in localStorage, so user owns a local copy
                      ownsBuild = true;
                      if (localBuild.id) {
                        setBuildId(localBuild.id);
                      }
                    // Use local name if available
                      if (localBuild.name) {
                        setName(localBuild.name);
                      }
                    }
                  }
                }
              } catch (error) {
                console.error("Error checking localStorage:", error);
              }
            }

            setIsOwner(ownsBuild);

            // Set buildId if authenticated (needed for updates)
            if (isAuthenticated) {
              setBuildId(build.id);
            }
            setHasLoadedBuild(true);
            return;
          }
        }
      } catch (error) {
        console.error("Error loading build data from API:", error);
      }

      // If not found in API and authenticated, initialize with default name
      if (isAuthenticated) {
        if (!name) {
          setName("Build 1");
        }
        // New build - user owns it
        setIsOwner(true);
        setHasLoadedBuild(true);
        return;
      }

      // Not authenticated and not found in API, check localStorage
      if (typeof window !== "undefined") {
        try {
          const localBuildsData = localStorage.getItem("vbuilds");
          if (localBuildsData) {
            const parsed = JSON.parse(localBuildsData);
            if (Array.isArray(parsed)) {
              const foundBuild = parsed.find((b: any) => b.code === buildCode);
              if (foundBuild) {
                setName(foundBuild.name || "Build 1");
                // Unauthenticated users can't have public builds
                setIsPublic(false);
                // Set buildId from localStorage if it exists
                if (foundBuild.id) {
                  setBuildId(foundBuild.id);
                }
                // If build found in localStorage, user owns it (it's their local build)
                setIsOwner(true);
                setHasLoadedBuild(true);
                return;
              }
            }
          }
          // Build not found in localStorage - it's a new build for unauthenticated user
          // They own it locally since they're creating it
          if (!name) {
            setName("Build 1");
          }
          setIsOwner(true);
        } catch (error) {
          console.error("Error loading local build:", error);
          if (!name) {
            setName("Build 1");
          }
          // On error, assume it's a new build - user owns it
          setIsOwner(true);
        }
      } else {
        if (!name) {
          setName("Build 1");
        }
        // Server-side, assume new build - user owns it
        setIsOwner(true);
      }

      setHasLoadedBuild(true);
    };

    loadBuildData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading, searchParams]);

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

  const getCurrentBuildUrl = () => {
    const buildCode = arenaCode(state.context);
    const currentUrl = window.location.pathname;
    const buildQuery = buildCode ? `?build=${encodeURIComponent(buildCode)}` : "";
    return `${currentUrl}${buildQuery}`;
  };

  const saveToLocalStorage = (buildName: string, buildCode: string, localBuildId?: string | null) => {
    if (typeof window === "undefined") return false;

    try {
      // Get existing builds from localStorage
      const existingBuildsData = localStorage.getItem("vbuilds");
      let existingBuilds: Array<{ id?: string; code: string; timestamp?: string; name: string }> = [];

      if (existingBuildsData) {
        try {
          existingBuilds = JSON.parse(existingBuildsData);
          if (!Array.isArray(existingBuilds)) {
            existingBuilds = [];
          }
        } catch (error) {
          console.error("Failed to parse existing builds from localStorage:", error);
          existingBuilds = [];
        }
      }

      // Determine if this is an update or new build
      let existingIndex = -1;

      // First try to find by ID if provided
      if (localBuildId) {
        existingIndex = existingBuilds.findIndex((b) => b.id === localBuildId);
      }

      // If not found by ID, try to find by code
      if (existingIndex === -1) {
        existingIndex = existingBuilds.findIndex((b) => b.code === buildCode);
      }

      // If still not found, try to find by name (fallback)
      if (existingIndex === -1) {
        existingIndex = existingBuilds.findIndex((b) => b.name === buildName);
      }

      // Generate ID if this is a new build
      const buildIdToUse = localBuildId || `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      if (existingIndex !== -1) {
        // Update existing build
        existingBuilds[existingIndex] = {
          id: buildIdToUse,
          code: buildCode,
          name: buildName,
          timestamp: new Date().toISOString(),
        };
      } else {
        // Add new build
        existingBuilds.push({
          id: buildIdToUse,
          code: buildCode,
          name: buildName,
          timestamp: new Date().toISOString(),
        });
      }

      // Save back to localStorage
      localStorage.setItem("vbuilds", JSON.stringify(existingBuilds));

      // Update buildId state for local builds
      if (!isAuthenticated) {
        setBuildId(buildIdToUse);
      }

      return true;
    } catch (error) {
      console.error("Error saving build to localStorage:", error);
      return false;
    }
  };

  const saveBuildCommand = async (skipWarning = false) => {
    if (authLoading) {
      return;
    }

    const buildName = name.trim();

    // Validate build name length (minimum 3 characters)
    if (!buildName || buildName.length < 3) {
      toast.error("Build name must be at least 3 characters long");
      return;
    }

    // Validate build name contains only English alphabet characters
    if (!isValidEnglishAlphabet(buildName)) {
      toast.error("Build name can only contain English alphabet characters, numbers, and spaces");
      return;
    }

    const buildCode = arenaCode(state.context);

    if (!buildCode) {
      toast.error("No build to save");
      return;
    }

    // Check if warning should be shown before saving
    if (!skipWarning && isOwner && isPublic && (buildUpvotes > 0 || buildDownvotes > 0)) {
      setShowVoteWarningDialog(true);
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      // Force isPublic to false for unauthenticated users (they can't publish)
      if (isPublic) {
        setIsPublic(false);
      }

      // Save to localStorage for non-authenticated users
      // Use buildId if it's a local build ID, otherwise use null to generate new one
      const localBuildId = buildId && buildId.startsWith("local-") ? buildId : null;
      const saved = saveToLocalStorage(buildName, buildCode, localBuildId);
      if (saved) {
        toast.success("Build saved locally! Sign in to sync across devices.", {
          duration: 4000,
        });
        // Redirect to builds page to see the saved build
        setTimeout(() => {
          router.push("/builds");
        }, 500);
      } else {
        toast.error("Failed to save build locally");
      }
      return;
    }

    // Prevent making empty builds public
    if (isPublic && isEmptyBuild(buildCode)) {
      toast.error("Cannot make an empty build public. Please add items to your build first.", {
        duration: 5000,
      });
      return;
    }

    // Prevent making incomplete builds public
    if (isPublic && !isBuildComplete(buildCode)) {
      toast.error("Cannot make an incomplete build public. Please fill all required slots (armour, amulet, elixir, blood, spells, weapons, and passives) first.", {
        duration: 5000,
      });
      return;
    }

    setLoading(true);

    try {
      // If buildId exists, update the existing build, otherwise create a new one
      const url = buildId ? `/api/builds/${buildId}` : "/api/builds";
      const method = buildId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: buildName,
          code: buildCode,
          isPublic: isPublic,
        }),
      });

      if (response.status === 401) {
        setShowAuthDialog(true);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        const errorMessage = error.error || "Failed to save build";

        // Show specific error message with longer duration for important errors
        if (response.status === 400 && (errorMessage.includes("empty build") || errorMessage.includes("incomplete build") || errorMessage.includes("5 public builds"))) {
          toast.error(errorMessage, {
            duration: 5000,
          });
        } else {
          toast.error(errorMessage);
        }
        setLoading(false);
        return;
      }

      const savedBuild = await response.json();

      // Update buildId if it's a new build
      if (!buildId && savedBuild.id) {
        setBuildId(savedBuild.id);
      }

      toast.success(buildId ? "Build updated successfully!" : "Build saved successfully!");

      // Redirect to builds page
      setTimeout(() => {
        router.push("/builds");
      }, 500);
    } catch (error) {
      console.error("Error saving build:", error);
      toast.error("Failed to save build");
      setLoading(false);
    }
  };

  const handleSignIn = () => {
    const callbackUrl = getCurrentBuildUrl();
    router.push(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  };

  const handleSignUp = () => {
    const callbackUrl = getCurrentBuildUrl();
    router.push(`/auth/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  };

  const handleClone = async () => {
    if (authLoading) {
      return;
    }

    const buildName = name.trim();

    // Validate build name contains only English alphabet characters before cloning
    if (buildName && !isValidEnglishAlphabet(buildName)) {
      toast.error("Build name can only contain English alphabet characters, numbers, and spaces");
      return;
    }

    // Generate cloned name with version number (v2, v3, etc.)
    let clonedName: string;
    if (!buildName) {
      clonedName = "Build 1 v2";
    } else {
      // Check if name ends with vN pattern (v2, v3, v10, etc.)
      const versionPattern = /\s+v(\d+)$/i;
      const match = buildName.match(versionPattern);

      if (match) {
        // Name ends with version, increment it
        const currentVersion = parseInt(match[1], 10);
        const nextVersion = currentVersion + 1;
        const baseName = buildName.substring(0, match.index).trim();
        clonedName = `${baseName} v${nextVersion}`;
      } else {
        // Name doesn't have version, add v2
        clonedName = `${buildName} v2`;
      }
    }

    // Validate cloned name length (minimum 3 characters and max 30)
    if (clonedName.length < 3) {
      toast.error("Build name must be at least 3 characters long");
      return;
    }

    if (clonedName.length > 30) {
      // If name is too long, truncate base name and add version
      const maxBaseLength = 30 - 4; // Reserve space for " v2" (4 chars)
      const baseName = buildName.replace(/\s+v(\d+)$/i, "").trim();
      const truncatedBase = baseName.substring(0, maxBaseLength).trim();
      const versionPattern = /\s+v(\d+)$/i;
      const match = buildName.match(versionPattern);

      if (match) {
        const currentVersion = parseInt(match[1], 10);
        const nextVersion = currentVersion + 1;
        clonedName = `${truncatedBase} v${nextVersion}`;
      } else {
        clonedName = `${truncatedBase} v2`;
      }
    }

    const buildCode = arenaCode(state.context);

    if (!buildCode) {
      toast.error("No build to clone");
      return;
    }

    // Set name to cloned name and clear buildId to treat as new build
    setName(clonedName);
    setBuildId(null);

    // If not authenticated, save to localStorage
    if (!isAuthenticated) {
      const saved = saveToLocalStorage(clonedName, buildCode, null);
      if (saved) {
        toast.success("Build cloned locally! Sign in to sync across devices.", {
          duration: 4000,
        });
        setTimeout(() => {
          router.push("/builds");
        }, 500);
      } else {
        toast.error("Failed to clone build locally");
      }
      return;
    }

    // For authenticated users, prevent making cloned builds public initially
    const wasPublic = isPublic;
    setIsPublic(false);

    setLoading(true);

    try {
      const response = await fetch("/api/builds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: clonedName,
          code: buildCode,
          isPublic: false, // Cloned builds start as private
        }),
      });

      if (response.status === 401) {
        setShowAuthDialog(true);
        setLoading(false);
        setIsPublic(wasPublic);
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        const errorMessage = error.error || "Failed to clone build";
        toast.error(errorMessage);
        setLoading(false);
        setIsPublic(wasPublic);
        return;
      }

      const clonedBuild = await response.json();
      setBuildId(clonedBuild.id);

      toast.success("Build cloned successfully!");

      // Redirect to builds page
      setTimeout(() => {
        router.push("/builds");
      }, 500);
    } catch (error) {
      console.error("Error cloning build:", error);
      toast.error("Failed to clone build");
      setLoading(false);
      setIsPublic(wasPublic);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex gap-4">
          <Input
            className="text-base bg-black/50 px-4 py-2 rounded-md border text-gray-400 flex-1"
            value={name}
            onChange={(e) => {
              // Filter out non-English alphabet characters
              const filteredValue = filterEnglishAlphabet(e.target.value);
              setName(filteredValue);
            }}
            placeholder="Build name"
            disabled={loading}
            maxLength={30}
          />
          {!isOwner && (
            <Button
              onClick={handleClone}
              disabled={loading || authLoading || !name.trim() || name.trim().length < 3}
              variant="outline"
              className="px-3 py-2 text-white group border-white/30 bg-transparent hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              CLONE
            </Button>
          )}
          {isOwner && (
            <>
              <Button
                onClick={handleClone}
                disabled={loading || authLoading || !name.trim() || name.trim().length < 3}
                variant="outline"
                className="px-3 py-2 text-white group border-white/30 bg-transparent hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                CLONE
              </Button>
              <Button
                onClick={() => saveBuildCommand(false)}
                disabled={loading || authLoading || !name.trim() || name.trim().length < 3}
                className="px-3 py-2 text-white group border-red-900/70  bg-red-900/50 hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "SAVING..." : "SAVE"}
              </Button>
            </>
          )}
        </div>
      </div>

      <AlertDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <AlertDialogContent className="bg-black border-[#5865F2]/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Sign In to Sync Your Builds</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Your build has been saved locally. Sign in to sync your builds across devices and access them from anywhere.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="bg-gray-800 text-white hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={handleSignUp}
              className="bg-[#0f0a47] hover:bg-[#4752C4] border-[#5865F2] text-white"
            >
              Sign Up
            </Button>
            <Button
              onClick={handleSignIn}
              className="bg-[#0f0a47] hover:bg-[#4752C4] border-[#5865F2] text-white"
            >
              Sign In
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showVoteWarningDialog} onOpenChange={setShowVoteWarningDialog}>
        <AlertDialogContent className="bg-black border-red-900/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Warning: You Will Lose All Votes</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This build is public and has <span className="text-green-500">{buildUpvotes}</span> vote up and <span className="text-blue-500">{buildDownvotes}</span> vote down.
              If you save changes, you will lose all votes on this build. Do you want to continue?              <span className="text-red-500 block mt-2">This action is irreversible and cannot be undone.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="bg-gray-800 text-white hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={() => {
                setShowVoteWarningDialog(false);
                handleClone();
              }}
              variant="outline"
              className="border-white/30 bg-transparent hover:bg-white/10 text-white"
            >
              Clone Instead
            </Button>
            <Button
              onClick={() => {
                setShowVoteWarningDialog(false);
                saveBuildCommand(true);
              }}
              className="bg-red-900/50 hover:bg-red-800 border-red-900/70 text-white"
            >
              Save Anyway
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SaveBuild;
