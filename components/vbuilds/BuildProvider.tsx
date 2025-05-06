"use client";
import { createActorContext } from "@xstate/react";
import { builder } from "@/components/machines/builder";

export const BuilderContext = createActorContext(builder);

export function useBuilder() {
  const actorRef = BuilderContext.useActorRef();
  const state = BuilderContext.useSelector((state) => state);

  return { state, builder: actorRef, send: actorRef.send };
}

export default function BuildProvider({
  children,
  stats,
}: {
  children: React.ReactNode;
  stats: any;
}) {
  return (
    <BuilderContext.Provider logic={builder} options={{ input: { stats } }}>
      {children}
    </BuilderContext.Provider>
  );
}
