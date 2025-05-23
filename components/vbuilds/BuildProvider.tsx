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
  useEffect(() => {}, []);
  // console.log("searchParams", searchParams.get("build"));
  //old 6271n24t1234j1245312342k3238e0238q5128o3238d023880187p3782l3187144445a2

  const elixir = "6";
  const coatings = "02340612";
  const passives = "10234";
  const spells = "2123421234312341";
  // const weapons = [
  //   "10234",
  //   "g1234",
  //   "10234",
  //   "10234",
  //   "10234",
  //   "10234",
  //   "10234",
  //   "10234",
  // ];

  const weapons = [
    "10234",
    "g1234",
    "c0135",
    "s3135",
    "h4968",
    "80135",
    "j3a86",
    "t5135",
  ];

  const amulet = "2";

  const armour = "2222";

  const blood = "233";

  const build =
    elixir +
    coatings +
    passives +
    spells +
    weapons.join("") +
    amulet +
    armour +
    blood;
  return (
    <BuilderContext.Provider
      logic={builder}
      options={{
        input: {
          stats,
          build: convertStringToBuild(
            // "0".repeat(78)
            "6023406121234fl12343123421234310234g1234c0135s3135h496880135j3a86t513524444522"
            // "60234061212340212342123431234110234g1234c0135s3135h496880135j3a86t513522222233"
            // "622222222714n2t1234j1245312342k3238e0238q5128o3238d023880187p3782l3187144445a2",
            // "6271n24t1234j1245312342k3238e0238q5128o3238d023880187p3782l3187144445a2"
            // "60234061212340212342123431234110234g1234c0135s3135h496880135j3a86t513522222233"
          ),
        },
      }}
    >
      {children}
    </BuilderContext.Provider>
  );
}

("622222222714n2t1234j1245312342k3238e0238q5128o3238d023880187p3782l3187144445a2");
