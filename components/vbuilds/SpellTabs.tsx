"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import spellsData from "@/data/vbuilds/spells.json";
import "./styles.css";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { useState } from "react";
import { JewelForge, AddSpellWithJewel } from "./JewelForge";
import { XIcon } from "lucide-react";

export const veilSpells = Object.values(spellsData).filter((spell) =>
  spell.name.toLowerCase().includes("veil")
);

const spellSchools = Array.from(
  new Set(Object.values(spellsData).map((spell) => spell.spellSchool))
);

const SpellTabs = ({
  onAdd,
  filter,
}: {
  onAdd: (params: AddSpellWithJewel) => void;
  filter: (spell: any) => boolean;
}) => {
  const [selectedSpell, setSelectedSpell] = useState<string>("");
  return (
    <Tabs defaultValue="veil">
      {!selectedSpell && (
        <TabsList className="w-full">
          {spellSchools.map((school) => (
            <TabsTrigger
              key={school}
              value={school}
              className="overflow-hidden"
            >
              <img
                src={`/images/vbuilds/spellschools/${school}.png`}
                className={`spellSchool spellSchool-${school} w-8 h-8`}
              />
            </TabsTrigger>
          ))}
        </TabsList>
      )}
      {spellSchools.map((school) => (
        <TabsContent key={school} value={school} className="space-y-4">
          <ToggleGroup
            type="single"
            className="flex flex-col gap-4 justify-start items-start"
            onValueChange={(value) => {
              setSelectedSpell(value);
            }}
          >
            {Object.values(spellsData)
              .filter(filter)
              .filter((spell) => {
                if (!selectedSpell) {
                  return true;
                }
                return selectedSpell === spell.id;
              })
              .filter(
                (spell) =>
                  spell.spellSchool === school && spell.category === "spell"
              )
              .map((spell) => (
                <ToggleGroupItem
                  value={spell.id}
                  key={spell.id}
                  className="flex justify-between h-16 w-full"
                >
                  <div className="flex gap-4 justify-start items-center">
                    <img src={spell.img} className="w-12 h-12 rounded" />
                    {spell.name}
                  </div>
                  {selectedSpell && (
                    <div className="text-sm">
                      <XIcon />
                    </div>
                  )}
                </ToggleGroupItem>
              ))}
          </ToggleGroup>
          {selectedSpell && (
            <JewelForge spell={spellsData[selectedSpell]} onAdd={onAdd} />
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default SpellTabs;
