import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { PassiveList, Passive } from "./PassiveList";
import { PlusIcon } from "lucide-react";
import { useBuilder } from "./BuildProvider";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { useSelector } from "@xstate/react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";

interface PassivePlaceholderProps {
  length: number;
}

export const PassivePlaceholder = ({ length }: PassivePlaceholderProps) => {
  const { builder } = useBuilder();
  const passives = useSelector(builder, (state) => state.context.passives);

  return (
    <div className="flex gap-4 justify-center bg-zinc-900 p-2 rounded-lg select-none">
      {passives.map((passive: Passive) => (
        <img
          draggable={false}
          key={passive.id}
          src={passive.img}
          alt={passive.name}
          className="w-16 h-16 object-contain rounded-full border-4"
          onClick={() =>
            builder.send({ type: "REMOVE_PASSIVE", id: passive.id })
          }
        />
      ))}
      {Array.from({ length: length - passives.length }).map((_, index) => {
        return (
          <div
            key={`placeholder-${index}`}
            className="w-16 h-16 rounded-full border-4 border-dashed border-gray-500 flex items-center justify-center"
          >
            <PlusIcon className="w-8 h-8 text-gray-500" />
          </div>
        );
      })}
    </div>
  );
};

export const PassiveForge = () => {
  const { state, builder } = useBuilder();
  const passives = useSelector(builder, (state) => state.context.passives);
  return (
    <Dialog
      open={state.matches("passiveForge")}
      onOpenChange={(open) => {
        if (!open) {
          builder.send({ type: "goto.overview" });
        }
      }}
    >
      <DialogTrigger
        onClick={() => builder.send({ type: "goto.passiveForge" })}
      >
        <div className="flex gap-4">
          {passives.length > 0 ? (
            <HoverCard openDelay={0} closeDelay={0}>
              <HoverCardTrigger>
                <PassivePlaceholder length={5} />
              </HoverCardTrigger>
              <HoverCardContent className="w-[400px] p-4 text-gray-200 *:py-2 -my-2 divide-y-2">
                {passives.map((passive) => (
                  <div
                    className="flex justify-center items-center gap-2"
                    key={passive.id}
                  >
                    <img
                      src={passive.img}
                      alt={passive.name}
                      className="w-8 h-8 inline-block mr-2 rounded"
                    />
                    <div className="text-left space-y-1">
                      <p className="font-bold text-white">{passive.name}</p>
                      <p className="text-zinc-400 text-sm">
                        {passive.description}
                      </p>
                    </div>
                  </div>
                ))}
              </HoverCardContent>
            </HoverCard>
          ) : (
            <PassivePlaceholder length={5} />
          )}
        </div>
      </DialogTrigger>
      <DialogContent
        className="w-full max-w-2xl overflow-y-auto max-h-screen"
        aria-describedby="Passives"
      >
        <DialogDescription />
        <DialogTitle />
        <PassiveList />
      </DialogContent>
    </Dialog>
  );
};
