"use client";
import React, { useState } from "react";
import { useBuilder } from "./BuildProvider";
import { useSelector } from "@xstate/react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import SpellTabs from "./SpellTabs";
import { DashForge } from "./DashForge";
import { Spell, SpellWithJewel } from "./JewelForge";
import UltimateForge from "./UltimateForge";

import {
  HoverCardTrigger,
  HoverCard,
  HoverCardContent,
  HoverCardTitle,
} from "../ui/hover-card";
import { Button } from "../ui/button";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";

const SlotTrigger = ({
  children,
  goto,
  hasSelection,
  hoverIsDisabled = false,
}: {
  children?: React.ReactNode;
  goto: "dash" | "spell1" | "spell2" | "ultimate";
  hasSelection: boolean;
  hoverIsDisabled?: boolean;
}) => {
  const { state, builder } = useBuilder();

  if (goto === "ultimate" || !hasSelection) {
    return (
      <SheetTrigger
        className="w-20 h-20 bg-zinc-900 text-gray-200 rounded-md flex items-center justify-center relative overflow-hidden border hover:border-purple-500 transition-all duration-100"
        onClick={() => builder.send({ type: `goto.spellForge.${goto}` })}
      >
        {children}
      </SheetTrigger>
    );
  }

  const spell = state.context.spells[goto] as SpellWithJewel;

  if (hoverIsDisabled) {
    return (
      <>
        <SheetTrigger
          className="w-20 h-20 bg-zinc-900 text-gray-200 rounded-md flex items-center justify-center relative overflow-hidden border hover:border-purple-500 transition-all duration-100"
          onClick={() => builder.send({ type: `goto.spellForge.${goto}` })}
        >
          {children}
        </SheetTrigger>
      </>
    );
  }

  return (
    <HoverCard openDelay={0} closeDelay={0}>
      <HoverCardTrigger>
        <SheetTrigger
          className="w-20 h-20 bg-zinc-900 text-gray-200 rounded-md flex items-center justify-center relative overflow-hidden border hover:border-purple-500 transition-all duration-100"
          onClick={() => builder.send({ type: `goto.spellForge.${goto}` })}
        >
          {children}
        </SheetTrigger>
      </HoverCardTrigger>
      <HoverCardContent className="w-96 flex flex-col gap-4 z-[100]">
        <>
          <div className="flex items-center gap-4">
            <div className="relative w-10 h-10 rounded overflow-hidden">
              <img src={spell.img} className="w-10 h-10  select-none" />
              <img
                src={`/images/vbuilds/jewels/jewel-${spell.spellSchool}_tier4.webp`}
                className="absolute bottom-0 right-0 h-4 w-4"
              />
            </div>
            <span className={`spellSchool-${spell.spellSchool} font-bold`}>
              {spell.name}
            </span>
          </div>
          {spell?.jewel?.map((jewel: number, index: number) => {
            const effect = spell?.effects?.find(
              (effect: any) => effect.key == jewel
            );
            return (
              <div key={`${jewel}-${index}`}>
                <div className="flex gap-4 items-center text-sm text-zinc-300">
                  <img
                    src={
                      !effect || effect.max === null
                        ? "/images/vbuilds/attributes/Attribute_TierIndicator_Fixed.png"
                        : "/images/vbuilds/attributes/Attribute_TierIndicator_5.png"
                    }
                    className="flex-grow-0 w-6 h-6"
                  />
                  <div>{effect?.description}</div>
                </div>
              </div>
            );
          })}
        </>
      </HoverCardContent>
    </HoverCard>
  );
};

const SlotPlaceholder = ({
  placeholderImage,
  text,
}: {
  placeholderImage: string;
  text: string;
}) => {
  return (
    <div className="relative">
      <img
        src={placeholderImage}
        alt="Select Spell"
        className={`grayscale brightness-50 pointer-events-none opacity-60`}
      />
      <span className="absolute inset-0 flex items-center justify-center text-white">
        {text}
      </span>
    </div>
  );
};

const SlotImage = ({ slot }: { slot: "dash" | "spell1" | "spell2" }) => {
  const { state, builder } = useBuilder();
  const spells = useSelector(builder, (state) => state.context.spells);
  return (
    <>
      <img src={spells[slot].img} className="w-20 h-20" draggable={false} />
      <img
        src={`/images/vbuilds/jewels/jewel-${spells[slot].spellSchool}_tier4.webp`}
        className="absolute bottom-0 right-0 h-8 w-8"
        draggable={false}
      />
    </>
  );
};

const sectionTitle = {
  dash: "Veil",
  spell1: "Spell 1",
  spell2: "Spell 2",
  ultimate: "Ultimate",
  idle: "Spells",
};

interface SortableItemProps {
  id: string;
  trigger: (props: { isSorting: boolean }) => React.ReactNode;
}

function SortableItem({ id, trigger }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isSorting,
  } = useSortable({ id: id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {trigger({ isSorting })}
    </div>
  );
}

