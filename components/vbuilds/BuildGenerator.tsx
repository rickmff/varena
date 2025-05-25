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
    <div className="p-8  text-gray-200 flex">
      {/* <div className="absolute inset-0 bg-[url('/flower.png')] bg-cover bg-center grayscale -z-10 opacity-0"></div> */}
      <BuildProvider stats={baseStats}>
        <div className="w-3/4 pl-8 flex flex-col gap-8">
          <div>
            <div className="flex gap-8">
              <section>
                <h2 className="text-xl font-bold text-gray-100 mb-4">Build</h2>
                <div className="flex gap-4">
                  <ArmourPicker />
                  <AmuletPicker />
                  <div className="relative w-20 h-20 bg-gray-800 text-gray-200 rounded-md flex items-center justify-center overflow-hidden">
                    <img
                      src="/images/vbuilds/armour/bag-bat_leather_bag.webp"
                      alt="bag"
                      className={`pointer-events-none`}
                    />
                  </div>
                  <div className="relative w-20 h-20 bg-gray-800 text-gray-200 rounded-md flex items-center justify-center overflow-hidden">
                    <img
                      src="/images/vbuilds/armour/cape-phantom_veil.webp"
                      alt="cape"
                      className={`pointer-events-none max-h-20`}
                    />
                  </div>
                </div>
              </section>
              <section>
                <h2 className="text-xl font-bold text-gray-100 mb-4">Buffs</h2>
                <div className="flex gap-4">
                  <ElixerPicker />
                  <BloodForge />
                </div>
              </section>
            </div>
          </div>
          <div className="flex gap-8">
            <section>
              <h2 className="text-xl font-bold text-gray-100 mb-4">Spells</h2>
              <SpellForge />
            </section>
            <section>
              <h2 className="text-xl font-bold text-gray-100 mb-4">Passives</h2>
              <PassiveForge />
            </section>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-100">Weapons</h2>
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
        </div>
        <div className="space-y-8">
          <ArenaCode />
          <GroupedStatList stats={stats} />
        </div>
      </BuildProvider>
    </div>
  );
};

export default BuilderPage;
