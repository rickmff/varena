"use client";

import amuletsData from "@/data/vbuilds/amulets.json";
import { useBuilder } from "./BuildProvider";

import {
  DropdownSelect,
  DropdownSelectPlaceholder,
} from "./components/DropdownSelect";
import { attachReactRefresh } from "next/dist/build/webpack-config";
import { HoverCard } from "@radix-ui/react-hover-card";
import { HoverCardDescription, HoverCardTitle } from "../ui/hover-card";

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

const AmuletDescription = ({ amulet }: { amulet: Amulet }) => {
  return (
    <div className="space-y-4 ">
      <HoverCardTitle>{amulet.name}</HoverCardTitle>
      <div className="space-y-2 text-sm">
        {amulet.attributes.map((attr) => (
          <HoverCardDescription key={`${attr.stat}-${attr.value}-${attr.unit}`}>
            {`- ${attr.stat} by +${attr.value}${
              attr.unit === "percent" ? "%" : ""
            }`}
          </HoverCardDescription>
        ))}
      </div>
    </div>
  );
};

export function AmuletPicker() {
  const { state, builder } = useBuilder();

  return (
    <DropdownSelect
      hoverIsVisible={state.context.amulet !== null}
      hoverDescription={<AmuletDescription amulet={state.context.amulet} />}
      hoverOptionDescription={(option: any) => (
        <AmuletDescription amulet={option} />
      )}
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
