import { useState } from "react";
import { Checkbox } from "../ui/checkbox";

type Spell = {
  id: String;
  name: String;
  effects: Array<{ key: number; description: string }>;
  spellSchool: "storm" | "chaos" | "frost" | "blood" | "unholy" | "illusion";
};

export const JewelForge = ({ spell }: { spell: Spell }) => {
  console.log(spell);
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

  return (
    <ul>
      <img
        src={`/images/vbuilds/jewels/jewel-${spell.spellSchool}_tier4.webp`}
        className="w-12 h-12"
      />
      {spell.effects.map((effect) => (
        <li key={effect.key} className="flex items-center gap-4Kri">
          <Checkbox
            className="form-checkbox"
            checked={selectedEffects.includes(effect.key)}
            onChange={() => toggleEffectSelection(effect.key)}
            disabled={
              !selectedEffects.includes(effect.key) &&
              selectedEffects.length >= 4
            }
          />
          {effect.description}
        </li>
      ))}
    </ul>
  );
};
