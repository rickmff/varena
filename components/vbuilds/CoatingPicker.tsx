import coatingData from "@/data/vbuilds/coatings.json";
import { useBuilder } from "./BuildProvider";

import {
  DropdownSelect,
  DropdownSelectPlaceholder,
} from "./components/DropdownSelect";
import { AvailableWeaponSlots } from "./WeaponForge";
import { useSelector } from "@xstate/react";
import { Switch } from "../ui/switch";
import { HoverCardDescription, HoverCardTitle } from "../ui/hover-card";

export interface Coating {
  id: string;
  name: string;
  image: string;
  arenaCode: string;
  description: string;
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

  return (
    <div
      className="flex items-center gap-3 py-2.5 rounded-lg transition-all duration-300"
    >
      <Switch
        className="data-[state=unchecked]:bg-zinc-800 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-orange-500 data-[state=checked]:to-orange-600 transition-all duration-300"
        checked={advancedCoatings}
        onCheckedChange={(checked) => {
          // If disabling advanced coatings (turning off), restore all coatings to slot 1 type
          if (advancedCoatings && !checked) {
            // Get coating from slot 1, or first available coating
            const slot1Coating = coatings.get(1);
            const coatingToApply = slot1Coating || coatingsArray[0];

            if (coatingToApply) {
              // Apply the coating to all slots
              builder.send({ type: "ADD_ALL_COATINGS", coating: coatingToApply });
            }
          }

          builder.send({ type: "TOGGLE_ADVANCED_COATINGS" });

          // If enabling advanced coatings and there's a single coating type, apply it to all
          if (!advancedCoatings && checked && result.advanced && result.value) {
            const coating = coatingsArray.find(
              (c) => c.arenaCode === result.value
            );
            if (coating) {
              builder.send({ type: "ADD_ALL_COATINGS", coating });
            }
          }
        }}
      />
      <span
        className={`
          text-sm font-medium transition-all duration-300
          ${advancedCoatings
            ? "text-orange-400 font-semibold tracking-wide"
            : "text-gray-400"
          }
        `}
      >
        Advanced Coatings
      </span>
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
    <div className="flex gap-4 flex-wrap">
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

const HoverCardInfo = ({ coating }: { coating: Coating }) => {
  return (
    <div className="space-y-4">
      <HoverCardTitle>{coating.name}</HoverCardTitle>
      <HoverCardDescription>{coating.description}</HoverCardDescription>
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
      hoverIsVisible={state.context.coatings.get(slot) !== undefined}
      hoverDescription={
        <HoverCardInfo coating={state.context.coatings.get(slot) as Coating} />
      }
      hoverOptionDescription={(option: any) => (
        <HoverCardInfo coating={option} />
      )}
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
