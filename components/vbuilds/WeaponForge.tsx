import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { useSelector } from "@xstate/react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { useBuilder } from "./BuildProvider";
import { WeaponEffectSelect } from "./components/weaponForge/WeaponEffectSelect";
import { WeaponSelect } from "./components/weaponForge/WeaponSelect";

import epicWeaponData from "@/data/vbuilds/epic-weapons.json";
import weaponEffectData from "@/data/vbuilds/weaponEffects.json";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import { DropdownMenuContent } from "@radix-ui/react-dropdown-menu";
import { XIcon } from "lucide-react";
import { WeaponBuilderContext } from "../machines/weaponBuilder";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { InfusionSelect } from "./components/weaponForge/InfusionSelect";

export type AvailableWeaponSlots = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface Weapon {
  uuid: string; // Unique identifier for the weapon
  name: string; // Name of the weapon
  id: string; // Unique identifier for the weapon
  position: AvailableWeaponSlots; // Slot position (1 to 8)
  type: "legendary" | "epic"; // Weapon type
  effects: string[]; // List of effects for the weapon
  img: string;
  infusion?: string; // Infusion type (optional)
  arenaCode: string; // Arena code for the weapon
}

export type WeaponData = {
  id: string; // Unique identifier for the weapon
  name: string; // Name of the weapon
  img: string; // Image path for the weapon
  arenaCode: string; // Arena code for the weapon
};

