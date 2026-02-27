"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TierListCard } from "./TierListCard";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

type TierKey = "S" | "A" | "B" | "C" | "D" | "Unranked";

type TierState = {
  [key in TierKey]: string[];
};

type TierList = {
  id: string;
  name: string;
  isPublic: boolean;
  tiers: TierState;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  updatedAt: string;
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

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3 },
  },
};

export function MyTierLists() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [tierLists, setTierLists] = useState<TierList[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    fetchTierLists();
  }, [isAuthenticated, authLoading]);

  const fetchTierLists = async () => {
    setLoading(true);
    try {
      if (!isAuthenticated) {
        // Load tier lists from localStorage for non-authenticated users
        if (typeof window !== "undefined") {
          const localTierListsData = localStorage.getItem("vtierlists");
          if (localTierListsData) {
            try {
              const parsed = JSON.parse(localTierListsData);
              if (Array.isArray(parsed) && parsed.length > 0) {
                // Convert localStorage format to TierList format
                const tierListsArray = parsed.map((tierList: any, index: number) => ({
                  id: tierList.id || `local-${index}-${tierList.name}`,
                  name: tierList.name || `Tier List ${index + 1}`,
                  tiers: tierList.tiers || { S: [], A: [], B: [], C: [], D: [], Unranked: [] },
                  isPublic: false, // LocalStorage tier lists are always private
                  upvotes: 0,
                  downvotes: 0,
                  createdAt: tierList.timestamp || new Date().toISOString(),
                  updatedAt: tierList.timestamp || new Date().toISOString(),
                }));
                setTierLists(tierListsArray);
                setLoading(false);
                return;
              }
            } catch (error) {
              console.error("Failed to parse local tier lists:", error);
            }
          }
        }
        setTierLists([]);
        setLoading(false);
        return;
      }

      const response = await fetch("/api/tier-lists");
      if (!response.ok) throw new Error("Failed to load tier lists");
      const data = await response.json();
      setTierLists(data.tierLists || []);
    } catch (error) {
      console.error("Error loading tier lists:", error);
      toast.error("Failed to load tier lists");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const defaultTiers: TierState = {
        S: [],
        A: [],
        B: [],
        C: [],
        D: [],
        Unranked: [],
      };

      if (!isAuthenticated) {
        // Save to localStorage for non-authenticated users
        if (typeof window !== "undefined") {
          const localTierListsData = localStorage.getItem("vtierlists");
          let localTierLists: any[] = [];

          if (localTierListsData) {
            try {
              localTierLists = JSON.parse(localTierListsData);
              if (!Array.isArray(localTierLists)) {
                localTierLists = [];
              }
            } catch (error) {
              console.error("Failed to parse local tier lists:", error);
              localTierLists = [];
            }
          }

          const newTierList = {
            id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: "Tier List Name",
            tiers: defaultTiers,
            isPublic: false,
            timestamp: new Date().toISOString(),
          };

          localTierLists.push(newTierList);
          localStorage.setItem("vtierlists", JSON.stringify(localTierLists));

          router.push(`/tier-list/${newTierList.id}`);
          setIsCreating(false);
          return;
        }
      }

      const response = await fetch("/api/tier-lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Tier List Name",
          tiers: defaultTiers,
          isPublic: false,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create tier list");
      }

      const data = await response.json();
      router.push(`/tier-list/${data.id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create tier list");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tier list?")) return;

    try {
      if (!isAuthenticated && id.startsWith("local-")) {
        // Delete from localStorage
        if (typeof window !== "undefined") {
          const localTierListsData = localStorage.getItem("vtierlists");
          if (localTierListsData) {
            try {
              const localTierLists = JSON.parse(localTierListsData);
              if (Array.isArray(localTierLists)) {
                const filtered = localTierLists.filter((t: any) => t.id !== id);
                localStorage.setItem("vtierlists", JSON.stringify(filtered));
                setTierLists((prev) => prev.filter((t) => t.id !== id));
                toast.success("Tier list deleted");
                return;
              }
            } catch (error) {
              console.error("Failed to parse local tier lists:", error);
            }
          }
        }
        toast.error("Failed to delete tier list");
        return;
      }

      const response = await fetch(`/api/tier-lists/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete tier list");

      setTierLists((prev) => prev.filter((t) => t.id !== id));
      toast.success("Tier list deleted");
    } catch (error) {
      toast.error("Failed to delete tier list");
    }
  };

  const handlePublicChange = async (id: string, isPublic: boolean) => {
    try {
      if (!isAuthenticated && id.startsWith("local-")) {
        // Update in localStorage (but can't make public without auth)
        if (!isPublic && typeof window !== "undefined") {
          const localTierListsData = localStorage.getItem("vtierlists");
          if (localTierListsData) {
            try {
              const localTierLists = JSON.parse(localTierListsData);
              if (Array.isArray(localTierLists)) {
                const updated = localTierLists.map((t: any) =>
                  t.id === id ? { ...t, isPublic: false } : t
                );
                localStorage.setItem("vtierlists", JSON.stringify(updated));
                setTierLists((prev) =>
                  prev.map((t) => (t.id === id ? { ...t, isPublic: false } : t))
                );
                toast.success("Tier list is now private");
                return;
              }
            } catch (error) {
              console.error("Failed to parse local tier lists:", error);
            }
          }
        }
        toast.error("Please sign in to publish tier lists");
        return;
      }

      const response = await fetch(`/api/tier-lists/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic }),
      });

      if (!response.ok) throw new Error("Failed to update tier list");

      setTierLists((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isPublic } : t))
      );
      toast.success(isPublic ? "Tier list is now public" : "Tier list is now private");
    } catch (error) {
      toast.error("Failed to update tier list");
    }
  };

  if (loading || authLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card
            key={index}
            className="bg-gradient-to-br from-black/90 via-zinc-900/80 to-black/90 border border-white/10 overflow-hidden h-full flex flex-col"
          >
            <CardContent className="p-4 relative flex flex-col flex-1">
              {/* Top right corner - Action buttons skeleton */}
              <div className="absolute top-1 right-1 flex gap-2 z-10">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="w-8 h-8 rounded-full" />
              </div>

              {/* Header skeleton */}
              <div className="flex items-start justify-between mb-4 pr-12">
                <div className="flex-1 min-w-0">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>

              {/* Tier Preview skeleton */}
              <div className="space-y-2 mb-4 flex-1">
                {["S", "A", "B", "C", "D"].map((tierKey, tierIndex) => (
                  <div key={tierKey} className="flex items-stretch gap-1">
                    <Skeleton className="w-8 h-8 rounded-l" />
                    <div className="flex-1 min-h-[32px] rounded-r border border-white/10 bg-black/40 px-1.5 py-1 flex flex-wrap gap-1 items-center">
                      {Array.from({ length: (tierIndex % 3) + 2 }).map(
                        (_, i) => (
                          <Skeleton key={i} className="w-6 h-6 rounded" />
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {tierLists.length !== 0 && (
            <motion.div variants={scaleIn} className="h-full">
              <button
                onClick={handleCreate}
                disabled={isCreating}
                className="w-full h-full"
              >
                <Card className="bg-black/80 backdrop-blur-sm rounded-lg border-2 border-dashed border-white/30 hover:border-white/60 transition-all duration-300 overflow-hidden group cursor-pointer h-full relative flex items-center justify-center">
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/10" />
                  </div>

                  <div className="flex flex-col items-center justify-center gap-4 p-8 relative z-10">
                    {/* Plus icon in circle */}
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/40 flex items-center justify-center group-hover:border-white/60 transition-colors duration-300">
                      {isCreating ? (
                        <Loader2 className="w-8 h-8 text-white/60 group-hover:text-white animate-spin transition-all duration-300" />
                      ) : (
                        <Plus className="w-8 h-8 text-white/60 group-hover:text-white group-hover:rotate-90 transition-all duration-300" />
                      )}
                    </div>

                    {/* Text */}
                    <span className="text-white/60 group-hover:text-white font-bold text-lg tracking-wide transition-colors duration-300 uppercase">
                      {isCreating ? "Creating..." : "Create A New Tier List"}
                    </span>
                  </div>
                </Card>
              </button>
            </motion.div>
          )}
          {tierLists.map((tierList) => (
            <motion.div key={tierList.id} variants={scaleIn} className="h-full">
              <Link href={`/tier-list/${tierList.id}`} className="h-full block">
                <TierListCard
                  id={tierList.id}
                  name={tierList.name}
                  tiers={tierList.tiers}
                  isPublic={tierList.isPublic}
                  showPublicToggle={true}
                  onPublicChange={(isPublic) => handlePublicChange(tierList.id, isPublic)}
                  upvotes={tierList.upvotes}
                  downvotes={tierList.downvotes}
                  onDelete={() => handleDelete(tierList.id)}
                />
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {!loading && tierLists.length === 0 && (
          <motion.div
            className="flex justify-start"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={scaleIn}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleCreate}
                  disabled={isCreating}
                  className="w-full max-w-md"
                >
                  <Card className="text-card-foreground shadow-sm bg-black/80 backdrop-blur-sm rounded-lg border-2 border-dashed border-white/30 hover:border-white/60 transition-all duration-300 overflow-hidden group cursor-pointer h-full relative flex items-center justify-center min-h-[400px] w-full">
                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/10" />
                    </div>

                    <div className="flex flex-col items-center justify-center gap-4 p-8 relative z-10">
                      {/* Plus icon in circle */}
                      <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/40 flex items-center justify-center group-hover:border-white/60 transition-colors duration-300">
                        {isCreating ? (
                          <Loader2 className="w-8 h-8 text-white/60 group-hover:text-white animate-spin transition-all duration-300" />
                        ) : (
                          <Plus className="w-8 h-8 text-white/60 group-hover:text-white group-hover:rotate-90 transition-all duration-300" />
                        )}
                      </div>

                      {/* Text */}
                      <span className="text-white/60 group-hover:text-white font-bold text-lg tracking-wide transition-colors duration-300 uppercase">
                        {isCreating ? "Creating..." : "Create A New Tier List"}
                      </span>
                    </div>
                  </Card>
                </button>
              </TooltipTrigger>
              {!isAuthenticated && (
                <TooltipContent>
                  <p>Sign in to publish your tier lists</p>
                </TooltipContent>
              )}
            </Tooltip>
          </motion.div>
        )}
      </div>
    </TooltipProvider>
  );
}

