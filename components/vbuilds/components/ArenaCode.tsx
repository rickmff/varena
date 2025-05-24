import React from "react";
import { useBuilder } from "../BuildProvider";
import { exportVArenaCode } from "@/components/machines/converter";

const ArenaCode: React.FC = () => {
  const { state } = useBuilder();

  return (
    <div>
      {exportVArenaCode({
        elixir: state.context.elixir,
        coatings: state.context.coatings,
        passives: state.context.passives,
        spells: state.context.spells,
        weapons: state.context.weapons,
        amulet: state.context.amulet,
        armour: state.context.armour,
        blood: state.context.blood,
      })}
    </div>
  );
};

export default ArenaCode;
