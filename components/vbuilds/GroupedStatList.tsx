"use client";

import { computeFinalStats } from "../machines/calculator";
import { StatList } from "./StatList";
import { StatProviderContext } from "./StatProvider";

export function groupStatsByCategoryWithValues(
  flatStats: Record<string, any>,
  finalValues: Record<string, number>
) {
  const groupedStats: Record<string, any[]> = {};

  Object.values(flatStats).forEach((stat) => {
    if (!groupedStats[stat.category]) {
      groupedStats[stat.category] = [];
    }
    groupedStats[stat.category].push({
      ...stat,
      finalValue: finalValues[stat.name] ?? stat.defaultValue,
    });
  });

  return groupedStats;
}

export function GroupedStatList({ stats }: { stats: Record<string, any> }) {
  const context = StatProviderContext.useSelector((state) => state.context);
  const finalStats = computeFinalStats(context);
  const groupedStats = groupStatsByCategoryWithValues(stats, finalStats);

  //   console.log("B Spell Power", context.baseStats["Spell Power"].defaultValue);
  //   console.log(
  //     "B Blood Drain Reduction",
  //     context.baseStats["Blood Drain Reduction"].defaultValue
  //   );
  //   console.log("B Attack Speed", context.baseStats["Attack Speed"].defaultValue);
  //   console.log("F Spell Power", finalStats["Spell Power"]);
  //   console.log("F Blood Drain Reduction", finalStats["Blood Drain Reduction"]);
  //   console.log("F Attack Speed", finalStats["Attack Speed"]);
  //   console.log("Sources", context.activeSources);

  return (
    <div className="w-1/4">
      {Object.entries(groupedStats).map(([category, statsArray]) => (
        <div key={category} className="mb-12">
          <h2 className="text-3xl font-bold text-gray-100 mb-4">{category}</h2>
          <StatList stats={statsArray} />
        </div>
      ))}
    </div>
  );
}
