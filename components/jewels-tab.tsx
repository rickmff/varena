"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { toast } from 'sonner'
import spellData from "@/data/jewels"
import { EffectId } from "../data/effects"
import Image from "next/image"

export type SchoolKey = keyof typeof schoolsData;

export const schoolsData = {
  blood: { name: "Blood", image: "/images/schools/blood.png" },
  chaos: { name: "Chaos", image: "/images/schools/chaos.png" },
  unholy: { name: "Unholy", image: "/images/schools/unholy.png" },
  illusion: { name: "Illusion", image: "/images/schools/illusion.png" },
  frost: { name: "Frost", image: "/images/schools/frost.png" },
  lightning: { name: "Lightning", image: "/images/schools/lightning.png" }
} as const;

export type SchoolColors = typeof schoolColors;

export const schoolColors = {
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
    border: 'border-red-900/30',
    focus: 'focus:ring-red-500/50 focus:border-red-500/50',
    button: 'bg-purple-900/50 hover:bg-purple-800',
  },
  unholy: {
    primary: 'green',
    bg: 'bg-[url("/images/background/Unholy.png")]',
    border: 'border-red-900/30',
    focus: 'focus:ring-red-500/50 focus:border-red-500/50',
    button: 'bg-green-900/50 hover:bg-green-800',
  },
  illusion: {
    primary: 'blue',
    bg: 'bg-[url("/images/background/Illusion.png")]',
    border: 'border-red-900/30',
    focus: 'focus:ring-red-500/50 focus:border-red-500/50',
    button: 'bg-blue-900/50 hover:bg-blue-800',
  },
  frost: {
    primary: 'cyan',
    bg: 'bg-[url("/images/background/Frost.png")]',
    border: 'border-red-900/30',
    focus: 'focus:ring-red-500/50 focus:border-red-500/50',
    button: 'bg-cyan-900/50 hover:bg-cyan-800',
  },
  lightning: {
    primary: 'yellow',
    bg: 'bg-[url("/images/background/Lightning.png")]',
    border: 'border-red-900/30',
    focus: 'focus:ring-red-500/50 focus:border-red-500/50',
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

interface JewelTabProps {
  schoolColors: SchoolColors;
  onSchoolSelect: (school: string) => void;
}

export default function JewelTab({ schoolColors, onSchoolSelect }: JewelTabProps) {
  const [spellName, setSpellName] = useState('')
  const [selectedSchool, setSelectedSchool] = useState<SchoolKey | ''>('')
  const [selectedEffects, setSelectedEffects] = useState<EffectId[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isSchoolOpen, setIsSchoolOpen] = useState(false)

  const currentColors = selectedSchool ? schoolColors[selectedSchool] : schoolColors.default

  const inputClass = (baseClass: string) => `${baseClass} ${currentColors.border} ${currentColors.focus}`

  const toggleEffect = (effectId: EffectId) => {
    if (selectedEffects.includes(effectId)) {
      setSelectedEffects(selectedEffects.filter(id => id !== effectId))
    } else if (selectedEffects.length < 4) {
      setSelectedEffects([...selectedEffects, effectId])
    }
  }

  const copyCommand = async () => {
    try {
      const command = `.j ${spellName} ${selectedEffects.join(' ')}`
      await navigator.clipboard.writeText(command)
      toast.success('Command copied to clipboard!', {
        duration: 2000,
        position: 'top-center'
      })
    } catch (error) {
      toast.error('Failed to copy command')
    }
  }

  const handleSchoolSelect = (school: SchoolKey) => {
    setSelectedSchool(school)
    onSchoolSelect(school)
  }

  const canCopyJewel = spellName && selectedEffects.length > 0

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* School Selection */}
        <div className="relative">
          <button
            onClick={() => setIsSchoolOpen(!isSchoolOpen)}
            className={inputClass(`w-full bg-black/50 border rounded-md px-5 text-white focus:ring-2 transition-all flex items-center justify-between ${selectedSchool === '' ? 'py-6' : 'py-4'}`)}
          >
            {selectedSchool ? (
              <div className="flex items-center gap-2">
                <img
                  src={schoolsData[selectedSchool].image}
                  alt={schoolsData[selectedSchool].name}
                  className="w-10 h-10 object-cover rounded"
                />
                <span>{schoolsData[selectedSchool].name}</span>
              </div>
            ) : (
              <span>Select School</span>
            )}
            <svg
              className={`w-4 h-4 transition-transform ${isSchoolOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isSchoolOpen && (
            <div className={`absolute z-10 w-full mt-1 bg-black/90 border ${currentColors.border} rounded-md shadow-lg`}>
              {Object.entries(schoolsData).map(([key, school]) => (
                <button
                  key={key}
                  onClick={() => {
                    handleSchoolSelect(key as SchoolKey)
                    setSpellName('')
                    setSelectedEffects([])
                    setIsSchoolOpen(false)
                  }}
                  className={`w-full px-5 py-4 text-left text-white hover:${schoolColors[key as keyof typeof schoolColors].button} flex items-center gap-2`}
                >
                  <img
                    src={school.image}
                    alt={school.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                  <span>{school.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Spell Selection */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            disabled={!selectedSchool}
            className={inputClass(`w-full bg-black/50 border rounded-md px-5 text-white focus:ring-2 transition-all flex items-center justify-between ${spellName === '' ? 'py-6' : 'py-4'} ${!selectedSchool ? 'opacity-50 cursor-not-allowed' : ''}`)}
          >
            {spellName ? (
              <div className="flex items-center gap-2">
                <img
                  src={spellData[spellName].image ?? "/images/spells/fallback.jpg"}
                  alt={spellData[spellName].name}
                  className="w-10 h-10 object-cover rounded"
                />
                <span>{spellData[spellName].name}</span>
              </div>
            ) : (
              <span>Select Spell</span>
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
            <div className={`absolute z-10 w-full mt-1 bg-black/90 border ${currentColors.border} rounded-md shadow-lg max-h-96 overflow-y-auto`}>
              {Object.entries(spellData)
                .filter(([_, spell]) => !selectedSchool || spell.school === selectedSchool)
                .map(([key, spell]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSpellName(key)
                      setSelectedEffects([])
                      setIsOpen(false)
                    }}
                    className={`w-full px-5 py-4 text-left text-white hover:${currentColors.button} flex items-center gap-2`}
                  >
                    <Image
                      src={spell.image ?? "/images/spells/fallback.jpg"}
                      alt={spell.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <span>{spell.name}</span>
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>

      {spellName && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {spellData[spellName].effects.map((effect) => (
              <div
                key={effect.id}
                className={`flex items-center space-x-3 p-3 rounded-md transition-all cursor-pointer ${selectedEffects.includes(String(effect.id))
                  ? `${currentColors.button} border border-${currentColors.primary}-500/50`
                  : selectedEffects.length >= 4
                    ? `bg-black/20 border border-${currentColors.primary}-900/20 cursor-not-allowed opacity-50`
                    : `bg-black/30 border border-${currentColors.primary}-900/30 hover:bg-black/40`
                  }`}
                onClick={() => toggleEffect(String(effect.id))}
              >
                <label className="text-sm text-white cursor-pointer">
                  {effect.name}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedSchool && spellName && (
        <div className="flex flex-col items-center justify-center pt-6">
          <span className="text-gray-400/50 text-sm mb-2">Paste on your game chat:  </span>

          <div className={`bg-black px-4 py-2 rounded-md border w-full text-center ${currentColors.border}`}>
            <code className="text-gray-300 font-mono text-xl break-all bg-black/50 px-12 rounded-md">
              .j {spellName} {selectedEffects.join('')}
            </code>
          </div>
          <motion.div
            className="-pt-6 w-full"
            whileHover={{ scale: canCopyJewel ? 1.01 : 1 }}
            whileTap={{ scale: canCopyJewel ? 0.95 : 1 }}
          >
            <Button
              variant="outline"
              className={`w-full text-white relative overflow-hidden group border-${currentColors.primary}-900/70 ${canCopyJewel ? currentColors.button : 'bg-gray-700/50 cursor-not-allowed'} transition-colors`}
              onClick={copyCommand}
              disabled={!canCopyJewel}
            >
              <span className="relative z-10">COPY COMMAND</span>
              {canCopyJewel && (
                <motion.span
                  className="absolute inset-0 bg-white/10 z-0"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  )
}