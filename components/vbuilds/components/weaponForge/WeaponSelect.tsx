import legoWeaponData from "@/data/vbuilds/legendary-weapons.json";
import epicWeaponData from "@/data/vbuilds/epic-weapons.json";
import { WeaponData } from "@/components/vbuilds/WeaponForge";
import { useBuilder } from "../../BuildProvider";
import { useSelector } from "@xstate/react";
import { MAX_LEGENDARY_WEAPONS_COUNT } from "@/components/machines/builder";
export const WeaponSelect = () => {
  const { state, builder } = useBuilder();
  const weaponBuilder = useSelector(
    builder,
    (state) => state.children.weaponBuilder
  );

  const legendaryWeaponCount = useSelector(
    weaponBuilder,
    (state) => state?.context.legendaryWeaponCount
  );

  return (
    <div className="grid grid-cols-5 gap-4 mt-4">
      {/* Loop through legendary weapons */}
      {Object.values(legoWeaponData).map((weapon) => (
        <button
          onClick={() => {
            // onWeaponSelect(weapon);
            weaponBuilder?.send({
              type: "PICK_WEAPON",
              weapon: {
                name: weapon.name,
                id: weapon.id,
                position: state.context.selectedWeaponSlot!,
                type: "legendary",
                effects: [],
                img: weapon.img,
              },
            });
          }}
          key={weapon.id}
          className={`h-20 w-20 rounded bg-gray-800 flex items-center justify-center ${
            legendaryWeaponCount === MAX_LEGENDARY_WEAPONS_COUNT &&
            "opacity-50 cursor-not-allowed"
          }`}
        >
          <img
            src={weapon.img}
            alt={weapon.name}
            className="h-full w-full object-cover rounded"
          />
        </button>
      ))}
      {/* Loop through epic weapons */}
      {Object.values(epicWeaponData).map((weapon) => (
        <button
          key={weapon.id}
          onClick={() => {
            // onWeaponSelect(weapon);
            weaponBuilder?.send({
              type: "PICK_WEAPON",
              weapon: {
                name: weapon.name,
                id: weapon.id,
                position: state.context.selectedWeaponSlot!,
                type: "epic",
                effects: [],
                img: weapon.img,
              },
            });
          }}
          className="h-20 w-20 rounded bg-gray-800 flex items-center justify-center"
        >
          <img
            src={weapon.img}
            alt={weapon.name}
            className="h-full w-full object-cover rounded"
          />
        </button>
      ))}
    </div>
  );
};
