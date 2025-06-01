"use client";

import stats from "@/data/vbuilds/stats.json";
import { useBuilder } from "@/components/vbuilds/BuildProvider";
import { GroupedStatList } from "@/components/vbuilds/GroupedStatList";
import { AmuletPicker } from "@/components/vbuilds/AmuletPicker";
import { ArmourPicker } from "@/components/vbuilds/ArmourPicker";
import { ElixerPicker } from "./ElixirPicker";
import { PassiveForge } from "./PassiveForge";
import { SpellForge } from "./SpellForge";
import { WeaponForge } from "./WeaponForge";
import { BloodForge } from "./BloodForge";
import BuilderNavBar from "../BuilderNavBar";
import {
  SingleCoating,
  AdvancedCoatings,
  AdvancedCoatingsSwitch,
} from "@/components/vbuilds/CoatingPicker";
import ArenaCode, {
  SearchParamsBuildCodeUpdater,
} from "./components/ArenaCode";

const BuilderPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-grey-950 via-grey-900 to-grey-950 relative overflow-hidden">
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.007)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.007)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

      {/* Ambient glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

      <BuilderNavBar />

      <div className="relative max-w-screen-2xl mx-auto flex flex-col lg:flex-row text-grey-300 p-3 sm:p-4 lg:p-6 gap-4 lg:gap-6">
        {/* Main Content Area */}
        <div className="flex-1 space-y-6 lg:space-y-8">
          {/* Build Section */}
          <div className="bg-grey-900/40  border border-grey-700/50 rounded-xl p-4 sm:p-6 shadow-2xl hover:border-grey-600/50 transition-all duration-300">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              <section className="flex-1">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-1 h-6 bg-gradient-to-b from-red-400 to-red-600 rounded-full" />
                  <h3 className="text-lg sm:text-xl font-bold text-grey-100 tracking-wide">
                    BUILD
                  </h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-grey-600 to-transparent" />
                </div>
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  <div className="group">
                    <ArmourPicker />
                  </div>
                  <div className="group">
                    <AmuletPicker />
                  </div>
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-grey-800/60 border border-grey-600/50 rounded-lg flex items-center justify-center overflow-hidden group hover:border-grey-500/70 transition-all duration-200 hover:shadow-lg hover:shadow-grey-900/50">
                    <img
                      src="/images/vbuilds/armour/bag-bat_leather_bag.webp"
                      alt="bag"
                      className="pointer-events-none group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-grey-800/60 border border-grey-600/50 rounded-lg flex items-center justify-center overflow-hidden group hover:border-grey-500/70 transition-all duration-200 hover:shadow-lg hover:shadow-grey-900/50">
                    <img
                      src="/images/vbuilds/armour/cape-phantom_veil.webp"
                      alt="cape"
                      className="pointer-events-none max-h-16 sm:max-h-20 group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                </div>
              </section>

              <section className="flex-1">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-1 h-6 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full" />
                  <h3 className="text-lg sm:text-xl font-bold text-grey-100 tracking-wide">
                    BUFFS
                  </h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-grey-600 to-transparent" />
                </div>
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  <ElixerPicker />
                  <BloodForge />
                  <SingleCoating />
                </div>
              </section>
            </div>
          </div>

          {/* Spells & Passives Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            <section className="bg-grey-900/40  border border-grey-700/50 rounded-xl p-4 sm:p-6 shadow-2xl hover:border-grey-600/50 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-1 h-6 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full" />
                <h3 className="text-lg sm:text-xl font-bold text-grey-100 tracking-wide">
                  SPELLS
                </h3>
                <div className="flex-1 h-px bg-gradient-to-r from-grey-600 to-transparent" />
              </div>
              <SpellForge />
            </section>

            <section className="bg-grey-900/40  border border-grey-700/50 rounded-xl p-4 sm:p-6 shadow-2xl hover:border-grey-600/50 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-1 h-6 bg-gradient-to-b from-green-400 to-green-600 rounded-full" />
                <h3 className="text-lg sm:text-xl font-bold text-grey-100 tracking-wide">
                  PASSIVES
                </h3>
                <div className="flex-1 h-px bg-gradient-to-r from-grey-600 to-transparent" />
              </div>
              <PassiveForge />
            </section>
          </div>

          {/* Weapons Section */}
          <div className="bg-grey-900/40  border border-grey-700/50 rounded-xl p-4 sm:p-6 shadow-2xl hover:border-grey-600/50 transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full" />
                <h3 className="text-lg sm:text-xl font-bold text-grey-100 tracking-wide">
                  WEAPONS
                </h3>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs px-3 py-1.5 rounded-full font-medium  w-fit">
                Use keys 1-8 to focus weapon stats
              </div>
              <div className="hidden sm:block flex-1 h-px bg-gradient-to-r from-grey-600 to-transparent" />
            </div>
            <div className="space-y-4">
              <WeaponForge />
              <AdvancedCoatings />
              <AdvancedCoatingsSwitch />
            </div>
          </div>
        </div>

        {/* Sidebar - Mobile: Full width below content, Desktop: Fixed sidebar */}
        <div className="w-full lg:w-1/3 space-y-4 lg:space-y-6 order-first lg:order-last">
          {/* Stats Panel */}
          <div className="bg-grey-900/40  border border-grey-700/50 rounded-xl shadow-2xl overflow-hidden">
            <div className="p-3 sm:p-4 border-b border-grey-700/50 bg-grey-800/30">
              <div className="flex items-center gap-3">
                <div className="w-1 h-5 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full" />
                <h3 className="text-base sm:text-lg font-bold text-grey-100 tracking-wide">
                  STATISTICS
                </h3>
                <div className="flex-1 h-px bg-gradient-to-r from-grey-600 to-transparent" />
              </div>
            </div>
            <div className="max-h-[300px] sm:max-h-[500px] lg:max-h-[calc(100vh-300px)] overflow-auto p-3 sm:p-4 custom-scrollbar">
              <GroupedStatList stats={stats} />
            </div>
          </div>
        </div>
      </div>
      <SearchParamsBuildCodeUpdater />
    </div>
  );
};

export default BuilderPage;
