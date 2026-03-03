"use client";

import { useEffect, useState, useMemo, useRef, use } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AnimatePresence } from "framer-motion";
import { ActionPopup, ActionPopupType } from "@/components/builds/ActionPopup";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowLeft, Loader2, Pencil, Check, X, Share2, Copy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import spellsData from "@/data/vbuilds/spells.json";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";

type TierKey = "S" | "A" | "B" | "C" | "D" | "Unranked";

type TierState = {
  [key in TierKey]: string[];
};

type SpellEntry = {
  id: string;
  name: string;
  img: string;
};

const tierLabels: { key: TierKey; label: string; color: string }[] = [
  { key: "S", label: "S", color: "from-rose-600 to-red-500" },
  { key: "A", label: "A", color: "from-orange-500 to-amber-400" },
  { key: "B", label: "B", color: "from-yellow-500 to-lime-400" },
  { key: "C", label: "C", color: "from-emerald-500 to-teal-400" },
  { key: "D", label: "D", color: "from-sky-500 to-blue-500" },
  { key: "Unranked", label: "Unranked", color: "from-slate-600 to-slate-500" },
];

function createDefaultTiers(allSpellIds: string[]): TierState {
  return {
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
    Unranked: allSpellIds,
  };
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TierListEditPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const boardRef = useRef<HTMLDivElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSpell, setActiveSpell] = useState<SpellEntry | null>(null);
  const [actionPopup, setActionPopup] = useState<{ type: ActionPopupType; message: string } | null>(null);

  const showActionPopup = (type: ActionPopupType, message: string) => {
    setActionPopup({ type, message });
    setTimeout(() => setActionPopup(null), 3000);
  };
  const [tierListData, setTierListData] = useState<{
    id: string;
    name: string;
    isPublic: boolean;
    upvotes: number;
    downvotes: number;
    userVote: "upvote" | "downvote" | null;
    author: string;
    userId: string | null;
    isOwner: boolean;
  } | null>(null);

  const allSpells: SpellEntry[] = useMemo(() => {
    return Object.values(spellsData as Record<string, any>)
      .filter((spell) => ["spell", "ultimate", "veil"].includes(spell.category))
      .map((spell) => ({
        id: spell.id as string,
        name: spell.name as string,
        img: spell.img as string,
      }));
  }, []);

  const allSpellIds = useMemo(() => allSpells.map((s) => s.id), [allSpells]);

  const [tiers, setTiers] = useState<TierState>(() => createDefaultTiers(allSpellIds));
  const [isPublic, setIsPublic] = useState(false);
  const [name, setName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");

  useEffect(() => {
    if (!authLoading) {
      fetchTierList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isAuthenticated, authLoading]);

  const fetchTierList = async () => {
    setLoading(true);
    try {
      // Check if this is a local tier list (ID starts with "local-")
      if (id.startsWith("local-") && typeof window !== "undefined") {
        const localTierListsData = localStorage.getItem("vtierlists");
        if (localTierListsData) {
          try {
            const localTierLists = JSON.parse(localTierListsData);
            if (Array.isArray(localTierLists)) {
              const foundTierList = localTierLists.find((t: any) => t.id === id);
              if (foundTierList) {
                // Found in localStorage
                setTierListData({
                  id: foundTierList.id,
                  name: foundTierList.name,
                  isPublic: false,
                  upvotes: 0,
                  downvotes: 0,
                  userVote: null,
                  author: "You",
                  userId: null,
                  isOwner: true,
                });
                setName(foundTierList.name);
                setIsPublic(false);

                // Process tiers
                const base = createDefaultTiers(allSpellIds);
                const used = new Set<string>();
                const tierData = foundTierList.tiers as TierState;

                if (tierData) {
                  (Object.keys(base) as TierKey[]).forEach((tierKey) => {
                    const source = tierData[tierKey] || [];
                    base[tierKey] = source.filter((spellId: string) => {
                      if (!allSpellIds.includes(spellId)) return false;
                      if (used.has(spellId)) return false;
                      used.add(spellId);
                      return true;
                    });
                  });
                  const missing = allSpellIds.filter((spellId) => !used.has(spellId));
                  base.Unranked = [...base.Unranked, ...missing];
                }

                setTiers(base);
                setLoading(false);
                return;
              }
            }
          } catch (error) {
            console.error("Error loading from localStorage:", error);
          }
        }
        // If local tier list not found in localStorage, redirect
        toast.error("Tier list not found");
        router.push("/tier-list");
        setLoading(false);
        return;
      }

      // Try to fetch from API (works for both authenticated and unauthenticated users for public tier lists)
      const response = await fetch(`/api/tier-lists/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Tier list not found");
          router.push("/tier-list");
          return;
        }
        throw new Error("Failed to load tier list");
      }

      const data = await response.json();
      setTierListData({
        id: data.id,
        name: data.name,
        isPublic: data.isPublic,
        upvotes: data.upvotes,
        downvotes: data.downvotes,
        userVote: data.userVote,
        author: data.author,
        userId: data.userId,
        isOwner: data.isOwner,
      });
      setName(data.name);
      setIsPublic(data.isPublic);

      // Process tiers
      const base = createDefaultTiers(allSpellIds);
      const used = new Set<string>();
      const tierData = data.tiers as TierState;

      if (tierData) {
        (Object.keys(base) as TierKey[]).forEach((tierKey) => {
          const source = tierData[tierKey] || [];
          base[tierKey] = source.filter((spellId: string) => {
            if (!allSpellIds.includes(spellId)) return false;
            if (used.has(spellId)) return false;
            used.add(spellId);
            return true;
          });
        });
        const missing = allSpellIds.filter((spellId) => !used.has(spellId));
        base.Unranked = [...base.Unranked, ...missing];
      }

      setTiers(base);
    } catch (error) {
      console.error("Error loading tier list:", error);
      toast.error("Failed to load tier list");
      router.push("/tier-list");
    } finally {
      setLoading(false);
    }
  };

  const getSpell = (spellId: string) => allSpells.find((s) => s.id === spellId);

  const handleDragStart = (event: DragStartEvent) => {
    const spell = getSpell(event.active.id as string);
    setActiveSpell(spell ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveSpell(null);
    if (!tierListData?.isOwner && !(!isAuthenticated && id.startsWith("local-"))) return;

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Source tier: find which tier currently holds the dragged spell
    const sourceTier = (Object.keys(tiers) as TierKey[]).find((k) =>
      tiers[k].includes(activeId)
    );
    if (!sourceTier) return;

    // Target tier: either from a droppable container or from a sortable spell's data
    const targetTier = over.data.current?.tierKey as TierKey | undefined;
    if (!targetTier) return;

    setTiers((prev) => {
      const next: TierState = { S: [...prev.S], A: [...prev.A], B: [...prev.B], C: [...prev.C], D: [...prev.D], Unranked: [...prev.Unranked] };

      if (sourceTier === targetTier) {
        // Reorder within same tier
        const oldIndex = prev[sourceTier].indexOf(activeId);
        const overIndex = prev[targetTier].indexOf(overId);
        if (oldIndex !== -1 && overIndex !== -1 && oldIndex !== overIndex) {
          next[sourceTier] = arrayMove(prev[sourceTier], oldIndex, overIndex);
        }
      } else {
        // Move between tiers: remove from source, insert at target position
        next[sourceTier] = prev[sourceTier].filter((i) => i !== activeId);
        const overIndex = prev[targetTier].indexOf(overId);
        if (overIndex !== -1) {
          const arr = [...prev[targetTier]];
          arr.splice(overIndex, 0, activeId);
          next[targetTier] = arr;
        } else {
          next[targetTier] = [...prev[targetTier], activeId];
        }
      }

      return next;
    });
  };

  const saveToLocalStorage = (tierListName: string, tierListTiers: TierState, tierListId: string) => {
    if (typeof window === "undefined") return false;

    try {
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

      const existingIndex = localTierLists.findIndex((t: any) => t.id === tierListId);

      const tierListData = {
        id: tierListId,
        name: tierListName,
        tiers: tierListTiers,
        isPublic: false,
        timestamp: new Date().toISOString(),
      };

      if (existingIndex !== -1) {
        localTierLists[existingIndex] = tierListData;
      } else {
        localTierLists.push(tierListData);
      }

      localStorage.setItem("vtierlists", JSON.stringify(localTierLists));
      return true;
    } catch (error) {
      console.error("Error saving tier list to localStorage:", error);
      return false;
    }
  };

  const handleSave = async () => {
    if ((!tierListData?.isOwner && !(!isAuthenticated && id.startsWith("local-"))) || saving) return;
    setSaving(true);
    try {
      if (!isAuthenticated && id.startsWith("local-")) {
        // Save to localStorage for non-authenticated users
        const saved = saveToLocalStorage(name, tiers, id);
        if (saved) {
          showActionPopup("success", "Tier list saved locally! Sign in to sync across devices.");
          setTimeout(() => {
            router.push("/tier-list");
          }, 1500);
        } else {
          toast.error("Failed to save tier list locally");
        }
        setSaving(false);
        return;
      }

      const response = await fetch(`/api/tier-lists/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          tiers,
          isPublic,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save tier list");
      }

      showActionPopup("success", "Tier list saved!");
      // Redirect to tier list page after saving
      setTimeout(() => {
        router.push("/tier-list");
      }, 1500);
    } catch (error: any) {
      toast.error(error.message || "Failed to save tier list");
    } finally {
      setSaving(false);
    }
  };

  const handleNameSave = async () => {
    if (!editedName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    const newName = editedName.trim();
    setName(newName);
    setIsEditingName(false);

    // Save the name change immediately
    try {
      if (!isAuthenticated && id.startsWith("local-")) {
        // Save to localStorage
        const saved = saveToLocalStorage(newName, tiers, id);
        if (!saved) {
          throw new Error("Failed to save name");
        }
        return;
      }

      const response = await fetch(`/api/tier-lists/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save name");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save name");
      // Revert name on error
      setName(name);
    }
  };


  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      showActionPopup("copy", "Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleClone = async () => {
    if (authLoading) {
      return;
    }

    const tierListName = name.trim() || "Tier List Name";

    // Generate cloned name with version number (v2, v3, etc.)
    let clonedName: string;
    const versionPattern = /\s+v(\d+)$/i;
    const match = tierListName.match(versionPattern);

    if (match) {
      // Name ends with version, increment it
      const currentVersion = parseInt(match[1], 10);
      const nextVersion = currentVersion + 1;
      const baseName = tierListName.substring(0, match.index).trim();
      clonedName = `${baseName} v${nextVersion}`;
    } else {
      // Name doesn't have version, add v2
      clonedName = `${tierListName} v2`;
    }

    // Validate cloned name length
    if (clonedName.length > 100) {
      const maxBaseLength = 100 - 4; // Reserve space for " v2" (4 chars)
      const baseName = tierListName.replace(/\s+v(\d+)$/i, "").trim();
      const truncatedBase = baseName.substring(0, maxBaseLength).trim();
      const versionMatch = tierListName.match(versionPattern);
      if (versionMatch) {
        const currentVersion = parseInt(versionMatch[1], 10);
        const nextVersion = currentVersion + 1;
        clonedName = `${truncatedBase} v${nextVersion}`;
      } else {
        clonedName = `${truncatedBase} v2`;
      }
    }

    // Clone the tiers
    const clonedTiers = { ...tiers };

    // If not authenticated, save to localStorage
    if (!isAuthenticated) {
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
          name: clonedName,
          tiers: clonedTiers,
          isPublic: false,
          timestamp: new Date().toISOString(),
        };

        localTierLists.push(newTierList);
        localStorage.setItem("vtierlists", JSON.stringify(localTierLists));

        showActionPopup("clone", "Tier list cloned locally! Sign in to sync across devices.");
        setTimeout(() => {
          router.push(`/tier-list/${newTierList.id}`);
        }, 1500);
      }
      return;
    }

    // For authenticated users, create via API
    try {
      const response = await fetch("/api/tier-lists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: clonedName,
          tiers: clonedTiers,
          isPublic: false, // Cloned tier lists start as private
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        const errorMessage = error.error || "Failed to clone tier list";
        toast.error(errorMessage);
        return;
      }

      const clonedTierList = await response.json();
      showActionPopup("clone", "Tier list cloned successfully!");
      setTimeout(() => {
        router.push(`/tier-list/${clonedTierList.id}`);
      }, 1500);
    } catch (error) {
      console.error("Error cloning tier list:", error);
      toast.error("Failed to clone tier list");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <NavBar />
        <section className="relative pt-24 pb-20 md:pt-32 md:pb-32 overflow-hidden bg-gradient-to-b from-black to-black">
          <div className="container mx-auto px-4 relative z-10">
            {/* Back button skeleton */}
            <div className="mb-6">
              <Skeleton className="h-6 w-32" />
            </div>

            {/* Header skeleton */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div className="flex-1">
                <Skeleton className="h-10 w-64 mb-2" />
                <Skeleton className="h-5 w-48" />
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">

                {/* Action buttons skeleton */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>
            </div>

            {/* Tier Board skeleton */}
            <div className="space-y-2">
              {tierLabels.map((tier, index) => (
                <div key={tier.key} className="flex items-stretch gap-2">
                  {tier.key !== "Unranked" && (
                    <Skeleton className="w-16 md:w-20 h-20 rounded-l-md" />
                  )}
                  <div
                    className={`flex-1 min-h-[72px] ${tier.key === "Unranked" ? "rounded-md" : "rounded-r-md"
                      } border border-white/10 bg-black/60 px-2 py-2 md:px-3 md:py-3 flex flex-wrap gap-2 items-center`}
                  >
                    {Array.from({ length: (index % 4) + 3 }).map((_, i) => (
                      <Skeleton key={i} className="w-12 h-12 md:w-14 md:h-14 rounded-md" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!tierListData) {
    return null;
  }

  const isOwner = tierListData.isOwner || (!isAuthenticated && id.startsWith("local-"));

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-black text-white">
        <NavBar />
        <section className="relative pt-24 pb-20 md:pt-32 md:pb-32 overflow-hidden bg-gradient-to-b from-black to-black">
          <div className="container mx-auto px-4 relative z-10">
            {/* Back button */}
            <Link
              href="/tier-list"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Tier Lists</span>
            </Link>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div className="flex-1">
                {isEditingName && isOwner ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleNameSave();
                        if (e.key === "Escape") {
                          setIsEditingName(false);
                          setEditedName(name);
                        }
                      }}
                      className="text-2xl font-bold bg-black/50 border-white/20 text-white h-12 max-w-md"
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleNameSave}
                      className="text-green-400 hover:text-green-300 hover:bg-green-400/10"
                    >
                      <Check className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setIsEditingName(false);
                        setEditedName(name);
                      }}
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-white">{name}</h1>
                    {isOwner && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditedName(name);
                          setIsEditingName(true);
                        }}
                        className="text-gray-400 hover:text-white hover:bg-white/10"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                )}
                {!isOwner && (
                  <p className="text-gray-400 text-sm mt-1">
                    Created by <span className="font-semibold text-white">{tierListData.author}</span>
                  </p>
                )}
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">


                <div className="flex items-center gap-2">
                  {tierListData.isPublic && (
                    <Button
                      variant="outline"
                      onClick={handleShare}
                      className="border-white/30 text-white bg-transparent hover:bg-white/10"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  )}
                  {isOwner && (
                    <>
                      <Button
                        onClick={handleClone}
                        variant="outline"
                        className="border-white/30 text-white bg-transparent hover:bg-white/10"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Clone
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-red-700 hover:bg-red-600 text-white"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save"
                        )}
                      </Button>
                    </>
                  )}
                  {!isOwner && (
                    <Button
                      onClick={handleClone}
                      variant="outline"
                      className="border-white/30 text-white bg-transparent hover:bg-white/10"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Clone
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Tier Board */}
            <DndContext
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="space-y-2" ref={boardRef}>
                {tierLabels.map((tier) => (
                  <TierRow
                    key={tier.key}
                    tierKey={tier.key}
                    label={tier.label}
                    colorClass={tier.color}
                    spellIds={tiers[tier.key]}
                    getSpell={getSpell}
                    readOnly={!isOwner}
                  />
                ))}
              </div>
              <DragOverlay>
                {activeSpell ? (
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-md overflow-hidden border border-white/30 shadow-xl shadow-black/80 bg-black/80 opacity-90 rotate-3 scale-110">
                    <img
                      src={activeSpell.img}
                      alt={activeSpell.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </section>
      </div>
      {/* Action popup */}
      <AnimatePresence>
        {actionPopup && (
          <ActionPopup
            type={actionPopup.type}
            message={actionPopup.message}
            onClose={() => setActionPopup(null)}
          />
        )}
      </AnimatePresence>
    </TooltipProvider>
  );
}

interface TierRowProps {
  tierKey: TierKey;
  label: string;
  colorClass: string;
  spellIds: string[];
  getSpell: (id: string) => SpellEntry | undefined;
  readOnly: boolean;
}

function TierRow({
  tierKey,
  label,
  colorClass,
  spellIds,
  getSpell,
  readOnly,
}: TierRowProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `drop-${tierKey}`,
    data: { tierKey },
  });
  const isUnranked = tierKey === "Unranked";

  return (
    <div className={`flex items-stretch ${isUnranked ? "" : "gap-2"}`}>
      {!isUnranked && (
        <div
          className={`w-16 md:w-20 flex items-center justify-center rounded-l-md bg-gradient-to-r ${colorClass} text-black font-extrabold text-xl md:text-2xl`}
        >
          {label}
        </div>
      )}
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-[72px] ${isUnranked ? "rounded-md" : "rounded-r-md"
          } border border-white/10 bg-black/60 px-2 py-2 md:px-3 md:py-3 flex flex-wrap gap-2 items-center ${isOver ? "ring-2 ring-red-500/70" : ""
          }`}
      >
        {spellIds.length === 0 && (
          <span className="text-xs text-gray-500">
            {readOnly
              ? "No spells in this tier."
              : "Drag spells here to place them in this tier."}
          </span>
        )}
        <SortableContext items={spellIds} strategy={rectSortingStrategy}>
          {spellIds.map((spellId) => {
            const spell = getSpell(spellId);
            if (!spell) return null;
            return <SpellIcon key={spell.id} spell={spell} tierKey={tierKey} disabled={readOnly} />;
          })}
        </SortableContext>
      </div>
    </div>
  );
}

interface SpellIconProps {
  spell: SpellEntry;
  tierKey: TierKey;
  disabled?: boolean;
}

function SpellIcon({ spell, tierKey, disabled }: SpellIconProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: spell.id,
    data: { tierKey },
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 20 : 1,
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          ref={setNodeRef}
          style={style}
          {...listeners}
          {...attributes}
          type="button"
          className={`relative w-12 h-12 md:w-14 md:h-14 rounded-md overflow-hidden border border-white/10 shadow-md shadow-black/60 bg-black/80 ${disabled ? "cursor-default" : "cursor-grab active:cursor-grabbing"
            }`}
        >
          <img
            src={spell.img}
            alt={spell.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="bg-black/80 border border-white/10">{spell.name}</TooltipContent>
    </Tooltip>
  );
}

