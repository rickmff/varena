"use client";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetBody,
  SheetFooter,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

// const statmods = new Map<
//   string,
//   { id: string; key: string; description: string }
// >([
//   [
//     "StatMod_AttackSpeed",
//     {
//       id: "StatMod_AttackSpeed",
//       key: "1",
//       description: "Increases attack speed",
//     },
//   ],
//   [
//     "StatMod_CriticalStrikePhysical",
//     {
//       id: "StatMod_CriticalStrikePhysical",
//       key: "2",
//       description: "Improves physical critical strike chance",
//     },
//   ],
//   [
//     "StatMod_CriticalStrikePhysicalPower",
//     {
//       id: "StatMod_CriticalStrikePhysicalPower",
//       key: "3",
//       description: "Enhances physical critical strike power",
//     },
//   ],
//   [
//     "StatMod_CriticalStrikeSpellPower",
//     {
//       id: "StatMod_CriticalStrikeSpellPower",
//       key: "4",
//       description: "Boosts spell critical strike power",
//     },
//   ],
//   [
//     "StatMod_CriticalStrikeSpells",
//     {
//       id: "StatMod_CriticalStrikeSpells",
//       key: "5",
//       description: "Increases spell critical strike chance",
//     },
//   ],
//   [
//     "StatMod_MaxHealth",
//     {
//       id: "StatMod_MaxHealth",
//       key: "6",
//       description: "Increases maximum health",
//     },
//   ],
//   [
//     "StatMod_MovementSpeed",
//     {
//       id: "StatMod_MovementSpeed",
//       key: "7",
//       description: "Improves movement speed",
//     },
//   ],
//   [
//     "StatMod_PhysicalPower",
//     {
//       id: "StatMod_PhysicalPower",
//       key: "8",
//       description: "Enhances physical power",
//     },
//   ],
//   [
//     "StatMod_SpellCooldownReduction",
//     {
//       id: "StatMod_SpellCooldownReduction",
//       key: "9",
//       description: "Reduces spell cooldowns",
//     },
//   ],
//   [
//     "StatMod_SpellLeech",
//     {
//       id: "StatMod_SpellLeech",
//       key: "A",
//       description: "Grants spell leech ability",
//     },
//   ],
//   [
//     "StatMod_SpellPower",
//     {
//       id: "StatMod_SpellPower",
//       key: "B",
//       description: "Increases spell power",
//     },
//   ],
//   [
//     "StatMod_TravelCooldownReduction",
//     {
//       id: "StatMod_TravelCooldownReduction",
//       key: "C",
//       description: "Reduces veil cooldowns",
//     },
//   ],
//   [
//     "StatMod_WeaponCooldownReduction",
//     {
//       id: "StatMod_WeaponCooldownReduction",
//       key: "D",
//       description: "Reduces weapon cooldowns",
//     },
//   ],
//   [
//     "StatMod_WeaponSkillPower",
//     {
//       id: "StatMod_WeaponSkillPower",
//       key: "E",
//       description: "Enhances weapon skill power",
//     },
//   ],
// ]);

const mods = [
  {
    id: "StatMod_AttackSpeed",
    key: "1",
    description: "Increases attack speed",
  },

  {
    id: "StatMod_CriticalStrikePhysical",
    key: "2",
    description: "Improves physical critical strike chance",
  },

  {
    id: "StatMod_CriticalStrikePhysicalPower",
    key: "3",
    description: "Enhances physical critical strike power",
  },

  {
    id: "StatMod_CriticalStrikeSpellPower",
    key: "4",
    description: "Boosts spell critical strike power",
  },

  {
    id: "StatMod_CriticalStrikeSpells",
    key: "5",
    description: "Increases spell critical strike chance",
  },
  {
    id: "StatMod_MaxHealth",
    key: "6",
    description: "Increases maximum health",
  },

  {
    id: "StatMod_MovementSpeed",
    key: "7",
    description: "Improves movement speed",
  },

  {
    id: "StatMod_PhysicalPower",
    key: "8",
    description: "Enhances physical power",
  },

  {
    id: "StatMod_SpellCooldownReduction",
    key: "9",
    description: "Reduces spell cooldowns",
  },

  {
    id: "StatMod_SpellLeech",
    key: "A",
    description: "Grants spell leech ability",
  },

  {
    id: "StatMod_SpellPower",
    key: "B",
    description: "Increases spell power",
  },

  {
    id: "StatMod_TravelCooldownReduction",
    key: "C",
    description: "Reduces veil cooldowns",
  },

  {
    id: "StatMod_WeaponCooldownReduction",
    key: "D",
    description: "Reduces weapon cooldowns",
  },

  {
    id: "StatMod_WeaponSkillPower",
    key: "E",
    description: "Enhances weapon skill power",
  },
];

export const WeaponSheet = ({ }) => {
  return (
    <Sheet>
      <SheetTrigger className="bg-red-500">Weapon Select</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <div className="flex gap-2">
            <div className="w-20 h-20 bg-red-500 rounded"></div>
            <div className="w-20 h-20 bg-yellow-500 rounded"></div>
            <div className="w-20 h-20 bg-blue-500 rounded"></div>
          </div>
        </SheetHeader>
        <SheetBody>
          <div className="flex flex-col gap-3">
            {mods.map((mod) => (
              <label key={mod.key} className="flex items-center gap-2">
                <Checkbox className="form-checkbox" />
                <span>
                  {mod.key}. {mod.description}
                </span>
              </label>
            ))}
          </div>
        </SheetBody>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Save changes</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
