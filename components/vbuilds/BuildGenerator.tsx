"use client";

import stats from "@/data/vbuilds/stats.json";
import BuildProvider from "@/components/vbuilds/BuildProvider";
import { GroupedStatList } from "@/components/vbuilds/GroupedStatList";
import { AmuletPicker } from "@/components/vbuilds/AmuletPicker";
import { ArmourPicker } from "@/components/vbuilds/ArmourPicker";
import { CoatingPicker } from "@/components/vbuilds/CoatingPicker";
import { ElixerPicker } from "./ElixirPicker";
import { PassiveForge } from "./PassiveForge";
import { SpellForge } from "./SpellForge";
import { WeaponForge } from "./WeaponForge";
import { BloodForge } from "./BloodForge";
import ArenaCode from "./components/ArenaCode";
import BuilderNavBar from "../BuilderNavBar";

export function loadBaseStats(statsArray: any): any {
  const statMap = {} as any;

  for (const stat of statsArray) {
    statMap[stat.name] = stat;
  }

  return statMap;
}

const BuilderPage = () => {
  const baseStats = loadBaseStats(stats);
  return (
    <BuildProvider stats={baseStats}>
      <BuilderNavBar />
      <div className="flex text-gray-400">
        <div className="w-3/4 pl-8 flex flex-col gap-8">
          <div>
            <div className="flex gap-8">
              <section>
                <h2 className="text-xl font-bold text-zinc-200 mb-4">Build</h2>
                <div className="flex gap-4">
                  <ArmourPicker />
                  <AmuletPicker />
                  <div className="relative w-20 h-20 bg-zinc-900 text-gray-200 rounded-md flex items-center justify-center overflow-hidden">
                    <img
                      src="/images/vbuilds/armour/bag-bat_leather_bag.webp"
                      alt="bag"
                      className={`pointer-events-none`}
                    />
                  </div>
                  <div className="relative w-20 h-20 bg-zinc-900 text-gray-200 rounded-md flex items-center justify-center overflow-hidden">
                    <img
                      src="/images/vbuilds/armour/cape-phantom_veil.webp"
                      alt="cape"
                      className={`pointer-events-none max-h-20`}
                    />
                  </div>
                </div>
              </section>
              <section>
                <h2 className="text-xl font-bold text-zinc-200 mb-4">Buffs</h2>
                <div className="flex gap-4">
                  <ElixerPicker />
                  <BloodForge />
                </div>
              </section>
            </div>
          </div>
          <div className="flex gap-8">
            <section>
              <h2 className="text-xl font-bold text-zinc-200 mb-4">Spells</h2>
              <SpellForge />
            </section>
            <section>
              <h2 className="text-xl font-bold text-zinc-200 mb-4">Passives</h2>
              <PassiveForge />
            </section>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-200">Weapons</h2>
            <WeaponForge />
            <div className="flex gap-4">
              <CoatingPicker slot={1} />
              <CoatingPicker slot={2} />
              <CoatingPicker slot={3} />
              <CoatingPicker slot={4} />
              <CoatingPicker slot={5} />
              <CoatingPicker slot={6} />
              <CoatingPicker slot={7} />
              <CoatingPicker slot={8} />
            </div>
          </div>
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-200">
              Use this build in V Arena
            </h2>
            <ArenaCode />
          </section>
        </div>
        {/* <div className="space-y-8 w/1-4"> */}
        {/* <div className="pr-12">
            <ArenaCode />
          </div> */}
        <div className="max-h-screen overflow-auto pr-8 flex-1 pb-44">
          <GroupedStatList stats={stats} />
        </div>
        {/* </div> */}
      </div>
    </BuildProvider>
  );
};

export default BuilderPage;
