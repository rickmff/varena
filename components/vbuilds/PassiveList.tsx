"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import passivesData from "@/data/vbuilds/passives.json";
import { useBuilder } from "@/components/vbuilds/BuildProvider";
import { useSelector } from "@xstate/react";
import { Modifier } from "../machines/builder";

import { PassivePlaceholder } from "./PassiveForge";

export interface Passive {
  id: string;
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

export function PassiveList({
  setHoverPassive,
}: {
  setHoverPassive: Dispatch<SetStateAction<Passive | null>>;
}) {
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
      {["Elemental", "Vampire"].map((type) => (
        <div key={type}>
          <h2 className="text-xl font-bold mb-4">{type}</h2>
          <div className="grid lg:grid-cols-6 md:grid-cols-3 grid-cols-2">
            {groupedPassives[type]?.map(([key, passive]) => {
              const isSelected = activePassives.find(
                (passive) => passive.id === key
              );
              const hasMaximumSelected = activePassives.length === 5;
              return (
                <label
                  key={key}
                  className={`flex flex-col items-center justify-center p-4 ${
                    activePassives.length === 5 && !isSelected
                      ? "cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                  onMouseEnter={() => {
                    setHoverPassive(passive);
                  }}
                  onMouseLeave={() => {
                    setHoverPassive(null);
                  }}
                >
                  {passive.img && (
                    <img
                      src={passive.img}
                      alt={passive.name}
                      className={`w-16 h-16 mb-2 object-contain rounded-full border-4 border-emerald-500 ${
                        isSelected
                          ? "border-emerald-300"
                          : hasMaximumSelected
                          ? "border-red-800 opacity-10 pointer-events-none"
                          : "border-gray-700"
                      }`}
                    />
                  )}
                  <input
                    type="checkbox"
                    name="passive"
                    value={key}
                    className="hidden"
                    checked={isSelected}
                    onChange={() => handlePassiveChange(passive.id)}
                  />
                </label>
              );
            })}
          </div>
        </div>
      ))}
      <div className="flex gap-4 justify-center bg-neutral-900 p-4 rounded-lg">
        {activePassives.map((selectedPassive: string) => {
          const allPassives = Object.values(passives);
          const passive = allPassives.find(
            (passive) => passive.id === selectedPassive
          );
          if (!passive) return null;
          return (
            <label
              className="flex flex-col items-center justify-center cursor-pointer ab"
              onMouseEnter={() => {
                setHoverPassive(passive);
              }}
              onMouseLeave={() => {
                setHoverPassive(null);
              }}
            >
              {passive.img && (
                <img
                  src={passive.img}
                  alt={passive.name}
                  className={`w-16 h-16 mb-2 object-contain rounded-full border-4 border-emerald-500 ${
                    activePassives.includes(passive.id)
                      ? "border-emerald-300"
                      : "border-gray-700"
                  }`}
                />
              )}
              <input
                type="checkbox"
                name="passive"
                value={passive.id}
                className="hidden"
                checked={
                  activePassives.find(
                    (activePassive) => activePassive.id === passive.id
                  ) !== undefined
                }
                onChange={() => handlePassiveChange(passive.id)}
              />
            </label>
          );
        })}
        <PassivePlaceholder length={activePassives.length} />
      </div>
    </div>
  );
}
