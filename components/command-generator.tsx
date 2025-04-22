"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import JewelTab, { schoolColors } from "./jewels-tab"
import { epicWeapons, EpicWeapon } from "../public/images/weapons/epicWeapon"

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

export default function CommandGenerator() {
  const [activeTab, setActiveTab] = useState(0)
  const [selectedSchool, setSelectedSchool] = useState<keyof typeof schoolColors>('default')

  // Artifact Weapons
  const [artifactWeapons, setArtifactWeapons] = useState<string[]>(['', '', ''])

  // Legendary Weapons
  const [legendaryWeapon, setLegendaryWeapon] = useState<string>('')
  const [legendaryInfuse, setLegendaryInfuse] = useState('')
  const [selectedEffects, setSelectedEffects] = useState<EffectId[]>([])

  const [selectedEpicWeapon, setSelectedEpicWeapon] = useState<EpicWeapon | ''>('')
  const [isOpen, setIsOpen] = useState(false)

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
      <div className={`${activeTab === 2 ? (selectedSchool ? schoolColors[selectedSchool].bg : 'bg-black/50') : 'bg-black/50'} max-w-4xl mx-auto rounded-lg border border-red-900/30 p-6 min-h-[600px] backdrop-blur-sm shadow-lg`}>
        <div className="relative flex justify-center gap-8 mb-8">
          {["Artifact", "Legendary", "Jewel"].map((tab, index) => (
            <motion.button
              key={tab}
              className={`relative px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === index
                ? `text-white`
                : "text-gray-400 hover:text-white"
                }`}
              onClick={() => setActiveTab(index)}
              whileTap={{ scale: 0.7 }}
            >
              {activeTab === index && (
                <>
                  <motion.div
                    className={`absolute inset-0 ${schoolColors.blood.button} rounded-full`}
                    layoutId="activeTab"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                </>
              )}
              <span className="relative z-10 flex items-center gap-2">
                {tab}
                {activeTab === index && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
                    className="w-2 h-2 rounded-full bg-white"
                  />
                )}
              </span>
            </motion.button>
          ))}
        </div>

        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {activeTab === 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Epic Weapon Selection */}

                <div className="relative">
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full bg-black/50 border rounded-md px-5 text-white focus:ring-2 transition-all flex items-center justify-between ${selectedEpicWeapon === '' ? 'py-6' : 'py-4'}`}
                  >
                    {selectedEpicWeapon ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={selectedEpicWeapon ? epicWeapons[selectedEpicWeapon].src : ''}
                          alt={selectedEpicWeapon}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <span>{selectedEpicWeapon}</span>
                      </div>
                    ) : (
                      <span>Select Epic Weapon</span>
                    )}
                    <svg
                      className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-black/90 border border-red-900/30 rounded-md shadow-lg">
                      {Object.entries(epicWeapons).map(([key, image]) => (
                        <button
                          key={key}
                          onClick={() => {
                            setSelectedEpicWeapon(key as EpicWeapon)
                            setIsOpen(false)
                          }}
                          className="w-full px-5 py-4 text-left text-white hover:bg-red-800 flex items-center gap-2"
                        >
                          <img
                            src={image.src}
                            alt={key}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <span>{key}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {["First Weapon", "Second Weapon", "Third Weapon"].map((label, index) => (
                    <select
                      key={index}
                      className={`bg-black/50 border border-red-900/30 rounded-md px-3 py-2 text-white ${schoolColors.blood.focus} transition-colors`}
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
              </div>
              <div className={`bg-black/30 p-4 rounded-md border border-red-900/30`}>
                <code className="text-gray-300 font-mono text-sm">.aw {artifactWeapons.join(' ')}</code>
              </div>
            </div>
          )}

          {activeTab === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Legendary Weapon Selection */}
                <div className="relative">
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full bg-black/50 border rounded-md px-5 text-white focus:ring-2 transition-all flex items-center justify-between ${legendaryWeapon === '' ? 'py-6' : 'py-4'}`}
                  >
                    {legendaryWeapon ? (
                      <span>{legendaryWeapon}</span>
                    ) : (
                      <span>Select Legendary Weapon</span>
                    )}
                    <svg
                      className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-black/90 border border-red-900/30 rounded-md shadow-lg">
                      {["Slashers", "Spear", "Axe", "Greatsword", "Crossbow", "Pistols",
                        "Reaper", "Sword", "Mace", "Whip", "Longbow"].map(weapon => (
                          <button
                            key={weapon}
                            onClick={() => {
                              setLegendaryWeapon(weapon)
                              setIsOpen(false)
                            }}
                            className="w-full px-5 py-4 text-left text-white hover:bg-red-800"
                          >
                            {weapon}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
                <select
                  className={`bg-black/50 border border-red-900/30 rounded-md px-3 py-2 text-white ${schoolColors.blood.focus} transition-colors`}
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
                      className={`p-2 rounded-md text-xs transition-colors ${selectedEffects.includes(id as EffectId)
                        ? `${schoolColors.blood.button} text-white shadow-md`
                        : "bg-black/50 text-gray-400 hover:text-white"
                        }`}
                      onClick={() => toggleEffect(id as EffectId)}
                    >
                      {effect}
                    </button>
                  ))}
                </div>
              </div>
              <div className={`bg-black/30 p-4 rounded-md border border-red-900/30`}>
                <code className="text-gray-300 font-mono text-sm">.lw {legendaryWeapon} {legendaryInfuse} {selectedEffects.join('')}</code>
              </div>
            </div>
          )}

          {activeTab === 2 && <JewelTab schoolColors={schoolColors} onSchoolSelect={(school) => setSelectedSchool(school as keyof typeof schoolColors)} />}
        </motion.div>
      </div>
    </motion.div>
  )
}