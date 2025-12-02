"use client";

import { useEffect, useState, useMemo, useRef, use } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toJpeg } from "html-to-image";
import { ArrowLeft, Loader2, Pencil, Check, X, Share2, Copy } from "lucide-react";
import spellsData from "@/data/vbuilds/spells.json";
import { TierListVoteButtons } from "@/components/tier-list/TierListVoteButtons";
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
      // Check if this is a local tier list (not authenticated or ID starts with "local-")
      if ((!isAuthenticated || id.startsWith("local-")) && typeof window !== "undefined") {
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

        // If not found in localStorage and not authenticated, redirect
        if (!isAuthenticated) {
          toast.error("Tier list not found");
          router.push("/tier-list");
          setLoading(false);
          return;
        }
      }

      // Try to fetch from API
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

  const handleDragEnd = (event: DragEndEvent) => {
    if (!tierListData?.isOwner && !(!isAuthenticated && id.startsWith("local-"))) return;

    const { active, over } = event;
    if (!over) return;

    const spellId = active.id as string;
    const targetTier = over.data.current?.tierKey as TierKey | undefined;

    if (!targetTier || !spellId) return;

    setTiers((prev) => {
      const next: TierState = {
        S: [],
        A: [],
        B: [],
        C: [],
        D: [],
        Unranked: [],
      };

      (Object.keys(prev) as TierKey[]).forEach((tierKey) => {
        next[tierKey] = prev[tierKey].filter((i) => i !== spellId);
      });

      next[targetTier] = [...next[targetTier], spellId];

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
          toast.success("Tier list saved locally! Sign in to sync across devices.", {
            duration: 4000,
          });
          setTimeout(() => {
            router.push("/tier-list");
          }, 500);
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

      toast.success("Tier list saved!");
      // Redirect to tier list page after saving
      router.push("/tier-list");
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

  const handleExportImage = async () => {
    if (!boardRef.current) {
      toast.error("Could not find tier list to export");
      return;
    }

    try {
      const dataUrl = await toJpeg(boardRef.current, {
        quality: 0.95,
        backgroundColor: "#000000",
      });

      const supportsClipboard =
        typeof navigator !== "undefined" &&
        !!navigator.clipboard &&
        typeof window !== "undefined" &&
        "ClipboardItem" in window;

      if (supportsClipboard) {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const clipboardItem = new (window as any).ClipboardItem({
          [blob.type]: blob,
        });
        await (navigator.clipboard as any).write([clipboardItem]);
        toast.success("Tier list image copied to clipboard!");
        return;
      }

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${name || "tier-list"}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Tier list exported as JPEG!");
    } catch (error) {
      console.error("Error exporting tier list image:", error);
      toast.error("Failed to export tier list image");
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
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

        toast.success("Tier list cloned locally! Sign in to sync across devices.", {
          duration: 4000,
        });
        setTimeout(() => {
          router.push(`/tier-list/${newTierList.id}`);
        }, 500);
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
      toast.success("Tier list cloned successfully!");
      setTimeout(() => {
        router.push(`/tier-list/${clonedTierList.id}`);
      }, 500);
    } catch (error) {
      console.error("Error cloning tier list:", error);
      toast.error("Failed to clone tier list");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <NavBar />
        <div className="flex items-center justify-center pt-32">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
        </div>
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
                {/* Vote buttons for non-owners */}
                {!isOwner && tierListData.isPublic && (
                  <TierListVoteButtons
                    tierListId={tierListData.id}
                    initialUpvotes={tierListData.upvotes}
                    initialDownvotes={tierListData.downvotes}
                    initialUserVote={tierListData.userVote}
                    onVoteChange={(upvotes, downvotes, userVote) => {
                      setTierListData((prev) =>
                        prev ? { ...prev, upvotes, downvotes, userVote } : prev
                      );
                    }}
                  />
                )}

                {/* Share button */}
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

                <div className="flex items-center gap-2">
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleExportImage}
                    className="border-white/30 text-white bg-transparent hover:bg-white/10"
                  >
                    Export Image
                  </Button>
                </div>
              </div>
            </div>

            {/* Tier Board */}
            <DndContext onDragEnd={handleDragEnd}>
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
            </DndContext>
          </div>
        </section>
      </div>
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
        className={`flex-1 min-h-[72px] ${
          isUnranked ? "rounded-md" : "rounded-r-md"
        } border border-white/10 bg-black/60 px-2 py-2 md:px-3 md:py-3 flex flex-wrap gap-2 items-center ${
          isOver ? "ring-2 ring-red-500/70" : ""
        }`}
      >
        {spellIds.length === 0 && (
          <span className="text-xs text-gray-500">
            {readOnly
              ? "No spells in this tier."
              : "Drag spells here to place them in this tier."}
          </span>
        )}
        {spellIds.map((spellId) => {
          const spell = getSpell(spellId);
          if (!spell) return null;
          return <SpellIcon key={spell.id} spell={spell} disabled={readOnly} />;
        })}
      </div>
    </div>
  );
}

interface SpellIconProps {
  spell: SpellEntry;
  disabled?: boolean;
}

function SpellIcon({ spell, disabled }: SpellIconProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: spell.id,
      disabled,
    });

  const style = {
    transform: transform ? CSS.Translate.toString(transform) : undefined,
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
          className={`relative w-12 h-12 md:w-14 md:h-14 rounded-md overflow-hidden border border-white/30 shadow-md shadow-black/60 bg-black/80 ${
            disabled ? "cursor-default" : "cursor-grab active:cursor-grabbing"
          }`}
        >
          <img
            src={spell.img}
            alt={spell.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">{spell.name}</TooltipContent>
    </Tooltip>
  );
}

