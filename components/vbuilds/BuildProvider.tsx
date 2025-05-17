"use client";
import { createActorContext } from "@xstate/react";
import { builder } from "@/components/machines/builder";

export const BuilderContext = createActorContext(builder);

export function useBuilder() {
  const actorRef = BuilderContext.useActorRef();
  const state = BuilderContext.useSelector((state) => state);

  return { state, builder: actorRef, send: actorRef.send };
}

import { convertStringToBuild } from "../machines/converter";
import { useEffect } from "react";

export default function BuildProvider({
  children,
  stats,
}: {
  children: React.ReactNode;
  stats: any;
}) {
  useEffect(() => {}, []);

  return (
    <BuilderContext.Provider
      logic={builder}
      options={{
        input: {
          stats,
          build: convertStringToBuild(
            "6271n24t1234j1245312342k3238e0238q5128o3238d023880187p3782l3187144445a2"
          ),
        },
      }}
    >
      {children}
    </BuilderContext.Provider>
  );
}
