import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "../ui/button";
import { builder } from "../machines/builder";

type Spell = {
  id: String;
  name: String;
  effects: Array<{ key: number; description: string }>;
  spellSchool: "storm" | "chaos" | "frost" | "blood" | "unholy" | "illusion";
};

export type AddSpell = {
  spell: Spell;
};
export type AddSpellWithJewel = {
  jewel?: number[];
} & AddSpell;

export const JewelForge = ({
  spell,
  onAdd,
}: {
  spell: Spell;
  onAdd: (params: AddSpellWithJewel) => void;
}) => {
  const [selectedEffects, setSelectedEffects] = useState<number[]>([]);

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

  useEffect(() => {
    setSelectedEffects([]);
  }, [spell]);

  return (
    <div className="space-y-4">
      <div className="flex gap-4 justify-start items-center mb-4 pt-8">
        <img
          src={`/images/vbuilds/jewels/jewel-${spell.spellSchool}_tier4.webp`}
          className="w-12 h-12"
        />
        <h2 className="text-xl font-bold">Create Jewel</h2>
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
        disabled={selectedEffects.length < 4}
        onClick={() => onAdd({ spell, jewel: selectedEffects })}
      >
        Add Spell
      </Button>
    </div>
  );
};
