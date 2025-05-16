import spellsData from "@/data/vbuilds/spells.json";
import { Button } from "../ui/button";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { useBuilder } from "./BuildProvider";
const UltimateForge = () => {
  const { builder } = useBuilder();
  const ultimateSpells = Object.values(spellsData).filter(
    (spell) => spell.category === "ultimate"
  );

  return (
    <div>
      <ToggleGroup
        type="single"
        className="flex flex-col gap-4 justify-start items-start"
        onValueChange={(value: string | undefined) => {
          builder.send({
            type: "ADD_SPELL",
            spell: ultimateSpells.find((spell) => spell.id === value),
            slot: "ultimate",
          });
        }}
      >
        {Object.values(ultimateSpells).map((spell) => (
          <ToggleGroupItem
            value={spell.id}
            key={spell.id}
            className="flex justify-between h-16 w-full"
          >
            <div className="flex gap-4 justify-start items-center">
              <img src={spell.img} className="w-12 h-12 rounded" />
              {spell.name}
            </div>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
};

export default UltimateForge;
