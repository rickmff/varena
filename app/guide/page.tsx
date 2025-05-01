"use client";

import stats from "@/data/vbuilds/stats.json";
import StatProvider from "@/components/vbuilds/StatProvider";
import { GroupedStatList } from "@/components/vbuilds/GroupedStatList";
import { AmuletList } from "@/components/vbuilds/AmuletList";
import { PassiveList } from "@/components/vbuilds/PassiveList";
import { WeaponSheet } from "@/components/vbuilds/WeaponSheet";
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

const GuidePage = () => {
  const baseStats = loadBaseStats(stats);
  return (
    <div className="p-8 bg-gray-900 min-h-screen text-gray-200 flex">
      <StatProvider stats={baseStats}>
        <GroupedStatList stats={stats} />
        <div className="w-3/4 pl-8">
          <h2 className="text-3xl font-bold text-gray-100 mb-4">Amulets</h2>
          <AmuletList />
          <h2 className="text-3xl font-bold text-gray-100 mb-4">Passives</h2>
          <PassiveList />
          <WeaponSheet />
        </div>
      </StatProvider>
    </div>
  );
}

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

export default GuidePage;
