"use client";

import { useState } from "react";
import amuletsData from "@/data/vbuilds/amulets.json";
import { useBuilder } from "./BuildProvider";
// import { Modifier } from "@/components/machines/builder";
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
      selected={state.context.amulet?.id}
      clear={() => builder.send({ type: "REMOVE_AMULET" })}
      onSelect={(id) => {
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
