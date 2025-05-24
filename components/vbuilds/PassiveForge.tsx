import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { PassiveList, Passive } from "./PassiveList";
import { PlusIcon } from "lucide-react";
import { useBuilder } from "./BuildProvider";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { useSelector } from "@xstate/react";

interface PassivePlaceholderProps {
  length: number;
}

export const PassivePlaceholder = ({ length }: PassivePlaceholderProps) => {
  const { builder } = useBuilder();
  const passives = useSelector(builder, (state) => state.context.passives);

  return (
    <div className="flex gap-4 justify-center bg-neutral-900 p-4 rounded-lg">
      {passives.map((passive: Passive) => (
        <img
          key={passive.id}
          src={passive.img}
          alt={passive.name}
          className={`w-16 h-16 object-contain rounded-full border-4 border-emerald-300"`}
        />
      ))}
      {Array.from({ length: length - passives.length }).map((_, index) => (
        <div
          key={`placeholder-${index}`}
          className="w-16 h-16 rounded-full border-4 border-dashed border-gray-500 flex items-center justify-center"
        >
          <PlusIcon className="w-8 h-8 text-gray-500" />
        </div>
      ))}
    </div>
  );
};

export const PassiveForge = () => {
  const [hoveredPassive, setHoveredPassive] = useState<Passive | null>(null);
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
          <PassivePlaceholder length={5} />
        </div>
      </DialogTrigger>
      <DialogContent className="w-full max-w-3xl" aria-describedby="Passives">
        <DialogDescription />
        <DialogTitle />
        <PassiveList setHoverPassive={setHoveredPassive} />

        {hoveredPassive && (
          <div className="space-y-1 w-96 absolute -right-[400px] bg-background rounded-lg p-4 border">
            <div className="flex items-center gap-4">
              {hoveredPassive.img && (
                <img
                  src={hoveredPassive.img}
                  alt={hoveredPassive.name}
                  className="w-12 h-12 mb-2 object-contain"
                />
              )}
              <h3 className="font-bold">{hoveredPassive.name}</h3>
            </div>
            <p className="text-sm">{hoveredPassive.description}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
