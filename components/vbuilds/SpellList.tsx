"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useBuilder } from "@/components/vbuilds/BuildProvider";
import { useSelector } from "@xstate/react";
import SpellTabs from "@/components/vbuilds/SpellTabs";

import spellsData from "@/data/vbuilds/spells.json";
import { Checkbox } from "../ui/checkbox";

export const veilSpells = Object.values(spellsData).filter((spell) =>
  spell.name.toLowerCase().includes("veil")
);

const spellSchools = Array.from(
  new Set(
    Object.values(spellsData)
      .filter((spell) => !spell.name.toLowerCase().includes("veil"))
      .map((spell) => spell.spellSchool)
  )
);

export const SpellList = () => {
  const [selectedVeil, setSelectedVeil] = useState<any | null>(null);
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
    <div>
      <div className="grid grid-cols-4 gap-4">
        <div>
          <strong>Dash</strong>
          <ul className="flex">
            {veilSpells.map((spell) => (
              <li key={spell.id} onClick={() => setSelectedVeil(spell)}>
                <img
                  src={spell.img}
                  alt={spell.name}
                  className="w-12 h-12 mb-2 object-contain rounded-full border-4"
                />
              </li>
            ))}
          </ul>
          {selectedVeil && (
            <ul>
              <img
                src={`/images/vbuilds/jewels/jewel-${selectedVeil.spellSchool}_tier4.webp`}
                className="w-12 h-12"
              />
              {selectedVeil.effects.map((effect) => (
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
          )}
        </div>
        <div>
          <strong>Spell 1</strong>
          <SpellTabs />
        </div>
        <div>
          <strong>Spell 2</strong>
          <SpellTabs />
        </div>
        <div>
          <strong>Ultimate</strong>
        </div>
      </div>
    </div>
  );
};

export default SpellList;
