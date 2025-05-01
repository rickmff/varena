"use client";
import { createActorContext } from "@xstate/react";
import { calculator } from "@/components/machines/calculator";

export const StatProviderContext = createActorContext(calculator);

export default function StatProvider({
  children,
  stats,
}: {
  children: React.ReactNode;
  stats: any;
}) {
  return (
    <StatProviderContext.Provider
      logic={calculator}
      options={{ input: { stats } }}
    >
      {children}
    </StatProviderContext.Provider>
  );
}
