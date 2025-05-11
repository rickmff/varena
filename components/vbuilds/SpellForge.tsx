"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { SpellList, Spell } from "./SpellList";
import { PlusIcon } from "lucide-react";
import { useBuilder } from "./BuildProvider";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { useSelector } from "@xstate/react";

export const SpellPlaceholder = () => {
  const { builder } = useBuilder();
  const spells = useSelector(builder, (state) => state.context.spells);

  return (
    <div className="flex gap-4 justify-center bg-neutral-900 p-4 rounded-lg">
      {spells.map((spell: Spell) => (
        <img
          src={spell.img}
          alt={spell.name}
          className={`w-16 h-16 mb-2 object-contain rounded-full border-4 border-emerald-300"`}
        />
      ))}
      {Array.from({ length: 5 - spells.length }).map((_, index) => (
        <div
          key={`placeholder-${index}`}
          className="w-16 h-16 mb-2 rounded-full border-4 border-dashed border-gray-500 flex items-center justify-center"
        >
          <PlusIcon className="w-8 h-8 text-gray-500" />
        </div>
      ))}
    </div>
  );
};

export const SpellForge = () => {
  //   const [hoveredSpell, setHoveredSpell] = useState<Spell | null>(null);
  const { state, builder } = useBuilder();
  const spells = useSelector(builder, (state) => state.context.spells);
  return (
    <Dialog
      open={state.matches("spellForge")}
      onOpenChange={(open) => {
        if (!open) {
          builder.send({ type: "goto.overview" });
        }
      }}
    >
      <DialogTrigger onClick={() => builder.send({ type: "goto.spellForge" })}>
        <div className="flex gap-4 h-16 w-16 bg-red-500"></div>
      </DialogTrigger>
      <DialogContent className="w-full max-3/4" aria-describedby="Spells">
        <DialogDescription />
        <DialogTitle />
        <SpellList />
      </DialogContent>
    </Dialog>
  );
};
