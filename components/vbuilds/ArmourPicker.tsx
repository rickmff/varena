import React from "react";
import {
  DropdownSelect,
  DropdownSelectPlaceholder,
} from "./components/DropdownSelect";
import { useBuilder } from "./BuildProvider";
import { Modifier } from "../machines/calculator";

export const armourOptions = [
  {
    id: "shadow",
    name: "Dracula's Shadow Armour Set",
    image: "/images/vbuilds/armour/armour-draculas_shadow_chestguard.webp",
    arenaCode: "2",
    modifiers: [
      {
        stat: "Max Health",
        value: 812,
        unit: "flat",
        calculate: true,
      },
      {
        stat: "Physical Critical Chance",
        value: 8,
        unit: "percent",
        calculate: true,
      },
      {
        stat: "Bonus Movement Speed",
        value: 4,
        unit: "percent",
        calculate: true,
      },
      {
        stat: "Veil Cooldown Rate",
        value: 7,
        unit: "percent",
        calculate: true,
      },
    ] as Modifier[],
  },
  {
    id: "grim",
    name: "Dracula's Grim Armour Set",
    image: "/images/vbuilds/armour/armour-draculas_grim_chestguard.webp",
    arenaCode: "1",
    modifiers: [
      {
        stat: "Max Health",
        value: 812,
        unit: "flat",
        calculate: true,
      },
      {
        stat: "Attack Speed",
        value: 7.2,
        unit: "percent",
        calculate: true,
      },
      {
        stat: "Primary Attack Leech",
        value: 5,
        unit: "percent",
        calculate: true,
      },
      {
        stat: "Damage Reduction",
        value: 5,
        unit: "percent",
        calculate: true,
      },
    ] as Modifier[],
  },
  {
    id: "dread",
    name: "Dracula's Dread Armour Set",
    image: "/images/vbuilds/armour/armour-draculas_dread_chestguard.webp",
    arenaCode: "4",
    modifiers: [
      {
        stat: "Max Health",
        value: 812,
        unit: "flat",
        calculate: true,
      },
      {
        stat: "Bonus Physical Power",
        value: 4.8,
        unit: "flat",
        calculate: true,
      },
      {
        stat: "Weapon Skill Power",
        value: 10,
        unit: "percent",
        calculate: true,
      },
      {
        stat: "Weapon Cooldown Rate",
        value: 5,
        unit: "percent",
        calculate: true,
      },
    ] as Modifier[],
  },
  {
    id: "maleficer",
    name: "Dracula's Maleficer Armour Set",
    image: "/images/vbuilds/armour/armour-draculas_maleficer_chestguard.webp",
    arenaCode: "3",
    modifiers: [
      {
        stat: "Max Health",
        value: 812,
        unit: "flat",
        calculate: true,
      },
      {
        stat: "Bonus Spell Power",
        value: 7.2,
        unit: "parcent",
        calculate: true,
      },
      {
        stat: "Spell Cooldown Rate",
        value: 7,
        unit: "percent",
        calculate: true,
      },
      {
        stat: "Spell Leech",
        value: 5,
        unit: "percent",
        calculate: true,
      },
    ] as Modifier[],
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
