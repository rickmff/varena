"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import spellsData from "@/data/vbuilds/spells.json";
import "./styles.css";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { useState } from "react";
import { AddSpellWithJewel, JewelForge, SpellWithJewel } from "./JewelForge";
import { XIcon } from "lucide-react";

import { Spell } from "./JewelForge";

type SpellsData = {
  [key: string]: Spell;
};

export const veilSpells = Object.values(spellsData).filter((spell) =>
  spell.name.toLowerCase().includes("veil")
);

const spellSchools = Array.from(
  new Set(Object.values(spellsData).map((spell) => spell.spellSchool))
);

const SpellTabs = ({
  spell,
  onAdd,
  filter = () => true,
}: {
  spell?: SpellWithJewel;
  onAdd: (params: AddSpellWithJewel) => void;
  filter: (spell: any) => boolean;
}) => {
  const [selectedSpell, setSelectedSpell] = useState<
    SpellWithJewel | undefined
  >(() => spell);

  return (
    <Tabs defaultValue={selectedSpell?.spellSchool}>
      {!selectedSpell && (
        <TabsList className="w-full">
          {spellSchools.map((school) => (
            <TabsTrigger
              key={school}
              value={school}
              className="overflow-hidden"
            >
              <img
                src={`/images/vbuilds/spellschools/${school}.webp`}
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
            defaultValue={selectedSpell?.id}
            onValueChange={(value) => {
              setSelectedSpell(
                value ? (spellsData as SpellsData)[value] : undefined
              );
            }}
          >
            {Object.values(spellsData)
              .filter((spell) => filter(spell))
              .filter((spell) => {
                if (!selectedSpell) {
                  return true;
                }
                return selectedSpell.id === spell.id;
              })
              .filter(
                (spell) =>
                  spell.spellSchool === school && spell.category === "spell"
              )
              .map((spell) => (
                <ToggleGroupItem
                  data-state={selectedSpell?.id === spell.id ? "on" : "off"}
                  aria-checked={selectedSpell?.id === spell.id}
                  value={spell.id}
                  key={spell.id}
                  defaultChecked={selectedSpell?.id === spell.id}
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
            <JewelForge
              spell={selectedSpell}
              selectedJewelEffects={
                selectedSpell.jewel?.map((jewel) => Number(jewel)) || []
              }
              onAdd={onAdd}
            />
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default SpellTabs;
