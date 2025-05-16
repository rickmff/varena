import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
} from "../ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import {
  DropdownSelect,
  DropdownSelectPlaceholder,
} from "./components/DropdownSelect";
import { useBuilder } from "./BuildProvider";

const armourOptions = [
  {
    id: "shadow",
    name: "Dracula's Shadow Armour Set",
    image: "/images/vbuilds/armour/armour-draculas_shadow_chestguard.webp",
  },
  {
    id: "grim",
    name: "Dracula's Grim Armour Set",
    image: "/images/vbuilds/armour/armour-draculas_grim_chestguard.webp",
  },
  {
    id: "dread",
    name: "Dracula's Dread Armour Set",
    image: "/images/vbuilds/armour/armour-draculas_dread_chestguard.webp",
  },
  {
    id: "maleficer",
    name: "Dracula's Maleficer Armour Set",
    image: "/images/vbuilds/armour/armour-draculas_maleficer_chestguard.webp",
  },
] as const;

type ArmourOption = (typeof armourOptions)[number];
type ArmourId = ArmourOption["id"];

export const ArmourPicker: React.FC = () => {
  const { state, builder } = useBuilder();
  return (
    <DropdownSelect
      onSelect={(id: string) => {
        const armourId = id as ArmourId;
        builder.send({
          type: "ADD_ARMOUR",
          armour: armourOptions.find((option) => option.id === armourId),
        });
      }}
      options={[...armourOptions]}
      defaultValue={null}
      placeholder={
        <DropdownSelectPlaceholder
          image="/images/vbuilds/armour/armour-draculas_shadow_chestguard.webp"
          text="Select Armour"
        />
      }
    />
  );
};
