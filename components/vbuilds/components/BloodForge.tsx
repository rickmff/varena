import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "../../ui/dialog";
import { useBuilder } from "../BuildProvider";

export const BloodForge: React.FC = () => {
  const { state, send } = useBuilder();

  return (
    <div>
      <h1>BloodForge Component</h1>
      <Dialog
        open={state.matches("bloodForge")}
        onOpenChange={(open) => {
          if (!open) {
            send({ type: "goto.overview" });
          }
        }}
      >
        <DialogTrigger asChild>
          <button>Open Bloodforge</button>
        </DialogTrigger>
        <DialogContent>
          <div className="columns">
            <div className="column">
              <h2>Primary</h2>
            </div>
            <div className="column">
              <h2>Secondary</h2>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
