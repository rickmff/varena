"use client";

import { Dispatch, SetStateAction, useState } from "react";
import passivesData from "@/data/vbuilds/passives.json";
import { useBuilder } from "@/components/vbuilds/BuildProvider";
import { useSelector } from "@xstate/react";

import { PassivePlaceholder } from "./PassiveForge";
import { Checkbox } from "../ui/checkbox";
import React from "react";

export interface Passive {
  id: string;
  name: string;
  img?: string; // path to image
  description: string;
  type: string;
  arenaCode: string;
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
  const [hoveredPassive, setHoveredPassive] = useState<Passive | null>(null);
  const { send, builder } = useBuilder();

  const activePassives = useSelector(
    builder,
    (state) => state.context.passives
  );

  const handlePassiveChange = (key: string) => {
    const isSelected = activePassives.find((passive) => passive.id === key);

    if (!isSelected && activePassives.length >= 5) {
      // Prevent adding more than 5 passives
      return;
    }

    if (isSelected) {
      send({ type: "REMOVE_PASSIVE", id: key });
    } else {
      send({ type: "ADD_PASSIVE", passive: passives[key] });
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
      <PassivePlaceholder length={5} />
      {["Elemental", "Vampire"].map((type) => (
        <div key={type}>
          <h2 className="text-xl font-bold mb-4">{type}</h2>
          <div className="grid lg:grid-cols-6 md:grid-cols-3 grid-cols-2 select-none">
            {groupedPassives[type]?.map(([key, passive]) => {
              const isSelected = activePassives.find(
                (passive) => passive.id === key
              );
              const hasMaximumSelected = activePassives.length === 5;
              return (
                <React.Fragment key={key}>
                  {passive.img && (
                    <img
                      draggable={false}
                      src={passive.img}
                      alt={passive.name}
                      className={`w-16 h-16 mb-2 object-contain rounded-full border-4 border-emerald-500 ${
                        isSelected
                          ? "border-emerald-300"
                          : hasMaximumSelected
                          ? "opacity-10"
                          : "border-gray-700"
                      }`}
                      onClick={() => {
                        handlePassiveChange(passive.id);
                      }}
                      onMouseEnter={() => {
                        if (!hasMaximumSelected || isSelected) {
                          setHoveredPassive(passive);
                        }
                      }}
                      onMouseLeave={() => {
                        setHoveredPassive(null);
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      ))}
      {hoveredPassive ? (
        <div className="space-y-1 rounded-lg p-4  h-44">
          <div className="flex items-center gap-4">
            {hoveredPassive.img && (
              <img
                src={hoveredPassive.img}
                alt={hoveredPassive.name}
                className="w-12 h-12 mb-2 object-contain"
              />
            )}
            <h3 className="font-bold">{hoveredPassive.name}</h3>
          </div>
          <p className="text-sm">{hoveredPassive.description}</p>
        </div>
      ) : (
        <div className="space-y-1  rounded-lg p-4 h-44">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 mb-2 object-contain" />
            <h3 className="font-bold h-12 w-full"></h3>
          </div>
          <p className="text-sm h-12 w-full"></p>
        </div>
      )}
    </div>
  );
}