const DndSlots = ({ }) => {
  const { state, builder } = useBuilder();
  const spells = useSelector(builder, (state) => state.context.spells);
  const [items, setItems] = useState<UniqueIdentifier[]>(["spell1", "spell2"]);
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
      const oldIndex = items.indexOf(active.id);
      if (over) {
        const newIndex = items.indexOf(over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        setItems(newOrder);
        builder.send({
          type: "SWAP_SPELLS",
        });
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      modifiers={[restrictToHorizontalAxis]}
      onDragEnd={handleDragEnd}
      id="spell-forge"
    >
      <SortableContext items={items} strategy={horizontalListSortingStrategy}>
        <SortableItem
          id={"spell1"}
          trigger={({ isSorting }: { isSorting: boolean }) => {
            return (
              <SlotTrigger
                goto={"spell1"}
                hasSelection={spells.spell1}
                hoverIsDisabled={isSorting}
              >
                {spells.spell1 ? (
                  <SlotImage slot="spell1" />
                ) : (
                  <SlotPlaceholder
                    placeholderImage="/images/vbuilds/spells/spell-blood-blood_rage.png"
                    text="Spell 1"
                  />
                )}
              </SlotTrigger>
            );
          }}
        ></SortableItem>
        <SortableItem
          id={"spell2"}
          trigger={({ isSorting }: { isSorting: boolean }) => {
            return (
              <SlotTrigger
                goto={"spell2"}
                hasSelection={spells.spell2}
                hoverIsDisabled={isSorting}
              >
                {spells.spell2 ? (
                  <SlotImage slot="spell2" />
                ) : (
                  <SlotPlaceholder
                    placeholderImage="/images/vbuilds/spells/spell-blood-blood_rite.png"
                    text="Spell 2"
                  />
                )}
              </SlotTrigger>
            );
          }}
        ></SortableItem>
      </SortableContext>
    </DndContext>
  );
};

export const SpellForge = () => {
  const { state, builder } = useBuilder();
  const spells = useSelector(builder, (state) => state.context.spells);

  const filterOutSelectedSpells = (spell: any) => {
    return (
      (!spells.spell1 || spells.spell1.id !== spell.id) &&
      (!spells.spell2 || spells.spell2.id !== spell.id)
    );
  };
  return (
    <Sheet
      open={state.matches("spellForge")}
      onOpenChange={(open) => {
        if (!open) {
          builder.send({ type: "goto.overview" });
        }
      }}
    >
      <div className="flex gap-4 ">
        <SlotTrigger goto={"dash"} hasSelection={spells.dash}>
          {spells.dash ? (
            <SlotImage slot="dash" />
          ) : (
            <SlotPlaceholder
              placeholderImage="/images/vbuilds/spells/spell-blood-veil_of_blood.png"
              text="Veil"
            />
          )}
        </SlotTrigger>
        <DndSlots />
        <SlotTrigger goto={"ultimate"} hasSelection={spells.ultimate}>
          {spells.ultimate ? (
            <HoverCard openDelay={0} closeDelay={0}>
              <HoverCardTrigger>
                <img
                  src={spells["ultimate"].img}
                  className="w-20 h-20"
                  draggable={false}
                />
              </HoverCardTrigger>
              <HoverCardContent>
                <HoverCardTitle>
                  <span
                    className={`spellSchool-${spells.ultimate.spellSchool} font-bold`}
                  >
                    {spells.ultimate.name}
                  </span>
                </HoverCardTitle>
              </HoverCardContent>
            </HoverCard>
          ) : (
            <SlotPlaceholder
              placeholderImage="/images/vbuilds/spells/spell-chaos-merciless_charge.png"
              text="Ultimate"
            />
          )}
        </SlotTrigger>
      </div>
      <SheetContent
        showCloseButton={false}
        className="w-1/3 sm:max-w-3/4 h-screen overflow-hidden flex flex-col"
        aria-describedby="Spells"
      >
        <div className="flex items-center justify-between px-8 pt-8">
          <h3 className="text-2xl font-semibold mb-3 text-red-400 flex items-center">
            <span className="mr-2">
              {(() => {
                const currentState =
                  typeof state.value === "object"
                    ? state.value.spellForge
                    : "dash";
                return (
                  sectionTitle[currentState as keyof typeof sectionTitle] ||
                  "Spells"
                );
              })()}
            </span>
          </h3>
          <SheetClose asChild>
            <Button variant="outline">EXIT</Button>
          </SheetClose>
        </div>
        <SheetTitle />
        <div className="overflow-auto px-8 pb-8">
          {state.matches({ spellForge: "dash" }) && (
            <DashForge
              onAdd={({ spell, jewel }) => {
                builder.send({ type: "ADD_SPELL", spell, slot: "dash", jewel });
              }}
            />
          )}
          {state.matches({ spellForge: "spell1" }) && (
            <SpellTabs
              filter={(spell: Spell) => {
                return spell.id !== spells.spell2?.id;
              }}
              spell={spells.spell1}
              onAdd={({ spell, jewel }) => {
                builder.send({
                  type: "ADD_SPELL",
                  spell,
                  slot: "spell1",
                  jewel,
                });
              }}
            />
          )}
          {state.matches({ spellForge: "spell2" }) && (
            <SpellTabs
              filter={(spell: Spell) => {
                return spell.id !== spells.spell1?.id;
              }}
              spell={spells.spell2}
              onAdd={({ spell, jewel }) => {
                builder.send({
                  type: "ADD_SPELL",
                  spell,
                  slot: "spell2",
                  jewel,
                });
              }}
            />
          )}
          {state.matches({ spellForge: "ultimate" }) && <UltimateForge />}
        </div>
      </SheetContent>
    </Sheet>
  );
};
