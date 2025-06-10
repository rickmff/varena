import { useEffect, useState, useRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "../ui/button";
import { Check } from "lucide-react";

export type Spell = {
  id: string;
  name: string;
  img: string;
  effects: Array<{
    key: number;
    description: string;
    min: number | null;
    max: number | null;
  }>;
  spellSchool: "storm" | "chaos" | "frost" | "blood" | "unholy" | "illusion";
};

export type SpellWithJewel = {
  jewel?: number[];
} & Spell;

export type AddSpell = {
  spell: Spell;
};

export type AddSpellWithJewel = {
  jewel?: number[];
} & AddSpell;

export const JewelForge = ({
  spell,
  selectedJewelEffects = [],
  onAdd,
}: {
  spell: Spell;
  selectedJewelEffects?: number[];
  onAdd: (params: AddSpellWithJewel) => void;
}) => {
  const [selectedEffects, setSelectedEffects] = useState<number[]>(
    () => selectedJewelEffects || []
  );

  const prevSpellIdRef = useRef<String>(spell.id);

  // Reset selected effects when spell changes
  useEffect(() => {
    // Only reset if the spell ID actually changed
    if (prevSpellIdRef.current !== spell.id) {
      setSelectedEffects([]);
      prevSpellIdRef.current = spell.id;
    }
  }, [spell.id]);

  const toggleEffectSelection = (key: number) => {
    setSelectedEffects((prev) => {
      if (prev.includes(key)) {
        return prev.filter((effectKey) => effectKey !== key);
      } else if (prev.length < 4) {
        return [...prev, key];
      }
      return prev;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center py-4">
        <div className="flex gap-4 justify-start items-center">
          <img
            src={`/images/vbuilds/jewels/jewel-${spell.spellSchool}_tier4.webp`}
            className="w-12 h-12"
          />

          <h3 className="text-lg font-semibold text-red-400 flex justifty-between items-center">
            <span className="mr-2">Create Jewel</span>
          </h3>
        </div>
        <div>
          <div
            className={`${
              selectedEffects.length === 4
                ? "bg-green-500/20 text-green-400"
                : "bg-yellow-500/20 text-yellow-400"
            } text-xs px-2 py-1 rounded-full`}
          >
            Choose 4 Effects
          </div>
        </div>
      </div>
      <ul className="space-y-4">
        {spell.effects.map((effect) => {
          if (selectedEffects.includes(effect.key)) {
            return (
              <div
                className="bg-green-900/20 border border-green-900/30 p-2 rounded-md cursor-pointer"
                onClick={() => toggleEffectSelection(effect.key)}
                key={effect.key}
              >
                <div className="flex items-center">
                  <div className="bg-green-500/20 text-green-300 text-xs p-1.5 rounded-full mr-2">
                    <Check className="w-2 h-2" />
                  </div>
                  <p className="text-xs text-white">{effect.description}</p>
                </div>
              </div>
            );
          }

          return (
            <div key={effect.key}>
              <div
                className={`flex items-center p-2 rounded-md transition-all cursor-pointer ${
                  selectedEffects.includes(effect.key)
                    ? "bg-red-900/50 border border-red-500/50"
                    : "bg-black/30 border border-red-900/30 hover:bg-black/40"
                } ${
                  selectedEffects.length >= 4
                    ? "cursor-not-allowed opacity-30"
                    : ""
                }`}
                onClick={() => toggleEffectSelection(effect.key)}
              >
                <div
                  className={`flex-shrink-0 w-5 h-5 rounded-full mr-2 flex items-center justify-center border ${
                    selectedEffects.includes(effect.key)
                      ? "bg-red-500/50 border-red-400"
                      : "bg-black/50 border-gray-600"
                  }`}
                >
                  {selectedEffects.includes(effect.key) && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-2 w-2 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <p className="text-xs text-white">{effect.description}</p>
              </div>
            </div>
          );
        })}
      </ul>

      <Button
        variant="outline"
        className="w-full text-white relative overflow-hidden group border-red-900/70 bg-red-900/50 hover:bg-red-800"
        onClick={() => onAdd({ spell, jewel: selectedEffects })}
        disabled={selectedEffects.length < 4}
      >
        ADD SPELL
      </Button>
    </div>
  );
};
