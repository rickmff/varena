import { Checkbox } from "@/components/ui/checkbox";
import weaponEffectData from "@/data/vbuilds/weaponEffects.json";
import { useBuilder } from "../../BuildProvider";
import { useSelector } from "@xstate/react";
import { Button } from "@/components/ui/button";
export const WeaponEffectSelect = () => {
  const { builder } = useBuilder();
  const weaponBuilder = useSelector(
    builder,
    (state) => state.children.weaponBuilder
  );

  const selectedEffects = useSelector(
    weaponBuilder,
    (state) => state!.context.effects
  );

  return (
    <div>
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
              {effect.description}
            </span>
          </label>
        ))}
      </div>
      <Button
        onClick={() => weaponBuilder?.send({ type: "ADD_WEAPON" })}
        disabled={selectedEffects.length !== 3}
        className="mt-4"
      >
        Add Weapon
      </Button>
    </div>
  );
};
