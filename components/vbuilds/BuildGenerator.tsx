"use client";

import stats from "@/data/vbuilds/stats.json";
import BuildProvider from "@/components/vbuilds/BuildProvider";
import { GroupedStatList } from "@/components/vbuilds/GroupedStatList";
import { AmuletPicker } from "@/components/vbuilds/AmuletPicker";
import { ArmourPicker } from "@/components/vbuilds/ArmourPicker";
import { ElixerPicker } from "./ElixirPicker";
import { PassiveForge } from "./PassiveForge";
import { SpellForge } from "./SpellForge";
import { WeaponForge } from "./WeaponForge";
import { BloodForge } from "./BloodForge";
import ArenaCode from "./components/ArenaCode";
import BuilderNavBar from "../BuilderNavBar";
import {
  SingleCoating,
  AdvancedCoatings,
  AdvancedCoatingsSwitch,
} from "@/components/vbuilds/CoatingPicker";

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
        <div className="w-8/12 pl-8 flex flex-col gap-8">
          <div>
            <div className="flex gap-8">
              <section>
                <h3 className="text-lg font-semibold mb-3 text-red-400 flex items-center">
                  <span className="mr-2">Build</span>
                </h3>
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
                <h3 className="text-lg font-semibold mb-3 text-red-400 flex items-center">
                  <span className="mr-2">Buffs</span>
                </h3>
                <div className="flex gap-4">
                  <ElixerPicker />
                  <BloodForge />
                  <SingleCoating />
                </div>
              </section>
            </div>
          </div>
          <div className="flex gap-8">
            <section>
              <h3 className="text-lg font-semibold mb-3 text-red-400 flex items-center">
                <span className="mr-2">Spells</span>
              </h3>
              <SpellForge />
            </section>
            <section>
              <h3 className="text-lg font-semibold mb-3 text-red-400 flex items-center">
                <span className="mr-2">Passives</span>
              </h3>
              <PassiveForge />
            </section>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-3 text-red-400 flex items-center">
              <span className="mr-2">Weapons</span>
              <div className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full">
                Use keys 1-8 to focus weapon stats
              </div>
            </h3>
            <WeaponForge />
            <AdvancedCoatings />
            <AdvancedCoatingsSwitch />
          </div>
          <section className="space-y-4">
            <h3 className="text-lg font-semibold mb-3 text-red-400 flex items-center">
              <span className="mr-2">Use this build in V Arena</span>
            </h3>
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
