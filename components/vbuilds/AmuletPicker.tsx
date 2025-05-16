"use client";

import { useState } from "react";
import amuletsData from "@/data/vbuilds/amulets.json";
import { useBuilder } from "./BuildProvider";
import { Modifier } from "@/components/machines/builder";
import {
  DropdownSelect,
  DropdownSelectPlaceholder,
} from "./components/DropdownSelect";

export interface Amulet {
  id: string;
  name: string;
  image: string; // path to image
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

export function AmuletPicker() {
  const { state, builder } = useBuilder();

  return (
    <DropdownSelect
      options={Object.values(amulets)}
      defaultValue={state.context.amulet?.id}
      onSelect={(id) => {
        builder.send({
          type: "ADD_SOURCE",
          source: {
            id: id,
            name: amulets[id].name,
            modifiers: amulets[id].attributes as Modifier[],
            type: "gear",
          },
        });

        builder.send({ type: "ADD_AMULET", amulet: amulets[id] });
      }}
      placeholder={
        <DropdownSelectPlaceholder
          image={amulets["amulet_blademaster"].image}
          text="Select Amulet"
        />
      }
    />
  );
}
