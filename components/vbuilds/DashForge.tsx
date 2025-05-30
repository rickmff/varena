import spellsData from "@/data/vbuilds/spells.json";
import { useState } from "react";
import { AddSpellWithJewel, JewelForge } from "./JewelForge";
import { useBuilder } from "./BuildProvider";
import { useSelector } from "@xstate/react";

export const veilSpells = Object.values(spellsData).filter((spell) =>
  spell.name.toLowerCase().includes("veil")
);

export const DashForge = ({
  onAdd,
}: {
  onAdd: (params: AddSpellWithJewel) => void;
}) => {
  const { builder } = useBuilder();
  const dash = useSelector(builder, (state) => state.context.spells.dash);
  const [selectedVeil, setSelectedVeil] = useState<any | null>(dash || null);

  return (
    <div>
      <ul className="flex justify-between">
        {veilSpells.map((spell) => (
          <li key={spell.id} onClick={() => setSelectedVeil(spell)}>
            <img
              src={spell.img}
              alt={spell.name}
              className={`w-16 h-16 mb-2 object-contain rounded-full border-4 ${
                selectedVeil?.id === spell.id
                  ? "border-2 border-emerald-300"
                  : ""
              }`}
            />
          </li>
        ))}
      </ul>
      {selectedVeil && (
        <JewelForge
          spell={selectedVeil}
          onAdd={onAdd}
          selectedJewelEffects={dash?.jewel?.map((jewel: string) =>
            Number(jewel)
          )}
        />
      )}
    </div>
  );
};
