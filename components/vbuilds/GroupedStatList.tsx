"use client";

import { computeFinalStats } from "../machines/builder";
import { StatList } from "./StatList";
import { useBuilder } from "./BuildProvider";

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
  const { state } = useBuilder();

  const finalStats = computeFinalStats(state.context);
  const groupedStats = groupStatsByCategoryWithValues(stats, finalStats);

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
