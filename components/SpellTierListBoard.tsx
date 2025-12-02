"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import spellsData from "@/data/vbuilds/spells.json";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toJpeg } from "html-to-image";

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

interface SpellTierListBoardProps {
  initialTiers?: TierState | null;
  initialIsPublic?: boolean;
  readOnly?: boolean;
  ownerName?: string | null;
  shareUrl?: string | null;
}

export function SpellTierListBoard({
  initialTiers,
  initialIsPublic = false,
  readOnly = false,
  ownerName,
  shareUrl,
}: SpellTierListBoardProps) {
  const allSpells: SpellEntry[] = useMemo(() => {
    return Object.values(spellsData as Record<string, any>)
      .filter((spell) => ["spell", "ultimate", "veil"].includes(spell.category))
      .map((spell) => ({
        id: spell.id as string,
        name: spell.name as string,
        img: spell.img as string,
      }));
  }, []);

  const allSpellIds = useMemo(
    () => allSpells.map((s) => s.id),
    [allSpells]
  );

  const boardRef = useRef<HTMLDivElement | null>(null);

  const [tiers, setTiers] = useState<TierState>(() => {
    if (initialTiers) {
      // Ensure all tiers exist and no unknown ids sneak in
      const base = createDefaultTiers(allSpellIds);
      const used = new Set<string>();
      (Object.keys(base) as TierKey[]).forEach((tierKey) => {
        const source = initialTiers[tierKey] || [];
        base[tierKey] = source.filter((id) => {
          if (!allSpellIds.includes(id)) return false;
          if (used.has(id)) return false;
          used.add(id);
          return true;
        });
      });
      // Put any missing spells into Unranked
      const missing = allSpellIds.filter((id) => !used.has(id));
      base.Unranked = [...base.Unranked, ...missing];
      return base;
    }
    return createDefaultTiers(allSpellIds);
  });

  const [isPublic, setIsPublic] = useState<boolean>(!!initialIsPublic);
  const [isSaving, setIsSaving] = useState(false);

  // Keep local state in sync if server sends updated data (e.g. refresh)
  useEffect(() => {
    if (!initialTiers) return;
    const base = createDefaultTiers(allSpellIds);
    const used = new Set<string>();
    (Object.keys(base) as TierKey[]).forEach((tierKey) => {
      const source = initialTiers[tierKey] || [];
      base[tierKey] = source.filter((id) => {
        if (!allSpellIds.includes(id)) return false;
        if (used.has(id)) return false;
        used.add(id);
        return true;
      });
    });
    const missing = allSpellIds.filter((id) => !used.has(id));
    base.Unranked = [...base.Unranked, ...missing];
    setTiers(base);
  }, [initialTiers, allSpellIds]);

  useEffect(() => {
    setIsPublic(!!initialIsPublic);
  }, [initialIsPublic]);

  const getSpell = (id: string) => allSpells.find((s) => s.id === id);

  const handleDragEnd = (event: DragEndEvent) => {
    if (readOnly) return;
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

      // Remove spell from all tiers first
      (Object.keys(prev) as TierKey[]).forEach((tierKey) => {
        next[tierKey] = prev[tierKey].filter((id) => id !== spellId);
      });

      // Add to target tier at the end
      next[targetTier] = [...next[targetTier], spellId];

      return next;
    });
  };

  const handleSave = async () => {
    if (readOnly || isSaving) return;
    setIsSaving(true);
    try {
      const response = await fetch("/api/spell-tierlist", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tiers,
          isPublic,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const message = data?.error || "Failed to save tier list";
        toast.error(message);
        setIsSaving(false);
        return;
      }

      toast.success("Spell tier list saved!");
    } catch (error) {
      console.error("Error saving tier list", error);
      toast.error("Failed to save tier list");
    } finally {
      setIsSaving(false);
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

      // Try copy to clipboard first (where supported)
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

      // Fallback: trigger download
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "spell-tier-list.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Tier list exported as JPEG!");
    } catch (error) {
      console.error("Error exporting tier list image:", error);
      toast.error("Failed to export tier list image");
    }
  };

  return (
    <TooltipProvider>
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Spell Tier List</h2>
          {ownerName && (
            <p className="text-sm text-gray-400">
              Created by <span className="font-semibold text-white">{ownerName}</span>
            </p>
          )}
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          {!readOnly && (
            <div className="flex items-center gap-3">
              <Switch
                id="spell-tierlist-public"
                checked={isPublic}
                onCheckedChange={(value) => setIsPublic(value)}
              />
              <Label
                htmlFor="spell-tierlist-public"
                className="text-sm text-gray-300 cursor-pointer"
              >
                Make this tier list public
              </Label>
            </div>
          )}
          {shareUrl && isPublic && (
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(shareUrl);
                  toast.success("Public URL copied to clipboard!");
                } catch {
                  toast.error("Failed to copy link");
                }
              }}
              className="text-xs px-3 py-2 rounded-md border border-white/20 text-white bg-white/5 hover:bg-white/10 transition-colors"
            >
              Copy public URL
            </button>
          )}
          <div className="flex items-center gap-2">
            {!readOnly && (
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-red-700 hover:bg-red-600 text-white"
              >
                {isSaving ? "Saving..." : "Save Tier List"}
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={handleExportImage}
              className="border-white/30 text-white bg-transparent hover:bg-white/10"
            >
              Export JPEG
            </Button>
          </div>
        </div>
      </div>

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
              readOnly={readOnly}
            />
          ))}
        </div>
      </DndContext>
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
        {spellIds.map((id) => {
          const spell = getSpell(id);
          if (!spell) return null;
          return (
            <SpellIcon
              key={spell.id}
              spell={spell}
              disabled={readOnly}
            />
          );
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
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
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
      <TooltipContent side="top">
        {spell.name}
      </TooltipContent>
    </Tooltip>
  );
}


