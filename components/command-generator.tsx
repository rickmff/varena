"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useState } from "react"
import { toast } from 'sonner'
import JewelTab from "./jewels-tab"

export const effectsData = {
  1: "AS",
  2: "Damage Reduction",
  3: "Max Health",
  4: "Movement Speed",
  5: "Phys Crit Chance",
  6: "Phys Crit Damage",
  7: "Weapon Skill Cooldown Recovery Rate",
  8: "Spell Crit Chance",
  9: "Spell Crit Damage",
  A: "Spell Skill Cooldown Recovery Rate",
  B: "Spell Power",
  C: "Spell Leech",
  D: "Resource Yield"
} as const;

export type EffectId = keyof typeof effectsData;

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6 },
  },
}

const schoolColors = {
  blood: {
    primary: 'red',
    bg: 'bg-[url("/images/background/Blood.png")]',
    border: 'border-red-900/30',
    focus: 'focus:ring-red-500/50 focus:border-red-500/50',
    button: 'bg-red-900/50 hover:bg-red-800',
  },
  chaos: {
    primary: 'purple',
    bg: 'bg-[url("/images/background/Chaos.png")]',
    border: 'border-purple-900/30',
    focus: 'focus:ring-purple-500/50 focus:border-purple-500/50',
    button: 'bg-purple-900/50 hover:bg-purple-800',
  },
  unholy: {
    primary: 'green',
    bg: 'bg-[url("/images/background/Unholy.png")]',
    border: 'border-green-900/30',
    focus: 'focus:ring-green-500/50 focus:border-green-500/50',
    button: 'bg-green-900/50 hover:bg-green-800',
  },
  illusion: {
    primary: 'blue',
    bg: 'bg-[url("/images/background/Illusion.png")]',
    border: 'border-blue-900/30',
    focus: 'focus:ring-blue-500/50 focus:border-blue-500/50',
    button: 'bg-blue-900/50 hover:bg-blue-800',
  },
  frost: {
    primary: 'cyan',
    bg: 'bg-[url("/images/background/Frost.png")]',
    border: 'border-cyan-900/30',
    focus: 'focus:ring-cyan-500/50 focus:border-cyan-500/50',
    button: 'bg-cyan-900/50 hover:bg-cyan-800',
  },
  lightning: {
    primary: 'yellow',
    bg: 'bg-[url("/images/background/Lightning.png")]',
    border: 'border-yellow-900/30',
    focus: 'focus:ring-yellow-500/50 focus:border-yellow-500/50',
    button: 'bg-yellow-600/50 hover:bg-yellow-600',
  },
  default: {
    primary: 'red',
    bg: 'bg-black/50',
    border: 'border-red-900/30',
    focus: 'focus:ring-red-500/50 focus:border-red-500/50',
    button: 'bg-red-900/50 hover:bg-red-800',
  }
} as const;

export default function CommandGenerator() {
  const [activeTab, setActiveTab] = useState(0)
  const [selectedSchool, setSelectedSchool] = useState<string>('')

  // Artifact Weapons
  const [artifactWeapons, setArtifactWeapons] = useState<string[]>(['', '', ''])

  // Legendary Weapons
  const [legendaryWeapon, setLegendaryWeapon] = useState('')
  const [legendaryInfuse, setLegendaryInfuse] = useState('')
  const [selectedEffects, setSelectedEffects] = useState<EffectId[]>([])

  const currentColors = selectedSchool ? schoolColors[selectedSchool as keyof typeof schoolColors] : schoolColors.default

  const handleArtifactWeaponChange = (index: number, value: string) => {
    const newWeapons = [...artifactWeapons]
    newWeapons[index] = value
    setArtifactWeapons(newWeapons)
  }

  const toggleEffect = (effectId: EffectId) => {
    if (selectedEffects.includes(effectId)) {
      setSelectedEffects(selectedEffects.filter(id => id !== effectId));
    } else if (selectedEffects.length < 4) {
      setSelectedEffects([...selectedEffects, effectId]);
    }
  }

  return (
    <motion.div
      className="p-4"
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <div className={`${currentColors.bg} max-w-4xl mx-auto rounded-lg border border-red-900/30 p-6 min-h-[600px] backdrop-blur-sm`}>
        <div className="flex gap-2 mb-6">
          {["Artifact", "Legendary", "Jewel"].map((tab, index) => (
            <motion.button
              key={tab}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === index
                ? "bg-red-900/50 text-white"
                : "text-gray-400 hover:text-white"
                }`}
              onClick={() => setActiveTab(index)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tab}
            </motion.button>
          ))}
        </div>

        <div className="space-y-4">
          {activeTab === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["First Weapon", "Second Weapon", "Third Weapon"].map((label, index) => (
                  <select
                    key={index}
                    className="bg-black/50 border border-red-900/30 rounded-md px-3 py-2 text-white focus:ring-red-500/50 focus:border-red-500/50"
                    onChange={(e) => handleArtifactWeaponChange(index, e.target.value)}
                  >
                    <option value="">{label}</option>
                    {["Slashers", "Spear", "Axe", "Greatsword", "Crossbow", "Pistols",
                      "Reaper", "Sword", "Mace", "Whip", "Longbow"].map(weapon => (
                        <option key={weapon} value={weapon.toLowerCase()}>{weapon}</option>
                      ))}
                  </select>
                ))}
              </div>
              <div className="bg-black/30 p-4 rounded-md">
                <code className="text-gray-300">.aw {artifactWeapons.join(' ')}</code>
              </div>
            </div>
          )}

          {activeTab === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  className="bg-black/50 border border-red-900/30 rounded-md px-3 py-2 text-white focus:ring-red-500/50 focus:border-red-500/50"
                  onChange={(e) => setLegendaryWeapon(e.target.value)}
                >
                  <option value="">Select Weapon</option>
                  {["Slashers", "Spear", "Axe", "Greatsword", "Crossbow", "Pistols",
                    "Reaper", "Sword", "Mace", "Whip", "Longbow"].map(weapon => (
                      <option key={weapon} value={weapon.toLowerCase()}>{weapon}</option>
                    ))}
                </select>
                <select
                  className="bg-black/50 border border-red-900/30 rounded-md px-3 py-2 text-white focus:ring-red-500/50 focus:border-red-500/50"
                  onChange={(e) => setLegendaryInfuse(e.target.value)}
                >
                  <option value="">Select Infuse</option>
                  {["Blood", "Chaos", "Frost", "Illusion", "Storm", "Unholy"].map(infuse => (
                    <option key={infuse} value={infuse.toLowerCase()}>{infuse}</option>
                  ))}
                </select>
                <div className="col-span-2 grid grid-cols-4 gap-2">
                  {(Object.entries(effectsData) as [EffectId, string][]).map(([id, effect]) => (
                    <button
                      key={id}
                      className={`p-2 rounded-md text-xs ${selectedEffects.includes(id as EffectId)
                        ? "bg-red-900/50 text-white"
                        : "bg-black/50 text-gray-400 hover:text-white"
                        }`}
                      onClick={() => toggleEffect(id as EffectId)}
                    >
                      {effect}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-black/30 p-4 rounded-md">
                <code className="text-gray-300">.lw {legendaryWeapon} {legendaryInfuse} {selectedEffects.join('')}</code>
              </div>
            </div>
          )}

          {activeTab === 2 && <JewelTab schoolColors={schoolColors} onSchoolSelect={setSelectedSchool} />}
        </div>
      </div>
    </motion.div>
  )
}