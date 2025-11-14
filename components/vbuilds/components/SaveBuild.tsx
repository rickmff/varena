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

  const getCurrentBuildUrl = () => {
    const buildCode = arenaCode(state.context);
    const currentUrl = window.location.pathname;
    const buildQuery = buildCode ? `?build=${encodeURIComponent(buildCode)}` : "";
    return `${currentUrl}${buildQuery}`;
  };

  const saveBuildCommand = async () => {
    if (authLoading) {
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }

    const buildName = name.trim() || "Build 1";
    const buildCode = arenaCode(state.context);

    if (!buildCode) {
      toast.error("No build to save");
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
        toast.error(error.error || "Failed to save build");
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
            <AlertDialogTitle className="text-white">Sign In Required</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              You need to sign in to save your builds. Would you like to sign in or create a new account?
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
