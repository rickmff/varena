import coatingData from "@/data/vbuilds/coatings.json";
import { useBuilder } from "./BuildProvider";

import {
  DropdownSelect,
  DropdownSelectPlaceholder,
} from "./components/DropdownSelect";
import { AvailableWeaponSlots } from "./WeaponForge";
import { useSelector } from "@xstate/react";
import { Switch } from "../ui/switch";

export interface Coating {
  id: string;
  name: string;
  image: string;
  arenaCode: string;
}

export type CoatingCollection = Record<string, Coating>;

const coatings: CoatingCollection = coatingData as CoatingCollection;

export function hasAdvancedCoatings(chars: string): {
  value: string | null;
  advanced: boolean;
} {
  const nonZeroDigits = chars.split("").filter((d) => d !== "0");
  const unique = [...new Set(nonZeroDigits)];

  // All zeros
  if (nonZeroDigits.length === 0) return { value: null, advanced: false };

  // Only one unique non-zero value
  if (unique.length === 1) {
    // If not all 8 positions are filled, consider it advanced
    if (nonZeroDigits.length !== 8) {
      return { value: unique[0], advanced: true };
    }
    // All 8 positions are filled with the same value
    return { value: unique[0], advanced: false };
  }

  // More than one unique non-zero value
  return { value: null, advanced: true };
}

export const AdvancedCoatingsSwitch = () => {
  const { state, builder } = useBuilder();
  const advancedCoatings = useSelector(
    builder,
    (state) => state.context.advancedCoatings
  );

  const coatings = useSelector(builder, (state) => state.context.coatings);
  const coatingsArray = Array.from(coatings.values());
  const chars = coatingsArray.map((coating) => coating.arenaCode).join("");

  const result = hasAdvancedCoatings(chars);

  const isDisabled = result.advanced && !result.value;

  return (
    <div className="flex items-center gap-2">
      <Switch
        disabled={isDisabled}
        className="data-[state=unchecked]:bg-zinc-800"
        checked={advancedCoatings}
        onCheckedChange={() => {
          builder.send({ type: "TOGGLE_ADVANCED_COATINGS" });
          if (result.advanced && result.value) {
            const coating = coatingsArray.find(
              (c) => c.arenaCode === result.value
            );
            builder.send({ type: "ADD_ALL_COATINGS", coating });
          }
        }}
      />
      Advanced Coatings
    </div>
  );
};

export const SingleCoating = () => {
  const { builder } = useBuilder();
  const advancedCoatings = useSelector(
    builder,
    (state) => state.context.advancedCoatings
  );

  if (advancedCoatings) return null;
  return <CoatingPicker slot={1} all={true} />;
};

export const AdvancedCoatings = () => {
  const { builder } = useBuilder();
  const advancedCoatings = useSelector(
    builder,
    (state) => state.context.advancedCoatings
  );

  if (!advancedCoatings) return null;

  return (
    <div className="flex gap-4">
      <CoatingPicker slot={1} />
      <CoatingPicker slot={2} />
      <CoatingPicker slot={3} />
      <CoatingPicker slot={4} />
      <CoatingPicker slot={5} />
      <CoatingPicker slot={6} />
      <CoatingPicker slot={7} />
      <CoatingPicker slot={8} />
    </div>
  );
};

export function CoatingPicker({
  slot,
  all = false,
}: {
  slot: AvailableWeaponSlots;
  all?: boolean;
}) {
  const { state, builder } = useBuilder();

  return (
    <DropdownSelect
      options={Object.values(coatings)}
      defaultValue={state.context.coatings.get(slot)?.id!}
      selected={state.context.coatings.get(slot)?.id!}
      clear={() => {
        if (all) {
          return builder.send({ type: "REMOVE_ALL_COATINGS" });
        }
        builder.send({ type: "REMOVE_COATING", slot });
      }}
      onSelect={(id) => {
        if (all) {
          return builder.send({
            type: "ADD_ALL_COATINGS",
            coating: coatings[id],
          });
        }
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
