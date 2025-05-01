"use client";

import { useState } from "react";
import amuletsData from "@/data/vbuilds/amulets.json";
import { StatProviderContext } from "./StatProvider";
import { Modifier } from "@/components/machines/calculator";
import { Popover } from "./Popover";

export interface Amulet {
  name: string;
  img?: string; // path to image
  attributes: Array<{
    stat: string;
    value: number;
    unit: "flat" | "percent";
  }>;
  effect: {
    description: string;
  };
}

export type AmuletCollection = Record<string, Amulet>;

const amulets: AmuletCollection = amuletsData as AmuletCollection;

export function AmuletList() {
  const [selectedAmulet, setSelectedAmulet] = useState<string | null>(null);
  const [hoveredAmulet, setHoveredAmulet] = useState<string | null>(null);
  const calculator = StatProviderContext.useActorRef();

  const handleAmuletChange = (key: string) => {
    const isSelected = selectedAmulet === key;

    if (isSelected) {
      // Deselect the current amulet
      setSelectedAmulet(null);
      calculator.send({ type: "REMOVE_SOURCE", sourceId: key });
    } else {
      // Select a new amulet
      const amulet = amulets[key];
      const previousAmulet = selectedAmulet;
      setSelectedAmulet(key);
      calculator.send({
        type: "ADD_SOURCE",
        source: {
          id: key,
          name: amulet.name,
          modifiers: amulet.attributes as Modifier[],
          type: "gear",
        },
      });
      if (previousAmulet) {
        calculator.send({
          type: "REMOVE_SOURCE",
          sourceId: previousAmulet,
        });
      }
    }
  };

  return (
    <div className="grid lg:grid-cols-6 md:grid-cols-3 grid-cols-2 gap-4">
      {Object.entries(amulets).map(([key, amulet]) => (
        <div
          key={key}
          className="relative"
          onMouseEnter={() => setHoveredAmulet(key)}
          onMouseLeave={() => setHoveredAmulet(null)}
        >
          <label
            className={`flex flex-col items-center justify-center p-4 bg-gray-800 text-gray-200 rounded cursor-pointer ${selectedAmulet === key
              ? "bg-red-500 text-white hover:bg-red-500"
              : "hover:bg-gray-700"
              }`}
          >
            {amulet.img && (
              <img
                src={amulet.img}
                alt={amulet.name}
                className="w-16 h-16 mb-2 object-contain"
              />
            )}
            <input
              type="checkbox"
              name="amulet"
              value={key}
              className="hidden"
              checked={selectedAmulet === key}
              onChange={() => handleAmuletChange(key)}
            />
            {/* <span className="text-center">{amulet.name}</span> */}
          </label>
          <Popover
            title={amulet.name}
            description={amulet.effect.description}
            img={amulet.img}
            isVisible={hoveredAmulet === key}
          />
        </div>
      ))}
    </div>
  );
}
