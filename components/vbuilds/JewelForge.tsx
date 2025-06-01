import { useEffect, useState, useRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "../ui/button";

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

  // Move the console.log outside of the render to help debug
  useEffect(() => {
    console.log(selectedEffects, "selected effects");
  }, [selectedEffects]);

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
          <div className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full">
            Choose 4 Effects
          </div>
        </div>
      </div>
      <ul className="space-y-4">
        {spell.effects.map((effect) => (
          <li key={effect.key} className="flex items-center gap-4">
            <Checkbox
              checked={selectedEffects.includes(effect.key)}
              onCheckedChange={() => toggleEffectSelection(effect.key)}
              disabled={
                !selectedEffects.includes(effect.key) &&
                selectedEffects.length >= 4
              }
            />
            {effect.description}
          </li>
        ))}
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
