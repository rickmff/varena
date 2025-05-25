"use client";
import { createActorContext } from "@xstate/react";
import { builder } from "@/components/machines/builder";
import { useSearchParams } from "next/navigation";

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
  const searchParams = useSearchParams();
  let importCode = searchParams.get("build") || "";

  // Test Code
  // "60234061212340212342123431234110234g1234c0135s3135h496880135j3a86t513522222233"

  return (
    <BuilderContext.Provider
      logic={builder}
      options={{
        input: {
          stats,
          build: convertStringToBuild(importCode),
        },
      }}
    >
      {children}
    </BuilderContext.Provider>
  );
}
