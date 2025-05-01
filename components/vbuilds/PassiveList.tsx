"use client";

import { useState } from "react";
import passivesData from "@/data/vbuilds/passives.json";
import { StatProviderContext } from "@/components/vbuilds/StatProvider";
import { Modifier } from "../machines/calculator";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export interface Passive {
  name: string;
  img?: string; // path to image
  description: string;
  type: string;
  modifiers: Array<{
    stat: string;
    value: number;
    unit: "flat" | "percent";
    calculate?: boolean;
  }>;
}

export type PassiveCollection = Record<string, Passive>;

const passives: PassiveCollection = passivesData as PassiveCollection;

export function PassiveList() {
  const [selectedPassives, setSelectedPassives] = useState<string[]>([]);
  const [hoveredPassive, setHoveredPassive] = useState<string | null>(null);
  const calculator = StatProviderContext.useActorRef();

  const handlePassiveChange = (key: string) => {
    const isSelected = selectedPassives.includes(key);

    if (!isSelected && selectedPassives.length >= 5) {
      // Prevent adding more than 5 passives
      return;
    }

    const updatedPassives = isSelected
      ? selectedPassives.filter((id) => id !== key)
      : [...selectedPassives, key];

    setSelectedPassives(updatedPassives);

    if (isSelected) {
      calculator.send({ type: "REMOVE_SOURCE", sourceId: key });
    } else {
      const passive = passives[key];
      calculator.send({
        type: "ADD_SOURCE",
        source: {
          id: key,
          name: passive.name,
          modifiers: passive.modifiers as Modifier[],
          type: "passive",
        },
      });
    }
  };

  const groupedPassives = Object.entries(passives).reduce(
    (acc, [key, passive]) => {
      acc[passive.type] = acc[passive.type] || [];
      acc[passive.type].push([key, passive]);
      return acc;
    },
    {} as Record<string, Array<[string, Passive]>>
  );

  return (
    <div className="space-y-8">
      {["Elemental", "Vampire"].map((type) => (
        <div key={type}>
          <h2 className="text-xl font-bold mb-4">{type}</h2>
          <div className="grid lg:grid-cols-6 md:grid-cols-3 grid-cols-2">
            {groupedPassives[type]?.map(([key, passive]) => (
              <HoverCard openDelay={0} closeDelay={0} key={key}>
                <HoverCardTrigger>
                  <label className="flex flex-col items-center justify-center p-4 cursor-pointer">
                    {passive.img && (
                      <img
                        src={passive.img}
                        alt={passive.name}
                        className={`w-16 h-16 mb-2 object-contain rounded-full border-4 border-emerald-500 ${selectedPassives.includes(key)
                          ? "border-emerald-300"
                          : "border-gray-700"
                          }`}
                      />
                    )}
                    <input
                      type="checkbox"
                      name="passive"
                      value={key}
                      className="hidden"
                      checked={selectedPassives.includes(key)}
                      onChange={() => handlePassiveChange(key)}
                    />
                  </label>
                </HoverCardTrigger>
                <HoverCardContent className="space-y-2 w-96">
                  <div className="flex items-center gap-4">
                    {passive.img && (
                      <img
                        src={passive.img}
                        alt={passive.name}
                        className="w-12 h-12 mb-2 object-contain"
                      />
                    )}
                    <h3 className="font-bold">{passive.name}</h3>
                  </div>
                  <p className="text-sm">{passive.description}</p>
                </HoverCardContent>
              </HoverCard>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
