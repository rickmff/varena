import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { PassiveList, Passive } from "./PassiveList";
import { PlusIcon } from "lucide-react";
import { useBuilder } from "./BuildProvider";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { useSelector } from "@xstate/react";
import { WeaponSelect } from "./components/weaponForge/WeaponSelect";
import { WeaponEffectSelect } from "./components/weaponForge/WeaponEffectSelect";

import legoWeaponData from "@/data/vbuilds/legendary-weapons.json";
import epicWeaponData from "@/data/vbuilds/epic-weapons.json";
import { InfusionSelect } from "./components/weaponForge/InfusionSelect";

export type AvailableWeaponSlots = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface Weapon {
  name: string; // Name of the weapon
  id: string; // Unique identifier for the weapon
  position: AvailableWeaponSlots; // Slot position (1 to 8)
  type: "legendary" | "epic"; // Weapon type
  effects: string[]; // List of effects for the weapon
  img: string;
  infusion?: string; // Infusion type (optional)
}

export type WeaponData = {
  id: string; // Unique identifier for the weapon
  name: string; // Name of the weapon
  img: string; // Image path for the weapon
  arenaCode: string; // Arena code for the weapon
};

const SlotTrigger = ({
  children,
  slot,
}: {
  children?: React.ReactNode;
  slot: AvailableWeaponSlots;
}) => {
  const { state, builder } = useBuilder();

  const weaponInSlot = state.context.weapons.get(slot);

  return (
    <DialogTrigger
      className={`w-20 h-20 bg-gray-800 text-gray-200 rounded-md flex items-center justify-center relative overflow-hidden border-2 ${
        !weaponInSlot
          ? "border-transparent"
          : weaponInSlot.type === "legendary"
          ? "border-orange-500"
          : "border-purple-500"
      }`}
      onClick={() => {
        builder.send({ type: `goto.weaponForge`, slot });
      }}
    >
      {children}
    </DialogTrigger>
  );
};

export const WeaponSlotPlaceholder: React.FC<{
  placeholderImage?: string;
  slot: AvailableWeaponSlots;
}> = ({ placeholderImage, slot }) => {
  const { state, builder } = useBuilder();
  const weaponInSlot = state.context.weapons.get(slot);

  if (!weaponInSlot) {
    return (
      <div className="relative">
        <img
          src={placeholderImage}
          alt="Select Weapon"
          className={`${
            !weaponInSlot && "grayscale brightness-50 opacity-60"
          } pointer-events-none`}
        />
        <span className="absolute inset-0 flex items-center justify-center text-white">
          {weaponInSlot ? null : `Slot ${slot}`}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative rounded-md overflow-hidden`}>
      <img src={weaponInSlot?.img} className="w-20 h-20" />
      {weaponInSlot.infusion && (
        <div className="overflow-hidden w-10 h-10 rounded-md bg-black/80 flex items-center justify-center absolute right-0 bottom-0 border-l-2 border-t-2 border-purple-500 rounded-bl-none rounded-tr-none">
          <img
            src={`/images/vbuilds/spellschools/${weaponInSlot.infusion}.png`}
            className={`spellSchool spellSchool-${weaponInSlot.infusion} w-8 h-8`}
          />
        </div>
      )}
    </div>
  );
};

export const WeaponForge = () => {
  const { state, builder } = useBuilder();
  const weaponSelector = useSelector(
    builder,
    (state) => state.children.weaponBuilder
  );
  const weaponState = useSelector(weaponSelector, (state) => state);

  return (
    <Dialog
      open={state.matches("weaponForge")}
      onOpenChange={(open) => {
        if (!open) {
          builder.send({ type: "goto.overview" });
        }
      }}
    >
      <div className="flex gap-4">
        {Object.values(epicWeaponData)
          .slice(0, 8)
          .map((weapon, index) => (
            <SlotTrigger key={index} slot={(index + 1) as AvailableWeaponSlots}>
              <WeaponSlotPlaceholder
                placeholderImage={weapon.img}
                slot={(index + 1) as AvailableWeaponSlots}
              />
            </SlotTrigger>
          ))}
      </div>
      <DialogContent className="w-full max-w-3xl" aria-describedby="Passives">
        <DialogDescription />
        <DialogTitle />
        {weaponState?.matches("pickWeapon") && (
          <>
            <h2 className="text-3xl font-bold text-gray-100 mb-4">
              Weapon Slot {state.context.selectedWeaponSlot}
            </h2>
            <WeaponSelect />
          </>
        )}
        {weaponState?.matches("pickInfusion") && (
          <>
            <div className="flex items-center gap-4">
              <img
                src={weaponState.context.weapon?.img}
                className="w-20 h-20"
              />
              <div>
                <h2 className="text-3xl font-bold text-gray-100 flex items-center gap-2">
                  {weaponState.context.weapon?.name}
                  {weaponState.context.infusion && (
                    <div className="overflow-hidden w-10 h-10 rounded-md bg-gray-900 flex items-center justify-center">
                      <img
                        src={`/images/vbuilds/spellschools/${weaponState.context.infusion}.png`}
                        className={`spellSchool spellSchool-${weaponState.context.infusion} w-10 h-10`}
                      />
                    </div>
                  )}
                </h2>
                <h4 className="text-lg font-bold text-gray-100">
                  <h2 className="text-lg font-bold text-gray-100">
                    Weapon Slot {state.context.selectedWeaponSlot}
                  </h2>
                </h4>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-100">
              Select Infusion
            </h2>
            <InfusionSelect />
          </>
        )}
        {weaponState?.matches("pickEffect") && (
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div
                className={`relative border-2 ${
                  weaponState.context.weapon?.type === "legendary"
                    ? "border-orange-500"
                    : "border-purple-500"
                } rounded-md overflow-hidden`}
              >
                <img
                  src={weaponState.context.weapon?.img}
                  className="w-20 h-20"
                />
                {weaponState.context.infusion && (
                  <div className="overflow-hidden w-10 h-10 rounded-md bg-black/40 flex items-center justify-center absolute right-0 bottom-0 border-l-2 border-t-2 border-purple-500 rounded-bl-none rounded-tr-none">
                    <img
                      src={`/images/vbuilds/spellschools/${weaponState.context.infusion}.png`}
                      className={`spellSchool spellSchool-${weaponState.context.infusion} w-8 h-8`}
                    />
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-100 flex items-center gap-2">
                  {weaponState.context.weapon?.name}
                </h2>
                <h4 className="text-lg font-bold text-gray-100">
                  <h2 className="text-lg font-bold text-gray-100">
                    Weapon Slot {state.context.selectedWeaponSlot}
                  </h2>
                </h4>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <h2 className="text-3xl font-bold text-gray-100">
                Select Effects
              </h2>
              <WeaponEffectSelect />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