export const FocusedWeapon = ({
  side = "bottom",
  align = "center",
}: {
  side?: "bottom" | "top" | "right" | "left" | undefined;
  align?: "start" | "center" | "end";
}) => {
  const { state, builder } = useBuilder();
  const focusedWeaponSlot = state.context.focusedWeapon;
  const weapons = state.context.weapons;
  const weapon = focusedWeaponSlot ? weapons.get(focusedWeaponSlot) : undefined;

  if (weapons.size === 0) {
    return null;
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="bg-zinc-900 px-2 py-1 rounded border hover:border-purple-500">
        {weapon ? (
          <div className="text-xs flex gap-1 items-center">
            <div
              className={`text-white ${
                weapon?.type === "legendary" && "text-orange-500"
              } ${weapon?.type === "epic" && "text-purple-500"}`}
            >
              Current Weapon
            </div>
            <img
              src={weapon?.img}
              className={`h-6 w-6 border rounded ${
                weapon?.type === "legendary"
                  ? "border-orange-500"
                  : "border-purple-500"
              }`}
            />
          </div>
        ) : (
          <div className="text-xs text-white h-6 flex items-center">
            Select Weapon
          </div>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="bg-zinc-900 z-50 w-80 rounded-md p-2 mt-2 mb-2 border"
        side={side}
        align={align}
      >
        {weapons
          .entries()
          .toArray()
          .map(([slot, weapon]) => (
            <DropdownMenuItem
              key={slot}
              // className="hover:bg-zinc-700"
              onSelect={() => builder.send({ type: "FOCUS_WEAPON", slot })}
            >
              <img src={weapon?.img} className="w-6 h-6 mr-2" />
              <span>{weapon.name}</span>
              <DropdownMenuShortcut>{slot}</DropdownMenuShortcut>
            </DropdownMenuItem>
          ))}
        <DropdownMenuItem
          // className="hover:bg-zinc-700"
          onSelect={() => builder.send({ type: "FOCUS_WEAPON", slot: null })}
        >
          <div className="flex items-center gap-4 text-red-500">
            <XIcon className="w-6 h-6 ml-2 " />
            Clear selected weapon
          </div>
          <DropdownMenuShortcut>0</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const HoverInfoCard = ({
  children,
  weapon,
  isDisabled,
}: {
  children: React.ReactNode;
  weapon: Weapon | undefined;
  isDisabled?: boolean;
}) => {
  if (!weapon || isDisabled) {
    return <>{children}</>;
  }
  return (
    <HoverCard openDelay={0} closeDelay={0}>
      <HoverCardTrigger>{children}</HoverCardTrigger>
      <HoverCardContent
        className="space-y-4 w-96"
        side="top"
        onFocus={(e) => e.preventDefault()}
      >
        <div className="flex gap-4 items-center">
          <div
            className={`relative rounded-md overflow-hidden w-10 h-10 border ${
              weapon?.type === "legendary"
                ? "border-orange-500"
                : "border-purple-500"
            }`}
          >
            <img src={weapon?.img} className="w-10 h-10" />
            {weapon.infusion && (
              <div className="overflow-hidden w-5 h-5 rounded-md bg-black/80 flex items-center justify-center absolute right-0 bottom-0 border-l-2 border-t-2 border-purple-500 rounded-bl-none rounded-tr-none">
                <img
                  src={`/images/vbuilds/spellschools/${weapon.infusion}.png`}
                  className={`spellSchool spellSchool-${weapon.infusion} w-4 h-4`}
                />
              </div>
            )}
          </div>
          <div>
            <div
              className={`capitalize font-bold ${
                weapon?.type === "legendary"
                  ? "text-orange-500"
                  : "text-purple-500"
              }`}
            >
              {weapon?.name}
            </div>
            <div
              className={`capitalize text-sm spellSchool-${weapon.infusion}`}
            >
              {weapon?.infusion}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {weapon?.effects
            .map((e) => weaponEffectData.find((data) => data.id === e))
            .map((effect) => (
              <div
                className="flex gap-4 items-center text-sm text-zinc-300"
                key={effect?.id}
              >
                <img
                  src="/images/vbuilds/attributes/Attribute_TierIndicator_5.png"
                  className="flex-grow-0 w-6 h-6"
                />
                <div>
                  {effect?.description} {effect?.modifiers[0].value}%
                </div>
              </div>
            ))}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

const SlotTrigger = ({
  children,
  slot,
  disableHoverCard,
}: {
  children?: React.ReactNode;
  slot: AvailableWeaponSlots;
  disableHoverCard: boolean;
}) => {
  const { state, builder } = useBuilder();

  const weaponInSlot = state.context.weapons.get(slot);

  return (
    <HoverInfoCard weapon={weaponInSlot} isDisabled={disableHoverCard}>
      <DialogTrigger
        id={`weapon-slot-${slot}`}
        className={`w-20 h-20 bg-zinc-900 text-gray-200 rounded-md flex items-center justify-center relative overflow-hidden border-2 hover:border-purple-500 transition-all duration-100 ${
          !weaponInSlot
            ? "border"
            : weaponInSlot.type === "legendary"
            ? "border-orange-500/60"
            : "border-purple-500/60"
        } ${
          state.context.focusedWeapon == slot ? "ring-2 ring-emerald-500" : ""
        }`}
        onClick={() => {
          builder.send({ type: `goto.weaponForge`, slot });
        }}
      >
        {children}
      </DialogTrigger>
    </HoverInfoCard>
  );
};

export const WeaponSlotPlaceholder: React.FC<{
  placeholderImage?: string;
  slot: AvailableWeaponSlots;
}> = ({ placeholderImage, slot }) => {
  const { state } = useBuilder();
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
  const weaponsArray = useSelector(builder, (state) =>
    new Array(8).fill(null).map((_, i) => {
      const slot = (i + 1) as AvailableWeaponSlots;

      const weapon = state.context.weapons.get(slot);
      return {
        id: weapon?.uuid || `slot-${slot}`,
      };
    })
  );

  const weaponState = useSelector(weaponSelector, (state) => state as any) as {
    matches: (value: string) => boolean;
    context: WeaponBuilderContext;
  };

  const selectedEffects = useSelector(weaponSelector, (state) => {
    if (state && "context" in state) {
      return state.context.effects;
    }
    return [];
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = weaponsArray.findIndex((item) => item.id == active.id);
      const newIndex = weaponsArray.findIndex((item) => item.id == over?.id);
      const newOrder = arrayMove(weaponsArray, oldIndex, newIndex);

      builder.send({
        type: "MOVE_WEAPON",
        order: newOrder,
        to: (newIndex + 1) as AvailableWeaponSlots,
      });
    }
  }

  return (
    <DndContext
      onDragEnd={handleDragEnd}
      sensors={sensors}
      modifiers={[restrictToHorizontalAxis]}
      id={"weapon-forge"}
    >
      <Dialog
        open={state.matches("weaponForge")}
        onOpenChange={(open) => {
          if (!open) {
            builder.send({ type: "goto.overview" });
          }
        }}
      >
        <SortableContext
          items={weaponsArray}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex gap-4 flex-wrap">
            {weaponsArray.map((weapon, index) => (
              <SortableItem
                key={weapon.id}
                id={weapon.id}
                index={index}
                weapon={weapon}
              />
            ))}
          </div>
        </SortableContext>
        <DialogContent
          className="w-full max-w-4xl"
          aria-describedby="Weapon Forge"
          onCloseAutoFocus={(e) => {
            e.preventDefault();
          }}
        >
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
                      <div className="overflow-hidden w-10 h-10 rounded-md bg-zinc-900 flex items-center justify-center">
                        <img
                          src={`/images/vbuilds/spellschools/${weaponState.context.infusion}.png`}
                          className={`spellSchool spellSchool-${weaponState.context.infusion} w-10 h-10`}
                        />
                      </div>
                    )}
                  </h2>
                  <h4 className="text-lg font-bold text-gray-100">
                    Weapon Slot {state.context.selectedWeaponSlot}
                  </h4>
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-3 text-red-400 flex items-center">
                <span className="mr-2">Select Infusion</span>
              </h3>
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

                  <h2 className="text-lg font-bold text-gray-100">
                    Weapon Slot {state.context.selectedWeaponSlot}
                  </h2>
                </div>
                <div className="flex gap-4 justify-end ml-auto">
                  <Button
                    variant={"outline"}
                    className="border-zinc-800 text-white"
                    onClick={() => {
                      weaponSelector?.send({ type: "goto.pickWeapon" });
                    }}
                  >
                    Change Weapon
                  </Button>
                  {state.context.weapons.has(
                    state.context.selectedWeaponSlot as AvailableWeaponSlots
                  ) && (
                    <Button
                      variant={"outline"}
                      className="border-red-500 text-red-500 hover:bg-red-500/10"
                      onClick={() => {
                        builder.send({
                          type: "REMOVE_WEAPON",
                          position: state.context
                            .selectedWeaponSlot as AvailableWeaponSlots,
                        });
                      }}
                    >
                      Clear Weapon Slot
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-semibold mb-3 text-red-400 flex items-center">
                  <span className="mr-2">Select Effects</span>
                  <div
                    className={`${
                      selectedEffects.length === 3
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    } text-xs px-2 py-1 rounded-full`}
                  >
                    Choose 3 Effects
                  </div>
                </h3>
                <WeaponEffectSelect />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DndContext>
  );
};

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React from "react";

export function SortableItem(props) {
  console.log(props);
  const {
    isSorting,
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    activeIndex,
  } = useSortable({ id: props.id, disabled: props.id.includes("slot") });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: props.index == activeIndex ? 1000 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <SlotTrigger
        disableHoverCard={isSorting}
        key={props.index}
        slot={(props.index + 1) as AvailableWeaponSlots}
      >
        <WeaponSlotPlaceholder
          placeholderImage={Object.values(epicWeaponData)[props.index].img}
          slot={(props.index + 1) as AvailableWeaponSlots}
        />
      </SlotTrigger>
    </div>
  );
}
