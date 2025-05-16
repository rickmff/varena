"use client";

import stats from "@/data/vbuilds/stats.json";
import BuildProvider from "@/components/vbuilds/BuildProvider";
import { GroupedStatList } from "@/components/vbuilds/GroupedStatList";
import { AmuletPicker } from "@/components/vbuilds/AmuletPicker";
import { WeaponSheet } from "@/components/vbuilds/WeaponSheet";
import { ArmourPicker } from "@/components/vbuilds/ArmourPicker";
import { CoatingPicker } from "@/components/vbuilds/CoatingPicker";
import { ElixerPicker } from "./ElixirPicker";
import { PassiveForge, PassivePlaceholder } from "./PassiveForge";
import { SpellForge } from "./SpellForge";
import { WeaponForge } from "./WeaponForge";
import { BloodForge } from "./BloodForge";
// import { flattenBaseStats } from "../machines/calculator";

// Base
// Chest, Legs Boots, Gloves, Cape, Bag
// 180  + (262 + 21)  + (218 + 18) + (188 + 15) +  (144 + 11) + (24 + 2)  + 42

export function loadBaseStats(statsArray: any): any {
  const statMap = {} as any;

  for (const stat of statsArray) {
    statMap[stat.name] = stat;
  }

  return statMap;
}

const BuilderPage = (user: any) => {
  const baseStats = loadBaseStats(stats);
  return (
    <div className="p-8  text-gray-200 flex">
      {/* <div className="absolute inset-0 bg-[url('/flower.png')] bg-cover bg-center grayscale -z-10 opacity-0"></div> */}
      <BuildProvider stats={baseStats}>
        {/* <GroupedStatList stats={stats} /> */}
        <div className="w-3/4 pl-8 flex flex-col gap-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-100 mb-4">Build</h2>
            <div className="flex gap-4">
              <ArmourPicker />
              <AmuletPicker />
              <ElixerPicker />
              <CoatingPicker />
              <BloodForge />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-100 mb-4">Spells</h2>
            <SpellForge />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-100 mb-4">Passives</h2>
            <PassiveForge />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-100 mb-4">Weapons</h2>
            <WeaponForge />
          </div>
        </div>
      </BuildProvider>
      {/* <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent to-black "></div> */}
    </div>
  );
};

// {
//   bp: [{ primary: "rogue", secondary: "warrior", fusion: 3 }],
//   elixir: "elixir_of_the_archmage",
//   amulet: "archmage",
//   armor: "shadowmoon",
//   spells: [
//     { id: "spell_1",  jewel: [1, 2, 3, 4] },
//     { id: "spell_1",  jewel: [1, 2, 3, 4] },
//     { id: "spell_1",  jewel: [1, 2, 3, 4] },
//   ],
//   passives: [
//     { id: "passive_1",  },
//     { id: "passive_2",  },
//     { id: "passive_3",},
//     { id: "passive_4", },
//     { id: "passive_5" },
//   ],
//   weapons: [
//     {id: "sword", type: "static",  attributes: [1, 2, 3, 4]},
//   ]
// }

export default BuilderPage;
