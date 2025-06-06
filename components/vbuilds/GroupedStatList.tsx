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
      cap:
        stat.cap && finalValues["INCREASE_CAP"]?.[stat.name]
          ? customRound(
              stat.cap + Number(finalValues["INCREASE_CAP"][stat.name])
            )
          : stat.cap,
      finalValue: ["Physical Power", "Spell Power", "Movement Speed"].includes(
        stat.name
      )
        ? finalValues[stat.name] ?? stat.defaultValue
        : customRound(finalValues[stat.name]),
    });
  });

  return groupedStats;
}

// Helper function to round based on the first decimal
function customRound(value: number): number {
  if (value === undefined || isNaN(value)) return 0;

  // Get the first decimal place
  const firstDecimal = Math.abs(Math.floor((value * 10) % 10));

  // Round up if first decimal is 5 or higher, otherwise round down
  return firstDecimal >= 5 ? Math.ceil(value) : Math.floor(value);
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
