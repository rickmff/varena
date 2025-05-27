"use client";

import { computeFinalStats } from "../machines/calculator";
import { StatList } from "./StatList";
import { useBuilder } from "./BuildProvider";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../ui/accordion";

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
    <Accordion
      type="multiple"
      defaultValue={["Core Attributes"]}
      className="bg-zinc-900 rounded-lg"
    >
      {Object.entries(groupedStats).map(
        ([category, statsArray], index, array) => (
          <AccordionItem
            key={category}
            value={category}
            className={`px-4 ${index + 1 == array.length ? "border-none" : ""}`}
          >
            <AccordionTrigger>{category}</AccordionTrigger>
            <AccordionContent>
              <StatList stats={statsArray} />
            </AccordionContent>
          </AccordionItem>
        )
      )}
    </Accordion>
  );
}
