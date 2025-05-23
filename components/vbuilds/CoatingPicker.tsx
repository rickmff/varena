import coatingData from "@/data/vbuilds/coatings.json";
import { useBuilder } from "./BuildProvider";

import {
  DropdownSelect,
  DropdownSelectPlaceholder,
} from "./components/DropdownSelect";
import { AvailableWeaponSlots } from "./WeaponForge";

export interface Coating {
  id: string;
  name: string;
  image: string;
  arenaCode: string;
}

export type CoatingCollection = Record<string, Coating>;

const coatings: CoatingCollection = coatingData as CoatingCollection;

export function CoatingPicker({ slot }: { slot: AvailableWeaponSlots }) {
  const { state, builder } = useBuilder();

  return (
    <DropdownSelect
      options={Object.values(coatings)}
      defaultValue={state.context.coatings.get(slot)?.id!}
      selected={state.context.coatings.get(slot)?.id!}
      clear={() => {
        builder.send({ type: "REMOVE_COATING", slot });
      }}
      onSelect={(id) => {
        builder.send({ type: "ADD_COATING", coating: coatings[id], slot });
      }}
      placeholder={
        <DropdownSelectPlaceholder
          image={coatings["blood"].image}
          text="Select Coating"
        />
      }
    />
  );
}
