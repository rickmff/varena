import React from "react";
import {
  DropdownSelect,
  DropdownSelectPlaceholder,
} from "./components/DropdownSelect";
import { useBuilder } from "./BuildProvider";

export const armourOptions = [
  {
    id: "shadow",
    name: "Dracula's Shadow Armour Set",
    image: "/images/vbuilds/armour/armour-draculas_shadow_chestguard.webp",
    arenaCode: "2",
  },
  {
    id: "grim",
    name: "Dracula's Grim Armour Set",
    image: "/images/vbuilds/armour/armour-draculas_grim_chestguard.webp",
    arenaCode: "1",
  },
  {
    id: "dread",
    name: "Dracula's Dread Armour Set",
    image: "/images/vbuilds/armour/armour-draculas_dread_chestguard.webp",
    arenaCode: "4",
  },
  {
    id: "maleficer",
    name: "Dracula's Maleficer Armour Set",
    image: "/images/vbuilds/armour/armour-draculas_maleficer_chestguard.webp",
    arenaCode: "3",
  },
] as const;

type ArmourOption = (typeof armourOptions)[number];
type ArmourId = ArmourOption["id"];

export const ArmourPicker: React.FC = () => {
  const { state, builder } = useBuilder();
  return (
    <DropdownSelect
      selected={state.context.armour?.id}
      clear={() => builder.send({ type: "REMOVE_ARMOUR" })}
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
