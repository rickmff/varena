"use client";

import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useBuilder } from "../BuildProvider";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { arenaCode } from "@/components/machines/converter";
import { Switch } from "@/components/ui/switch";
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
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  // Initialize name
  useEffect(() => {
    if (!name) {
      setName("Build 1");
    }
  }, [name]);

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

  const saveToLocalStorage = (buildName: string, buildCode: string) => {
    if (typeof window === "undefined") return;

    try {
      // Get existing builds from localStorage
      const existingBuildsData = localStorage.getItem("vbuilds");
      let existingBuilds: Array<{ code: string; timestamp?: string; name: string }> = [];

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

      // Check if a build with the same name already exists
      const existingIndex = existingBuilds.findIndex((b) => b.name === buildName);
      if (existingIndex !== -1) {
        // Update existing build
        existingBuilds[existingIndex] = {
          code: buildCode,
          name: buildName,
          timestamp: new Date().toISOString(),
        };
      } else {
        // Add new build
        existingBuilds.push({
          code: buildCode,
          name: buildName,
          timestamp: new Date().toISOString(),
        });
      }

      // Save back to localStorage
      localStorage.setItem("vbuilds", JSON.stringify(existingBuilds));
      return true;
    } catch (error) {
      console.error("Error saving build to localStorage:", error);
      return false;
    }
  };

  const saveBuildCommand = async () => {
    if (authLoading) {
      return;
    }

    const buildName = name.trim() || "Build 1";
    const buildCode = arenaCode(state.context);

    if (!buildCode) {
      toast.error("No build to save");
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      // Save to localStorage for non-authenticated users
      const saved = saveToLocalStorage(buildName, buildCode);
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
      const response = await fetch("/api/builds", {
        method: "POST",
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
      toast.success("Build saved successfully!");

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

  return (
    <>
      <div className="space-y-4">
        <div className="flex gap-4">
          <Input
            className="text-base bg-black/50 px-4 py-2 rounded-md border text-gray-400 flex-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Build name"
            disabled={loading}
            maxLength={42}
          />
          <Button
            onClick={saveBuildCommand}
            disabled={loading || authLoading}
            className="px-3 py-2 text-white group border-red-900/70  bg-red-900/50 hover:bg-red-800 transition-colors"
          >
            {loading ? "SAVING..." : "SAVE"}
          </Button>
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
    </>
  );
};

export default SaveBuild;
