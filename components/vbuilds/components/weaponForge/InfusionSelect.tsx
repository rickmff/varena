import infusionData from "@/data/vbuilds/infusions.json";
import { useBuilder } from "../../BuildProvider";
import { useSelector } from "@xstate/react";

const infusionList = Object.values(infusionData).map((infusion) => infusion);

export const InfusionSelect = ({}) => {
  const { state, builder } = useBuilder();
  const weaponBuilder = useSelector(
    builder,
    (state) => state.children.weaponBuilder
  );

  return (
    <div className="grid grid-cols-6 gap-4">
      {infusionList.map((infusion) => (
        <button
          key={infusion.id}
          className="flex items-center justify-center p-2 overflow-hidden h-20 w-20 rounded bg-gray-800"
          onClick={() => {
            weaponBuilder!.send({
              type: "PICK_INFUSION",
              infusion: infusion.id,
            });
          }}
        >
          <img
            src={`/images/vbuilds/spellschools/${infusion.id}.png`}
            className={`spellSchool spellSchool-${infusion.id} w-12 h-12`}
          />
        </button>
      ))}
    </div>
  );
};
