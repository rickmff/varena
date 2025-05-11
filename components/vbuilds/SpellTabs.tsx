"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import spellsData from "@/data/vbuilds/spells.json";
import "./styles.css";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { useState } from "react";
import { JewelForge } from "./JewelForge";

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

const SpellTabs = () => {
  const [selectedSpell, setSelectedSpell] = useState<string>("");
  return (
    <Tabs defaultValue="veil">
      {!selectedSpell && (
        <TabsList>
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
            // value={selectedSpell}
            onValueChange={(value) => {
              setSelectedSpell(value);
            }}
          >
            {Object.values(spellsData)
              .filter((spell) => {
                if (!selectedSpell) {
                  return true; // Show all spells if none is selected
                }
                return selectedSpell === spell.id; // Show only the selected spell
              })
              .filter(
                (spell) =>
                  spell.spellSchool === school &&
                  !spell.name.toLowerCase().includes("veil")
              )
              .map((spell) => (
                <ToggleGroupItem
                  value={spell.id}
                  key={spell.id}
                  className="flex gap-4 w-full justify-start items-center h-16"
                >
                  <img src={spell.img} className="w-12 h-12 rounded" />
                  {spell.name}
                </ToggleGroupItem>
              ))}
          </ToggleGroup>
          {selectedSpell && <JewelForge spell={spellsData[selectedSpell]} />}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default SpellTabs;
