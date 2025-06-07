import { Checkbox } from "@/components/ui/checkbox";
import weaponEffectData from "@/data/vbuilds/weaponEffects.json";
import { useBuilder } from "../../BuildProvider";
import { useSelector } from "@xstate/react";
import { Button } from "@/components/ui/button";
import { AvailableWeaponSlots } from "../../WeaponForge";
export const WeaponEffectSelect = () => {
  const { builder } = useBuilder();

  const state = useSelector(builder, (state) => state);

  const weaponBuilder = useSelector(
    builder,
    (state) => state.children.weaponBuilder
  );

  const selectedEffects = useSelector(weaponBuilder, (state) => {
    if (state && "context" in state) {
      return state.context.effects;
    }
    return [];
  });

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4">
        {weaponEffectData.map((effect) => (
          <label
            key={effect.key}
            className="flex items-center gap-2 cursor-pointer"
            htmlFor={effect.id}
          >
            <Checkbox
              id={effect.id}
              className="peer form-checkbox"
              checked={selectedEffects.includes(effect.id)}
              disabled={
                !selectedEffects.includes(effect.id) &&
                selectedEffects.length >= 3
              }
              onCheckedChange={(checked) => {
                weaponBuilder?.send({
                  type: checked ? "ADD_EFFECT" : "REMOVE_EFFECT",
                  effectId: effect.id,
                });
              }}
            />
            <span className="peer-disabled:text-gray-400">
              {effect.description} by {effect.modifiers[0].value}%
            </span>
          </label>
        ))}
      </div>
      <Button
        variant="outline"
        className="w-full text-white relative overflow-hidden group border-red-900/70 bg-red-900/50 hover:bg-red-800"
        onClick={() => weaponBuilder?.send({ type: "ADD_WEAPON" })}
        disabled={selectedEffects.length !== 3}
      >
        {state.context.weapons.has(
          state.context.selectedWeaponSlot as AvailableWeaponSlots
        )
          ? "UPDATE WEAPON SLOT"
          : "ADD WEAPON"}
      </Button>
    </div>
  );
};
