"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
// import { SpellList, Spell } from "./SpellList";
import { PlusIcon } from "lucide-react";
import { useBuilder } from "./BuildProvider";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { useSelector } from "@xstate/react";
import spellData from "@/data/vbuilds/spells.json";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import SpellTabs from "./SpellTabs";
import { DashForge } from "./DashForge";
import { AddSpell } from "./JewelForge";
import UltimateForge from "./UltimateForge";

// export const SpellPlaceholder = () => {
//   const { builder } = useBuilder();
//   const spells = useSelector(builder, (state) => state.context.spells);

//   return (
//     <div className="flex gap-4 justify-center bg-neutral-900 p-4 rounded-lg">
//       {spells.map((spell: Spell) => (
//         <img
//           src={spell.img}
//           alt={spell.name}
//           className={`w-16 h-16 mb-2 object-contain rounded-full border-4 border-emerald-300"`}
//         />
//       ))}
//       {Array.from({ length: 5 - spells.length }).map((_, index) => (
//         <div
//           key={`placeholder-${index}`}
//           className="w-16 h-16 mb-2 rounded-full border-4 border-dashed border-gray-500 flex items-center justify-center"
//         >
//           <PlusIcon className="w-8 h-8 text-gray-500" />
//         </div>
//       ))}
//     </div>
//   );
// };

const SlotTrigger = ({
  children,
  goto,
}: {
  children?: React.ReactNode;
  goto: "dash" | "spell1" | "spell2" | "ultimate";
}) => {
  const { state, builder } = useBuilder();
  return (
    <SheetTrigger
      className="w-20 h-20 bg-gray-800 text-gray-200 rounded-md flex items-center justify-center relative overflow-hidden"
      onClick={() => builder.send({ type: `goto.spellForge.${goto}` })}
    >
      {children}
    </SheetTrigger>
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
      <img src={spells[slot].img} className="w-20 h-20" />
      <img
        src={`/images/vbuilds/jewels/jewel-${spells[slot].spellSchool}_tier4.webp`}
        className="absolute bottom-0 right-0 h-8 w-8"
      />
    </>
  );
};

export const SpellForge = () => {
  //   const [hoveredSpell, setHoveredSpell] = useState<Spell | null>(null);
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
        <SlotTrigger goto={"dash"}>
          {spells.dash ? (
            <SlotImage slot="dash" />
          ) : (
            <SlotPlaceholder
              placeholderImage="/images/vbuilds/spells/spell-blood-veil_of_blood.png"
              text="Veil"
            />
          )}
        </SlotTrigger>
        <SlotTrigger goto={"spell1"}>
          {spells.spell1 ? (
            <SlotImage slot="spell1" />
          ) : (
            <SlotPlaceholder
              placeholderImage="/images/vbuilds/spells/spell-blood-blood_rage.png"
              text="Spell 1"
            />
          )}
        </SlotTrigger>
        <SlotTrigger goto={"spell2"}>
          {spells.spell2 ? (
            <SlotImage slot="spell2" />
          ) : (
            <SlotPlaceholder
              placeholderImage="/images/vbuilds/spells/spell-blood-blood_rite.png"
              text="Spell 2"
            />
          )}
        </SlotTrigger>
        <SlotTrigger goto={"ultimate"}>
          {spells.ultimate ? (
            <img src={spells["ultimate"].img} className="w-16 h-16" />
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
        className="w-1/3 sm:max-w-3/4 p-8"
        aria-describedby="Spells"
      >
        <div className="flex justify-end">
          <SheetClose className="bg-red-500 px-3 py-2">EXIT</SheetClose>
        </div>
        <SheetTitle />
        {state.matches({ spellForge: "dash" }) && (
          <div>
            <h2 className="text-xl font-bold text-gray-100 mb-4">Veil</h2>
            <DashForge
              onAdd={({ spell, jewel }) => {
                console.log("Adding spell", spell, jewel);
                builder.send({ type: "ADD_SPELL", spell, slot: "dash", jewel });
              }}
            />
          </div>
        )}
        {state.matches({ spellForge: "spell1" }) && (
          <div>
            <h2 className="text-xl font-bold text-gray-100 mb-4">
              Spell slot 1
            </h2>
            <SpellTabs
              filter={filterOutSelectedSpells}
              onAdd={({ spell, jewel }) => {
                builder.send({
                  type: "ADD_SPELL",
                  spell,
                  slot: "spell1",
                  jewel,
                });
              }}
            />
          </div>
        )}
        {state.matches({ spellForge: "spell2" }) && (
          <div>
            <h2 className="text-xl font-bold text-gray-100 mb-4">
              Spell slot 2
            </h2>
            <SpellTabs
              filter={filterOutSelectedSpells}
              onAdd={({ spell, jewel }) => {
                builder.send({
                  type: "ADD_SPELL",
                  spell,
                  slot: "spell2",
                  jewel,
                });
              }}
            />
          </div>
        )}
        {state.matches({ spellForge: "ultimate" }) && (
          <div>
            <h2 className="text-xl font-bold text-gray-100 mb-4">
              Ultimate spell slot
            </h2>
            <UltimateForge />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
